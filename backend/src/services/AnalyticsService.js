// Analytics aggregations. Two surfaces:
//   - learnerAnalytics: deeper personal view (difficulty by exercise the user
//     has seen, response-time trend, error-tag breakdown, mastery distribution).
//   - adminAnalytics: cohort-level per-exercise difficulty, per-module rollups,
//     daily attempt volume, content-author signals.
//
// Both rely on listAttemptsForUser / listAttemptsSince + exerciseStatsSince
// added to the store. No new tables — pure roll-ups.

import { getStore } from '../config/db.js';
import { getMasteryMap } from './MasteryService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function fillDays(seriesMap, days) {
  const out = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    const row = seriesMap.get(key) || { attempts: 0, correct: 0 };
    out.push({ date: key, attempts: row.attempts, correct: row.correct });
  }
  return out;
}

export async function learnerAnalytics({ userId, days = 30 }) {
  const store = getStore();
  const cutoff = Date.now() - days * DAY_MS;
  const attempts = await store.listAttemptsForUser(userId, { limit: 2000 });
  const windowed = attempts.filter((a) => new Date(a.created_at).getTime() >= cutoff);

  // Daily series.
  const series = new Map();
  for (const a of windowed) {
    const k = dayKey(a.created_at);
    if (!series.has(k)) series.set(k, { attempts: 0, correct: 0 });
    const row = series.get(k);
    row.attempts += 1;
    if (a.correct) row.correct += 1;
  }

  // Error-tag breakdown (windowed, incorrect only).
  const errorCounts = {};
  for (const a of windowed) {
    if (a.correct) continue;
    for (const t of a.error_tags || []) {
      errorCounts[t] = (errorCounts[t] || 0) + 1;
    }
  }

  // Per-exercise difficulty (this user only). Surface up to 20 toughest items
  // among those the learner has attempted ≥2 times.
  const byEx = new Map();
  for (const a of attempts) {
    if (!a.exercise_id) continue;
    let g = byEx.get(a.exercise_id);
    if (!g) {
      g = {
        exercise_id: a.exercise_id,
        attempts: 0,
        correct: 0,
        responseSum: 0,
        responseN: 0,
        lastSeenAt: a.created_at,
      };
      byEx.set(a.exercise_id, g);
    }
    g.attempts += 1;
    if (a.correct) g.correct += 1;
    if (typeof a.response_ms === 'number') {
      g.responseSum += a.response_ms;
      g.responseN += 1;
    }
    if (new Date(a.created_at) > new Date(g.lastSeenAt)) g.lastSeenAt = a.created_at;
  }
  const toughest = [...byEx.values()]
    .filter((g) => g.attempts >= 2)
    .map((g) => ({
      exerciseId: g.exercise_id,
      attempts: g.attempts,
      accuracy: g.correct / g.attempts,
      avgResponseMs: g.responseN ? g.responseSum / g.responseN : null,
      lastSeenAt: g.lastSeenAt,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, 20);

  // Response-time trend: per-day average, only from correct attempts to
  // exclude give-ups skewing the curve.
  const rtByDay = new Map();
  for (const a of windowed) {
    if (!a.correct || typeof a.response_ms !== 'number') continue;
    const k = dayKey(a.created_at);
    if (!rtByDay.has(k)) rtByDay.set(k, { sum: 0, n: 0 });
    const r = rtByDay.get(k);
    r.sum += a.response_ms;
    r.n += 1;
  }
  const responseTrend = [...rtByDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, r]) => ({ date, avgResponseMs: r.sum / r.n }));

  // Mastery distribution.
  const masteryMap = await getMasteryMap(userId);
  const masteryByLevel = [0, 1, 2, 3, 4, 5].map((lvl) => ({
    level: lvl,
    count: [...masteryMap.values()].filter((m) => m.level === lvl).length,
  }));

  const totalsWindow = windowed.length;
  const totalsCorrect = windowed.filter((a) => a.correct).length;
  return {
    window: { days, since: new Date(cutoff).toISOString() },
    totals: {
      attempts: totalsWindow,
      correct: totalsCorrect,
      accuracy: totalsWindow ? totalsCorrect / totalsWindow : 0,
    },
    daily: fillDays(series, days),
    errorTagCounts: errorCounts,
    toughestExercises: toughest,
    responseTimeTrend: responseTrend,
    masteryByLevel,
  };
}

export async function adminAnalytics({ days = 30 }) {
  const store = getStore();
  const since = new Date(Date.now() - days * DAY_MS);
  const attempts = await store.listAttemptsSince({ since, limit: 100_000 });

  // Daily series (cohort-wide).
  const series = new Map();
  for (const a of attempts) {
    const k = dayKey(a.created_at);
    if (!series.has(k)) series.set(k, { attempts: 0, correct: 0 });
    const row = series.get(k);
    row.attempts += 1;
    if (a.correct) row.correct += 1;
  }

  // Per-exercise stats with calibration signal.
  const exStats = await store.exerciseStatsSince({ since, limit: 200 });
  const enriched = exStats.map((row) => {
    const accuracy = row.attempts ? row.correct / row.attempts : 0;
    let signal = 'ok';
    if (row.attempts >= 5 && accuracy <= 0.25) signal = 'too_hard';
    else if (row.attempts >= 10 && accuracy >= 0.95) signal = 'too_easy';
    else if (row.attempts >= 5 && accuracy <= 0.45) signal = 'hard';
    return {
      exerciseId: row.exercise_id,
      prompt: row.prompt,
      type: row.type,
      moduleSlug: row.module_slug,
      attempts: row.attempts,
      correct: row.correct,
      accuracy,
      avgResponseMs: row.avg_response_ms,
      calibrationSignal: signal,
    };
  });

  // Per-module rollups (computed from enriched).
  const byModule = new Map();
  for (const e of enriched) {
    const key = e.moduleSlug || '__unassigned__';
    if (!byModule.has(key)) {
      byModule.set(key, {
        moduleSlug: key,
        attempts: 0,
        correct: 0,
        items: 0,
        tooHard: 0,
        tooEasy: 0,
      });
    }
    const m = byModule.get(key);
    m.attempts += e.attempts;
    m.correct += e.correct;
    m.items += 1;
    if (e.calibrationSignal === 'too_hard') m.tooHard += 1;
    if (e.calibrationSignal === 'too_easy') m.tooEasy += 1;
  }
  const moduleRollup = [...byModule.values()]
    .map((m) => ({
      ...m,
      accuracy: m.attempts ? m.correct / m.attempts : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts);

  // Active learners.
  const learners = new Set();
  for (const a of attempts) learners.add(a.user_id);

  // Calibration follow-ups: items needing author review.
  const followups = enriched
    .filter((e) => e.calibrationSignal === 'too_hard' || e.calibrationSignal === 'too_easy')
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 50);

  return {
    window: { days, since: since.toISOString() },
    totals: {
      attempts: attempts.length,
      correct: attempts.filter((a) => a.correct).length,
      activeLearners: learners.size,
      itemsObserved: enriched.length,
    },
    daily: fillDays(series, days),
    moduleRollup,
    exerciseDifficulty: enriched
      .slice()
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
      .slice(0, 50),
    calibrationFollowups: followups,
  };
}
