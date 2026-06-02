import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextSrsState, _internals, getSrsMap, recordReview } from '../src/services/SrsService.js';
import { selectNext } from '../src/services/ExerciseSelector.js';
import { resetStoreForTests } from '../src/config/db.js';
import { memoryStore } from '../src/repositories/memoryStore.js';

const make = (id, skills = ['greetings'], type = 'translation') => ({ id, type, skill_tags: skills });

test('first correct review schedules ~1 day out and raises reps', () => {
  const now = new Date('2026-06-01T12:00:00Z');
  const s = nextSrsState(null, true, now);
  assert.equal(s.repetitions, 1);
  assert.equal(s.interval_days, 1);
  assert.equal(s.lapses, 0);
  assert.equal(s.due_at, new Date(now.getTime() + 24 * 3600 * 1000).toISOString());
});

test('intervals grow geometrically across successive correct reviews', () => {
  const now = new Date('2026-06-01T12:00:00Z');
  const s1 = nextSrsState(null, true, now);
  const s2 = nextSrsState(s1, true, now);
  const s3 = nextSrsState(s2, true, now);
  assert.equal(s2.interval_days, 3);
  assert.ok(s3.interval_days > s2.interval_days, 'third interval grows past the second');
});

test('a miss lapses: reps reset, due immediately, ease drops but floors at min', () => {
  const now = new Date('2026-06-01T12:00:00Z');
  let s = nextSrsState(null, true, now);
  s = nextSrsState(s, true, now);
  const easeBefore = s.ease;
  const lapsed = nextSrsState(s, false, now);
  assert.equal(lapsed.repetitions, 0);
  assert.equal(lapsed.interval_days, 0);
  assert.equal(lapsed.lapses, 1);
  assert.ok(lapsed.ease < easeBefore, 'ease decreases on a miss');
  assert.ok(lapsed.ease >= _internals.MIN_EASE, 'ease never goes below the floor');

  // Many misses can't push ease below the floor.
  let floored = lapsed;
  for (let i = 0; i < 20; i++) floored = nextSrsState(floored, false, now);
  assert.equal(floored.ease, _internals.MIN_EASE);
});

test('SRS degrades to a no-op when the store throws (table missing in prod)', async () => {
  // Simulate a deployed backend whose user_exercise_srs table does not exist yet.
  const throwingStore = {
    getSrsForUser: async () => { throw new Error('relation "user_exercise_srs" does not exist'); },
    getSrs: async () => { throw new Error('relation "user_exercise_srs" does not exist'); },
    upsertSrs: async () => { throw new Error('relation "user_exercise_srs" does not exist'); },
  };
  resetStoreForTests(throwingStore);
  try {
    const map = await getSrsMap('u1');
    assert.equal(map.size, 0, 'getSrsMap returns empty map, does not throw');
    const r = await recordReview({ userId: 'u1', exerciseId: 'e1', correct: true });
    assert.equal(r, null, 'recordReview returns null, does not throw');
  } finally {
    resetStoreForTests(memoryStore);
  }
});

test('selector resurfaces a due item and holds back a not-due item', () => {
  const now = Date.now();
  const exercises = [make('due'), make('not-due'), make('fresh')];
  const srsMap = new Map([
    ['due', { exercise_id: 'due', due_at: new Date(now - 2 * 24 * 3600 * 1000).toISOString() }],
    ['not-due', { exercise_id: 'not-due', due_at: new Date(now + 5 * 24 * 3600 * 1000).toISOString() }],
  ]);
  const picks = {};
  for (let i = 0; i < 60; i++) {
    const id = selectNext({ exercises, srsMap }).id;
    picks[id] = (picks[id] || 0) + 1;
  }
  assert.ok((picks['due'] || 0) > 0, 'due item should appear');
  assert.ok((picks['due'] || 0) >= (picks['not-due'] || 0), 'due beats not-due');
  // not-due is strongly held back; it should rarely if ever win against due/fresh
  assert.ok((picks['not-due'] || 0) < (picks['due'] || 0), 'not-due is suppressed');
});
