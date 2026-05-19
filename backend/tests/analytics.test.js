import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Analytics from '../src/services/AnalyticsService.js';
import * as Practice from '../src/services/PracticeService.js';
import { SAMPLE_EXERCISES } from '../src/db/seed.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(async () => {
  memoryStore.reset();
  await memoryStore.insertExercises(SAMPLE_EXERCISES);
  await memoryStore.createUser({ email: 'a@example.com' });
});

test('learnerAnalytics: shape is correct with zero attempts', async () => {
  const user = await memoryStore.getUserByEmail('a@example.com');
  const r = await Analytics.learnerAnalytics({ userId: user.id, days: 30 });
  assert.equal(r.totals.attempts, 0);
  assert.equal(r.daily.length, 30);
  assert.equal(r.toughestExercises.length, 0);
  assert.deepEqual(
    r.masteryByLevel.map((m) => m.level),
    [0, 1, 2, 3, 4, 5]
  );
});

test('learnerAnalytics: aggregates daily + toughest after attempts', async () => {
  const user = await memoryStore.getUserByEmail('a@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const exes = await memoryStore.listPublishedExercises();
  // Same exercise twice, both wrong → should be the toughest with 0% accuracy.
  await Practice.submitAnswer({ sessionId: session.id, exerciseId: exes[0].id, answer: 'wrong-1' });
  await Practice.submitAnswer({ sessionId: session.id, exerciseId: exes[0].id, answer: 'wrong-2' });
  await Practice.submitAnswer({
    sessionId: session.id,
    exerciseId: exes[1].id,
    answer: exes[1].correct_answer,
  });
  const r = await Analytics.learnerAnalytics({ userId: user.id, days: 30 });
  assert.equal(r.totals.attempts, 3);
  assert.equal(r.totals.correct, 1);
  assert.ok(r.toughestExercises.length >= 1, 'expected at least one toughest item');
  assert.equal(r.toughestExercises[0].exerciseId, exes[0].id);
  assert.equal(r.toughestExercises[0].accuracy, 0);
});

test('adminAnalytics: rolls up by module and flags calibration outliers', async () => {
  const user = await memoryStore.getUserByEmail('a@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const exes = await memoryStore.listPublishedExercises();
  // Force one exercise to be "too easy" (≥10 attempts, ≥95% correct).
  for (let i = 0; i < 12; i++) {
    await Practice.submitAnswer({
      sessionId: session.id,
      exerciseId: exes[0].id,
      answer: exes[0].correct_answer,
    });
  }
  const r = await Analytics.adminAnalytics({ days: 30 });
  assert.ok(r.totals.attempts >= 12);
  assert.ok(r.totals.activeLearners >= 1);
  assert.ok(r.moduleRollup.length >= 1, 'expected at least one module rollup row');
  // The hot item should be classified as too_easy.
  const easy = r.exerciseDifficulty.find((e) => e.exerciseId === exes[0].id);
  assert.ok(easy, 'expected the repeated exercise to show in difficulty list');
  assert.equal(easy.calibrationSignal, 'too_easy');
});
