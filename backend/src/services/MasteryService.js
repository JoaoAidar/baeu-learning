// SRS-lite mastery tracker. One row per (user, skill).
// level 0..5; correct → +1, wrong → -1 (clamped). Streak resets on wrong.
// next_review_at = now + INTERVAL[level].

import { getStore } from '../config/db.js';

// Skill tags that aren't really "skills" — they're descriptors. Don't track them.
const NON_SKILL_TAGS = new Set([
  'vocabulary',
  'reading',
  'sentence',
  'phrases',
  'objects',
  'people',
  'places',
  'time',
  'numbers', // tracked at the more specific native_numbers / sino_numbers level
  'particles', // tracked at topic_marker / subject_marker / object_marker / location level
  'verbs', // tracked at verb_conjugation / formality
]);

const INTERVAL_MS = [
  0,                       // 0 — immediately
  10 * 60 * 1000,          // 1 — 10 min
  60 * 60 * 1000,          // 2 — 1 hour
  24 * 60 * 60 * 1000,     // 3 — 1 day
  3 * 24 * 60 * 60 * 1000, // 4 — 3 days
  7 * 24 * 60 * 60 * 1000, // 5 — 7 days
];

function nextReviewAt(level, now = new Date()) {
  const ms = INTERVAL_MS[Math.min(Math.max(level, 0), 5)];
  return new Date(now.getTime() + ms).toISOString();
}

function trackable(skill) {
  return skill && !NON_SKILL_TAGS.has(skill);
}

export async function recordAttempt({ userId, skillTags, correct }) {
  const store = getStore();
  const skills = (skillTags || []).filter(trackable);
  if (!skills.length) return [];

  const now = new Date();
  const updated = [];
  for (const skill of skills) {
    const existing = (await store.getMastery(userId, skill)) || {
      user_id: userId,
      skill,
      level: 0,
      streak: 0,
      total_attempts: 0,
      total_correct: 0,
      last_seen_at: now.toISOString(),
      last_correct_at: null,
      next_review_at: now.toISOString(),
    };

    const nextLevel = correct
      ? Math.min(5, existing.level + 1)
      : Math.max(0, existing.level - 1);
    const nextStreak = correct ? existing.streak + 1 : 0;

    const row = {
      ...existing,
      level: nextLevel,
      streak: nextStreak,
      total_attempts: existing.total_attempts + 1,
      total_correct: existing.total_correct + (correct ? 1 : 0),
      last_seen_at: now.toISOString(),
      last_correct_at: correct ? now.toISOString() : existing.last_correct_at,
      next_review_at: nextReviewAt(nextLevel, now),
    };
    updated.push(await store.upsertMastery(row));
  }
  return updated;
}

export async function getMasteryMap(userId) {
  const store = getStore();
  const rows = await store.getMasteryForUser(userId);
  const map = new Map();
  for (const r of rows) map.set(r.skill, r);
  return map;
}

export function dueSkillsFromMap(masteryMap, now = new Date()) {
  const due = [];
  for (const [skill, m] of masteryMap.entries()) {
    // Mastered (level 5) skills are NOT skipped: spaced repetition means they
    // resurface once their 7-day interval elapses, so retention is checked
    // instead of assumed. A wrong answer then lapses the level via recordAttempt.
    const next = m.next_review_at ? new Date(m.next_review_at) : now;
    if (next.getTime() <= now.getTime()) due.push({ skill, level: m.level });
  }
  return due;
}

export const _internals = { nextReviewAt, INTERVAL_MS, NON_SKILL_TAGS };
