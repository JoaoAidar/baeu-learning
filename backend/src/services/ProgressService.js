import { getStore } from '../config/db.js';
import { getMasteryMap } from './MasteryService.js';

export async function overview({ userId }) {
  const store = getStore();
  const attempts = await store.listAttemptsForUser(userId, { limit: 1000 });
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = attempts.filter((a) => new Date(a.created_at).getTime() >= sevenDaysAgo);
  const last7Correct = last7.filter((a) => a.correct).length;

  const errorTagCounts = {};
  for (const a of attempts) {
    if (a.correct) continue;
    for (const t of a.error_tags || []) {
      errorTagCounts[t] = (errorTagCounts[t] || 0) + 1;
    }
  }

  return {
    totals: {
      attempts: total,
      correct,
      accuracy: total ? correct / total : 0,
    },
    last7Days: {
      attempts: last7.length,
      correct: last7Correct,
      accuracy: last7.length ? last7Correct / last7.length : 0,
    },
    streakDays: streakDays(attempts),
    errorTagCounts,
  };
}

export async function skills({ userId }) {
  const map = await getMasteryMap(userId);
  const rows = [...map.values()].map((m) => ({
    skill: m.skill,
    level: m.level,
    streak: m.streak,
    totalAttempts: m.total_attempts,
    totalCorrect: m.total_correct,
    accuracy: m.total_attempts ? m.total_correct / m.total_attempts : 0,
    lastSeenAt: m.last_seen_at,
    nextReviewAt: m.next_review_at,
    due: m.next_review_at
      ? new Date(m.next_review_at).getTime() <= Date.now()
      : true,
  }));
  rows.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return b.totalAttempts - a.totalAttempts;
  });
  return { skills: rows };
}

function streakDays(attempts) {
  if (!attempts.length) return 0;
  const days = new Set(
    attempts.map((a) => new Date(a.created_at).toISOString().slice(0, 10))
  );
  let streak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else if (i > 0) break;
    else continue; // allow skipping today if no attempts yet
  }
  return streak;
}
