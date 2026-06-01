// Per-item spaced repetition, SM-2-lite. One row per (user, exercise).
//
// We only have a binary correct/incorrect signal, so we map it to an SM-2
// quality: correct → 4 ("good"), incorrect → 2 ("lapse"). The ease factor
// adapts per item, intervals grow geometrically on success, and a miss resets
// the item to relearn (due immediately) while nudging ease down.
//
// This complements MasteryService (per-skill diagnostic). Mastery answers
// "how is this skill?", SRS answers "when should this exercise come back?".

import { getStore } from '../config/db.js';

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;

const round = (n, p = 3) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};

// Pure SM-2-lite transition. `prev` may be null (first review).
export function nextSrsState(prev, correct, now = new Date()) {
  const prevEase = prev?.ease ?? DEFAULT_EASE;
  const prevReps = prev?.repetitions ?? 0;
  const prevLapses = prev?.lapses ?? 0;
  const prevInterval = prev?.interval_days ?? 0;

  const quality = correct ? 4 : 2;

  // Standard SM-2 ease update.
  let ease = prevEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < MIN_EASE) ease = MIN_EASE;

  let repetitions;
  let intervalDays;
  let lapses = prevLapses;

  if (!correct) {
    // Lapse: relearn from scratch, due immediately (next session / soon).
    repetitions = 0;
    intervalDays = 0;
    lapses = prevLapses + 1;
  } else {
    repetitions = prevReps + 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = round((prevInterval || 1) * ease, 2);
  }

  const dueAt = new Date(now.getTime() + intervalDays * DAY_MS);

  return {
    ease: round(ease),
    repetitions,
    lapses,
    interval_days: intervalDays,
    due_at: dueAt.toISOString(),
    last_grade: quality,
    last_reviewed_at: now.toISOString(),
  };
}

export async function recordReview({ userId, exerciseId, correct }) {
  if (!exerciseId) return null;
  const store = getStore();
  if (!store.getSrs) return null; // store without SRS support — no-op
  const prev = await store.getSrs(userId, exerciseId);
  const next = nextSrsState(prev, correct);
  return store.upsertSrs({ user_id: userId, exercise_id: exerciseId, ...next });
}

export async function getSrsMap(userId) {
  const store = getStore();
  if (!store.getSrsForUser) return new Map();
  const rows = await store.getSrsForUser(userId);
  const map = new Map();
  for (const r of rows) map.set(r.exercise_id, r);
  return map;
}

export const _internals = { MIN_EASE, DEFAULT_EASE };
