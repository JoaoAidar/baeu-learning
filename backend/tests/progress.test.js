import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Progress from '../src/services/ProgressService.js';
import * as Practice from '../src/services/PracticeService.js';
import { SAMPLE_EXERCISES } from '../src/db/seed.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(async () => {
  memoryStore.reset();
  await memoryStore.insertExercises(SAMPLE_EXERCISES);
  await memoryStore.createUser({
    email: 'p@example.com',
    password_hash: 'scrypt$00$00',
    role: 'user',
  });
});

test('overview returns zeros for fresh user', async () => {
  const user = await memoryStore.getUserByEmail('p@example.com');
  const o = await Progress.overview({ userId: user.id });
  assert.equal(o.totals.attempts, 0);
  assert.equal(o.streakDays, 0);
});

test('after a few attempts overview reflects them', async () => {
  const user = await memoryStore.getUserByEmail('p@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const exes = await memoryStore.listPublishedExercises();
  await Practice.submitAnswer({
    sessionId: session.id,
    exerciseId: exes[0].id,
    answer: exes[0].correct_answer,
  });
  await Practice.submitAnswer({
    sessionId: session.id,
    exerciseId: exes[0].id,
    answer: 'wrong',
  });
  const o = await Progress.overview({ userId: user.id });
  assert.equal(o.totals.attempts, 2);
  assert.equal(o.totals.correct, 1);
  assert.equal(o.streakDays >= 1, true);
});

test('skills endpoint returns mastery rows', async () => {
  const user = await memoryStore.getUserByEmail('p@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const exes = await memoryStore.listPublishedExercises();
  // Pick a translation with a trackable skill (topic_marker / particles etc.)
  const trackable = exes.find((e) =>
    (e.skill_tags || []).some((t) => ['topic_marker', 'object_marker', 'verb_conjugation'].includes(t))
  ) || exes[0];
  await Practice.submitAnswer({
    sessionId: session.id,
    exerciseId: trackable.id,
    answer: trackable.correct_answer,
  });
  const r = await Progress.skills({ userId: user.id });
  assert.ok(Array.isArray(r.skills));
  // At least one skill should have been recorded if the exercise had trackable tags
  if ((trackable.skill_tags || []).some((t) =>
    ['topic_marker', 'object_marker', 'verb_conjugation', 'formality', 'native_numbers', 'sino_numbers'].includes(t)
  )) {
    assert.ok(r.skills.length > 0);
  }
});
