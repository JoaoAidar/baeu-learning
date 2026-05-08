import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Practice from '../src/services/PracticeService.js';
import * as Admin from '../src/services/AdminService.js';
import { SAMPLE_EXERCISES } from '../src/db/seed.js';

before(() => {
  memoryStore.__mode = 'memory';
  resetStoreForTests(memoryStore);
});

beforeEach(async () => {
  memoryStore.reset();
  await memoryStore.insertExercises(SAMPLE_EXERCISES);
});

test('startSession + nextQuestion returns a published exercise', async () => {
  const session = await Practice.startSession({ userId: 'u1' });
  assert.ok(session.id);
  const q = await Practice.nextQuestion({ sessionId: session.id });
  assert.ok(q.id);
  assert.ok(q.prompt);
  // public shape should not leak correct_answer
  assert.equal(q.correct_answer, undefined);
});

test('submitAnswer correct path increments score', async () => {
  const session = await Practice.startSession({ userId: 'u2' });
  const q = await Practice.nextQuestion({ sessionId: session.id });
  // Find ground-truth exercise for the q
  const ex = await memoryStore.getExercise(q.id);
  const answer = ex.type === 'multiple_choice' ? ex.correct_answer : ex.accepted_answers[0];
  const r = await Practice.submitAnswer({ sessionId: session.id, exerciseId: q.id, answer });
  assert.equal(r.correct, true);
  assert.equal(r.sessionScore.total, 1);
  assert.equal(r.sessionScore.correct, 1);
});

test('submitAnswer wrong path returns errorTags', async () => {
  const session = await Practice.startSession({ userId: 'u3' });
  // pick a translation explicitly
  const exes = await memoryStore.listPublishedExercises();
  const tr = exes.find((e) => e.type === 'translation');
  const r = await Practice.submitAnswer({
    sessionId: session.id,
    exerciseId: tr.id,
    answer: 'xxx',
  });
  assert.equal(r.correct, false);
  assert.ok(Array.isArray(r.errorTags) && r.errorTags.length > 0);
});

test('checkpoint fires on every 10th attempt', async () => {
  const session = await Practice.startSession({ userId: 'u4' });
  const exes = await memoryStore.listPublishedExercises();
  const ex = exes[0];
  let last = null;
  for (let i = 0; i < 10; i++) {
    last = await Practice.submitAnswer({
      sessionId: session.id,
      exerciseId: ex.id,
      answer: ex.correct_answer,
    });
  }
  assert.ok(last.checkpoint, 'checkpoint object should be present');
  assert.equal(last.checkpoint.windowSize, 10);
  assert.equal(last.checkpoint.correct, 10);
});

test('summary aggregates errorTagCounts', async () => {
  const session = await Practice.startSession({ userId: 'u5' });
  const exes = await memoryStore.listPublishedExercises();
  const tr = exes.find((e) => e.type === 'translation');
  await Practice.submitAnswer({ sessionId: session.id, exerciseId: tr.id, answer: '' });
  await Practice.submitAnswer({ sessionId: session.id, exerciseId: tr.id, answer: 'asdf' });
  const sum = await Practice.sessionSummary({ sessionId: session.id });
  assert.equal(sum.total, 2);
  assert.equal(sum.correct, 0);
  assert.ok(Object.keys(sum.errorTagCounts).length > 0);
  assert.ok(sum.recommendations.length > 0);
});

test('admin import: valid items create, invalid items fail', async () => {
  const result = await Admin.importExercises(
    [
      {
        type: 'translation',
        prompt: 'Translate "yes"',
        correct_answer: '네',
        accepted_answers: ['네', '예'],
        skill_tags: ['vocabulary'],
        status: 'published',
      },
      // missing prompt
      { type: 'translation', correct_answer: 'foo' },
      // bad type
      { type: 'banana', prompt: 'x', correct_answer: 'y' },
    ],
    { createdBy: 'tester' }
  );
  assert.equal(result.created, 1);
  assert.equal(result.failed.length, 2);
});

test('admin import: rejects non-array payload cleanly', async () => {
  const result = await Admin.importExercises({ not: 'array' });
  assert.equal(result.created, 0);
  assert.equal(result.failed[0].index, -1);
});
