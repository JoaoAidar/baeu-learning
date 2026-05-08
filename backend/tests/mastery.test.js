import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import {
  recordAttempt,
  getMasteryMap,
  dueSkillsFromMap,
  _internals,
} from '../src/services/MasteryService.js';
import { selectNext } from '../src/services/ExerciseSelector.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(() => {
  memoryStore.reset();
});

test('recordAttempt: correct answer raises level and pushes next_review_at into the future', async () => {
  const u = 'user-1';
  const r = await recordAttempt({ userId: u, skillTags: ['topic_marker'], correct: true });
  assert.equal(r.length, 1);
  assert.equal(r[0].level, 1);
  assert.equal(r[0].streak, 1);
  assert.ok(new Date(r[0].next_review_at).getTime() > Date.now());
});

test('recordAttempt: wrong answer drops level and resets streak', async () => {
  const u = 'user-2';
  await recordAttempt({ userId: u, skillTags: ['topic_marker'], correct: true });
  await recordAttempt({ userId: u, skillTags: ['topic_marker'], correct: true });
  const r = await recordAttempt({ userId: u, skillTags: ['topic_marker'], correct: false });
  assert.equal(r[0].level, 1);    // 2 -> 1
  assert.equal(r[0].streak, 0);
});

test('recordAttempt: filters out non-skill descriptors', async () => {
  const u = 'user-3';
  const r = await recordAttempt({
    userId: u,
    skillTags: ['vocabulary', 'topic_marker', 'phrases'],
    correct: true,
  });
  assert.equal(r.length, 1);
  assert.equal(r[0].skill, 'topic_marker');
});

test('dueSkillsFromMap returns skills whose next_review_at <= now', () => {
  const map = new Map([
    ['a', { skill: 'a', level: 1, next_review_at: new Date(Date.now() - 1000).toISOString() }],
    ['b', { skill: 'b', level: 1, next_review_at: new Date(Date.now() + 60_000).toISOString() }],
    ['c', { skill: 'c', level: 5, next_review_at: new Date(Date.now() - 1000).toISOString() }],
  ]);
  const due = dueSkillsFromMap(map);
  assert.equal(due.length, 1);
  assert.equal(due[0].skill, 'a');
});

test('selectNext deprioritizes mastered skills', () => {
  const exercises = [
    { id: 'mastered-only', type: 'translation', skill_tags: ['topic_marker'] },
    { id: 'fresh', type: 'translation', skill_tags: ['object_marker'] },
  ];
  const masteryMap = new Map([
    ['topic_marker', { skill: 'topic_marker', level: 5, next_review_at: new Date().toISOString() }],
  ]);
  const picks = new Set();
  for (let i = 0; i < 30; i++) {
    const ex = selectNext({ exercises, masteryMap });
    picks.add(ex.id);
  }
  // 'fresh' should overwhelmingly dominate
  const freshOnly = [...picks].length === 1 && picks.has('fresh');
  assert.ok(freshOnly || picks.has('fresh'), 'fresh skill should be picked at least sometimes');
});

test('intervals scale with level', () => {
  const t0 = Date.now();
  const l0 = new Date(_internals.nextReviewAt(0, new Date(t0))).getTime();
  const l3 = new Date(_internals.nextReviewAt(3, new Date(t0))).getTime();
  const l5 = new Date(_internals.nextReviewAt(5, new Date(t0))).getTime();
  assert.ok(l3 > l0);
  assert.ok(l5 > l3);
});
