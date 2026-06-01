import { getStore } from '../config/db.js';
import { getMasteryMap } from './MasteryService.js';
import { localDayString, tzOffsetMinutes } from '../util/time.js';

// How many recent attempts to scan for "current ability" per-skill accuracy.
// Recent ≠ lifetime so early struggles stop dragging the headline forever.
const RECENT_WINDOW = 500;

export async function overview({ userId }) {
  const store = getStore();
  const tz = tzOffsetMinutes();
  const agg = await store.getProgressAggregates(userId, { tzOffsetMinutes: tz });

  return {
    totals: {
      attempts: agg.attempts,
      correct: agg.correct,
      accuracy: agg.attempts ? agg.correct / agg.attempts : 0,
    },
    last7Days: {
      attempts: agg.last7Attempts,
      correct: agg.last7Correct,
      accuracy: agg.last7Attempts ? agg.last7Correct / agg.last7Attempts : 0,
    },
    streakDays: streakDays(agg.activeDays, tz),
    errorTagCounts: agg.errorTagCounts,
  };
}

export async function skills({ userId }) {
  const store = getStore();
  const map = await getMasteryMap(userId);

  // Recent per-skill accuracy: only count tags we actually track as skills, so
  // it lines up with the mastery rows.
  const recent = await store.listAttemptsForUser(userId, { limit: RECENT_WINDOW });
  const recentBySkill = new Map();
  for (const a of recent) {
    for (const t of a.skill_tags || []) {
      if (!map.has(t)) continue;
      const r = recentBySkill.get(t) || { attempts: 0, correct: 0 };
      r.attempts += 1;
      if (a.correct) r.correct += 1;
      recentBySkill.set(t, r);
    }
  }

  const rows = [...map.values()].map((m) => {
    const r = recentBySkill.get(m.skill);
    return {
      skill: m.skill,
      level: m.level,
      streak: m.streak,
      totalAttempts: m.total_attempts,
      totalCorrect: m.total_correct,
      accuracy: m.total_attempts ? m.total_correct / m.total_attempts : 0,
      recentAttempts: r ? r.attempts : 0,
      recentAccuracy: r && r.attempts ? r.correct / r.attempts : null,
      lastSeenAt: m.last_seen_at,
      nextReviewAt: m.next_review_at,
      due: m.next_review_at
        ? new Date(m.next_review_at).getTime() <= Date.now()
        : true,
    };
  });
  rows.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return b.totalAttempts - a.totalAttempts;
  });
  return { skills: rows };
}

// Consecutive local-timezone days with at least one attempt. Today may be
// skipped without breaking the streak (you haven't practiced *yet* today).
function streakDays(activeDays, tz) {
  if (!activeDays || !activeDays.length) return 0;
  const set = new Set(activeDays);
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const day = localDayString(Date.now() - i * 24 * 60 * 60 * 1000, tz);
    if (set.has(day)) streak += 1;
    else if (i > 0) break;
  }
  return streak;
}
