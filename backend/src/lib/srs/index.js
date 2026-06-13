// @baeu/srs — pure spaced-repetition scheduling (SM-2-lite).
//
// This module is intentionally self-contained: no I/O, no store, no app
// imports. It is the one piece of Baeu worth reusing across the fleet, so it
// lives behind a stable surface (`nextSrsState`) that can be lifted into a
// standalone package without touching any caller.
//
// Model: one schedule per (user, item). We only have a binary correct/incorrect
// signal, mapped to an SM-2 quality: correct → 4 ("good"), incorrect → 2
// ("lapse"). The ease factor adapts per item, intervals grow geometrically on
// success, and a miss resets the item to relearn (due immediately) while
// nudging ease down toward the floor.

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const round = (n, p = 3) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};

/**
 * Compute the next SRS state from the previous one.
 * @param {object|null} prev  Prior state ({ ease, repetitions, lapses, interval_days }) or null on first review.
 * @param {boolean} correct   Whether the learner answered correctly.
 * @param {Date} [now]        Clock injection point (defaults to new Date()).
 * @returns {{ease:number, repetitions:number, lapses:number, interval_days:number, due_at:string, last_grade:number, last_reviewed_at:string}}
 */
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
