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
import { getSrsMap } from './SrsService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MATURE_INTERVAL_DAYS = 21; // SRS items spaced ≥3 weeks are "mature"

function dayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

// Retention from practice activity. Takes a set of YYYY-MM-DD day keys on which
// the learner practiced and returns the habit signals that matter for a
// lifestyle tool (the NSM is "days with practice", not MAU):
//   - activeDays: distinct practice days
//   - currentStreak / longestStreak: consecutive practice days
//   - d1ComebackRate: of practice days that had a chance for a next day,
//     fraction followed by practice the very next day
//   - d7ComebackRate: of practice days that had a full 7-day chance, fraction
//     that saw any practice within the following 7 days
// Recent days that haven't had their full follow-up window yet are excluded
// from the denominators so the rates aren't artificially depressed.
function computeRetention(dayKeys, now = new Date()) {
  const days = [...dayKeys].sort();
  const activeDays = days.length;
  const has = (k) => dayKeys.has(k);
  const addDays = (key, n) => {
    const d = new Date(key + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const todayKey = new Date(now).toISOString().slice(0, 10);

  // Streaks.
  let longestStreak = 0;
  let run = 0;
  let prev = null;
  for (const k of days) {
    if (prev && addDays(prev, 1) === k) run += 1;
    else run = 1;
    if (run > longestStreak) longestStreak = run;
    prev = k;
  }
  // Current streak: walk back from today (or yesterday) while days are present.
  let currentStreak = 0;
  let cursor = has(todayKey) ? todayKey : addDays(todayKey, -1);
  while (has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  // D1 / D7 comeback rates.
  let d1Num = 0;
  let d1Den = 0;
  let d7Num = 0;
  let d7Den = 0;
  for (const k of days) {
    if (addDays(k, 1) <= todayKey) {
      d1Den += 1;
      if (has(addDays(k, 1))) d1Num += 1;
    }
    if (addDays(k, 7) <= todayKey) {
      d7Den += 1;
      for (let n = 1; n <= 7; n++) {
        if (has(addDays(k, n))) { d7Num += 1; break; }
      }
    }
  }

  return {
    activeDays,
    currentStreak,
    longestStreak,
    d1ComebackRate: d1Den ? d1Num / d1Den : null,
    d7ComebackRate: d7Den ? d7Num / d7Den : null,
  };
}

// Response time as a learning signal. Speed on correct answers is a fluency /
// automaticity proxy: recall that's both fast AND correct is becoming automatic,
// while slow-correct is effortful retrieval and fast-wrong is guessing. We split
// every timed attempt into a speed×accuracy quadrant and surface an
// automaticity rate (fast-correct ÷ all correct).
const FAST_MS = 6000; // ≤6s on a correct answer ≈ automatic recall

function responseTimeStats(attempts, fastMs = FAST_MS) {
  const timed = attempts.filter(
    (a) => typeof a.response_ms === 'number' && a.response_ms >= 0
  );
  const speedAccuracy = { fastCorrect: 0, slowCorrect: 0, fastWrong: 0, slowWrong: 0 };
  if (!timed.length) {
    return {
      count: 0,
      avgMs: null,
      medianMs: null,
      avgCorrectMs: null,
      avgWrongMs: null,
      automaticityRate: null,
      fastThresholdMs: fastMs,
      speedAccuracy,
    };
  }
  const avg = (arr) =>
    arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;
  const all = timed.map((a) => a.response_ms).sort((x, y) => x - y);
  const mid = Math.floor(all.length / 2);
  const median = all.length % 2 ? all[mid] : Math.round((all[mid - 1] + all[mid]) / 2);
  const correct = timed.filter((a) => a.correct).map((a) => a.response_ms);
  const wrong = timed.filter((a) => !a.correct).map((a) => a.response_ms);
  for (const a of timed) {
    const fast = a.response_ms <= fastMs;
    if (a.correct) speedAccuracy[fast ? 'fastCorrect' : 'slowCorrect'] += 1;
    else speedAccuracy[fast ? 'fastWrong' : 'slowWrong'] += 1;
  }
  return {
    count: timed.length,
    avgMs: avg(all),
    medianMs: median,
    avgCorrectMs: avg(correct),
    avgWrongMs: avg(wrong),
    automaticityRate: correct.length ? speedAccuracy.fastCorrect / correct.length : null,
    fastThresholdMs: fastMs,
    speedAccuracy,
  };
}

// Forgetting / leeches from the per-item SRS state. Lapses (a previously-known
// item answered wrong) are the clearest "I forgot this" signal. We surface the
// worst offenders ("leeches"), how much is in active relearn, what's due now,
// and how much has reached a mature (long) interval.
function computeForgetting(srsRows, now = Date.now()) {
  const rows = Array.isArray(srsRows) ? srsRows : [];
  const lapsesOf = (r) => Number(r.lapses) || 0;
  const dueMs = (r) => (r.due_at ? new Date(r.due_at).getTime() : 0);
  const totalLapses = rows.reduce((s, r) => s + lapsesOf(r), 0);
  const leeches = rows
    .filter((r) => lapsesOf(r) >= 2)
    .sort((a, b) => lapsesOf(b) - lapsesOf(a))
    .slice(0, 10)
    .map((r) => ({
      exerciseId: r.exercise_id,
      lapses: lapsesOf(r),
      intervalDays: Number(r.interval_days) || 0,
      ease: Number(r.ease) || null,
    }));
  return {
    trackedItems: rows.length,
    totalLapses,
    itemsInRelearn: rows.filter((r) => lapsesOf(r) > 0 && (Number(r.repetitions) || 0) === 0).length,
    dueNow: rows.filter((r) => dueMs(r) <= now).length,
    matureItems: rows.filter((r) => (Number(r.interval_days) || 0) >= MATURE_INTERVAL_DAYS).length,
    leeches,
  };
}

// Average response time per skill — which skills are fast (fluent) vs slow
// (effortful). Drawn from timed attempts' skill_tags.
function responseTimeBySkill(attempts, limit = 10) {
  const by = new Map();
  for (const a of attempts) {
    if (typeof a.response_ms !== 'number' || a.response_ms < 0) continue;
    for (const skill of a.skill_tags || []) {
      if (!by.has(skill)) by.set(skill, { sum: 0, n: 0, correct: 0 });
      const g = by.get(skill);
      g.sum += a.response_ms;
      g.n += 1;
      if (a.correct) g.correct += 1;
    }
  }
  return [...by.entries()]
    .map(([skill, g]) => ({
      skill,
      attempts: g.n,
      avgMs: Math.round(g.sum / g.n),
      accuracy: g.correct / g.n,
    }))
    .filter((r) => r.attempts >= 2)
    .sort((a, b) => b.avgMs - a.avgMs)
    .slice(0, limit);
}

// Sentence-error breakdown scoped to free-text/sentence exercises. MC answers
// can only be attributed to the question's topic, but text answers get the fine
// classification (tense, particle, syntax, conjugation, spacing, romanization…).
// This isolates *where the learner errs when producing Korean*, separate from
// the mixed errorTagCounts. Counts only attempts whose exercise_type is a text
// type (older attempts predate exercise_type and are skipped).
const TEXT_TYPES = new Set(['translation', 'fill_blank']);
function sentenceErrorBreakdown(attempts) {
  const byTag = {};
  let textAttempts = 0;
  let textWrong = 0;
  for (const a of attempts) {
    if (!TEXT_TYPES.has(a.exercise_type)) continue;
    textAttempts += 1;
    if (a.correct) continue;
    textWrong += 1;
    for (const t of a.error_tags || []) byTag[t] = (byTag[t] || 0) + 1;
  }
  return { textAttempts, textWrong, byTag };
}

// Review forecast: how many SRS items come due, bucketed, so the learner has a
// return hook ("3 items due tomorrow"). Buckets are by UTC calendar day.
function computeForecast(srsRows, now = Date.now()) {
  const rows = Array.isArray(srsRows) ? srsRows : [];
  const startOfToday = (() => {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const endOfToday = startOfToday + DAY_MS;
  const endOfTomorrow = startOfToday + 2 * DAY_MS;
  const endOf7 = startOfToday + 7 * DAY_MS;
  let overdue = 0;
  let today = 0;
  let tomorrow = 0;
  let next7 = 0;
  for (const r of rows) {
    const due = r.due_at ? new Date(r.due_at).getTime() : null;
    if (due == null) continue;
    if (due < startOfToday) overdue += 1;
    else if (due < endOfToday) today += 1;
    else if (due < endOfTomorrow) tomorrow += 1;
    else if (due < endOf7) next7 += 1;
  }
  return { overdue, today, tomorrow, next7Days: next7, dueNow: overdue + today };
}

export const _internals = {
  computeRetention,
  responseTimeStats,
  computeForgetting,
  responseTimeBySkill,
  sentenceErrorBreakdown,
  computeForecast,
};

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

  // Retention / habit signal. Practice days are derived from ALL attempts
  // pulled (not just the window) so streaks reflect real activity.
  const practiceDays = new Set(attempts.map((a) => dayKey(a.created_at)));
  const retention = computeRetention(practiceDays);

  // Forgetting / leeches from per-item SRS state (lifetime, not windowed —
  // forgetting is about the whole deck). No-op-safe if SRS is unavailable.
  const srsMap = await getSrsMap(userId);
  const srsRows = [...srsMap.values()];
  const forgetting = computeForgetting(srsRows);
  const forecast = computeForecast(srsRows);

  // Enrich item lists (toughest, leeches) with the exercise prompt + answer so
  // the UI shows readable, speakable content instead of bare ids. Best-effort:
  // a missing lookup just leaves the id. One bounded read of published items.
  let exMap = new Map();
  try {
    const published = await store.listPublishedExercises({});
    for (const e of published) {
      exMap.set(e.id, { prompt: e.prompt, answer: e.correct_answer ?? null, type: e.type });
    }
  } catch {
    /* enrichment is optional */
  }
  const labelOf = (id) => exMap.get(id) || {};
  const toughestLabeled = toughest.map((t) => ({ ...t, ...labelOf(t.exerciseId) }));
  forgetting.leeches = forgetting.leeches.map((l) => ({ ...l, ...labelOf(l.exerciseId) }));

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
    retention,
    responseTime: responseTimeStats(windowed),
    responseBySkill: responseTimeBySkill(windowed),
    sentenceErrors: sentenceErrorBreakdown(windowed),
    forgetting,
    forecast,
    errorTagCounts: errorCounts,
    toughestExercises: toughestLabeled,
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

  // Cohort retention. Per-user practice days → personal comeback rates →
  // cohort average. Caveat: practice days are scoped to this window, so a
  // user active before `since` has a truncated history here; treat as a
  // window-bounded signal, not lifetime retention.
  const daysByUser = new Map();
  for (const a of attempts) {
    if (!a.user_id) continue;
    if (!daysByUser.has(a.user_id)) daysByUser.set(a.user_id, new Set());
    daysByUser.get(a.user_id).add(dayKey(a.created_at));
  }
  const perUser = [...daysByUser.values()].map((set) => computeRetention(set));
  const avg = (vals) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null);
  const d1Vals = perUser.map((r) => r.d1ComebackRate).filter((v) => v != null);
  const d7Vals = perUser.map((r) => r.d7ComebackRate).filter((v) => v != null);
  const retention = {
    learners: perUser.length,
    avgActiveDays: avg(perUser.map((r) => r.activeDays)),
    multiDayLearners: perUser.filter((r) => r.activeDays >= 2).length,
    d1ComebackRate: avg(d1Vals),
    d7ComebackRate: avg(d7Vals),
  };

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
    retention,
    moduleRollup,
    exerciseDifficulty: enriched
      .slice()
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
      .slice(0, 50),
    calibrationFollowups: followups,
  };
}
