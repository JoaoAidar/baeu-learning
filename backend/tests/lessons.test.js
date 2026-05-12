import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import { runSeedIfEmpty, SAMPLE_EXERCISES } from '../src/db/seed.js';
import { LESSONS } from '../src/db/grammarLessons.js';
import * as Lessons from '../src/services/LessonsService.js';
import * as Practice from '../src/services/PracticeService.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(async () => {
  memoryStore.reset();
  await memoryStore.createUser({
    email: 'lessons@example.com',
    password_hash: 'scrypt$00$00',
  });
  await runSeedIfEmpty();
});

test('seed inserts all grammar lessons', async () => {
  const all = await memoryStore.listLessons();
  assert.equal(all.length, LESSONS.length);
});

test('every lesson has a body and at least one related_error_tag', async () => {
  const all = await memoryStore.listLessons();
  for (const l of all) {
    assert.ok(l.body_md && l.body_md.length > 100, `lesson ${l.slug} body too short`);
    assert.ok(
      Array.isArray(l.related_error_tags) && l.related_error_tags.length > 0,
      `lesson ${l.slug} has no related_error_tags`
    );
  }
});

test('listLessons can filter by module', async () => {
  const r = await Lessons.listLessons({ moduleSlug: 'particles' });
  assert.ok(r.lessons.length >= 3, `expected ≥3 lessons in particles, got ${r.lessons.length}`);
  // All returned lessons should belong to that module
  const particlesMod = await memoryStore.getModuleBySlug('particles');
  for (const l of r.lessons) {
    assert.equal(l.module_id, particlesMod.id);
  }
});

test('seed includes minimum lessons for buyer-trust modules', async () => {
  for (const slug of ['greetings', 'vocab-daily', 'reading']) {
    const r = await Lessons.listLessons({ moduleSlug: slug });
    assert.ok(r.lessons.length >= 3, `expected at least 3 lessons in ${slug}`);
  }
});

test('getLesson returns body markdown', async () => {
  const r = await Lessons.getLesson({ slug: 'topic-vs-subject' });
  assert.equal(r.lesson.slug, 'topic-vs-subject');
  assert.ok(r.lesson.body_md.includes('은/는'));
});

test('getLesson 404s for unknown slug', async () => {
  await assert.rejects(
    Lessons.getLesson({ slug: 'no-such-lesson' }),
    (e) => e.status === 404
  );
});

test('findLessonForErrorTag returns a lesson tagged for that error', async () => {
  const l = await Lessons.findLessonForErrorTag('particle');
  assert.ok(l, 'expected to find a particle lesson');
  assert.ok(l.related_error_tags.includes('particle'));
});

// Pick a particle fill-blank where answer is a single particle char.
async function pickParticleDrill() {
  const exes = await memoryStore.listPublishedExercises();
  return exes.find(
    (e) =>
      e.type === 'fill_blank' &&
      ['은', '는', '이', '가', '을', '를'].includes(e.correct_answer)
  );
}

const OPPOSITE_PARTICLE = { '은': '가', '는': '가', '이': '는', '가': '는', '을': '에', '를': '에' };

test('submitAnswer recommends a lesson once threshold reached', async () => {
  const user = await memoryStore.getUserByEmail('lessons@example.com');
  const session = await Practice.startSession({ userId: user.id });

  const drill = await pickParticleDrill();
  assert.ok(drill, 'no particle fill_blank found in seed');
  const wrong = OPPOSITE_PARTICLE[drill.correct_answer] || 'X';

  let last;
  for (let i = 0; i < 5; i++) {
    last = await Practice.submitAnswer({
      sessionId: session.id,
      exerciseId: drill.id,
      answer: wrong,
    });
    if (last.recommendedLesson) break;
  }

  assert.ok(
    last.recommendedLesson,
    `expected a recommendedLesson after 3 particle errors, got ${JSON.stringify(last)}`
  );
  assert.ok(last.recommendedLesson.related_error_tags.includes('particle'));
  assert.equal(last.recommendedLesson.triggering_tag, 'particle');
});

test('submitAnswer does not recommend on first wrong answer', async () => {
  const user = await memoryStore.getUserByEmail('lessons@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const drill = await pickParticleDrill();
  const wrong = OPPOSITE_PARTICLE[drill.correct_answer] || 'X';
  const r = await Practice.submitAnswer({
    sessionId: session.id,
    exerciseId: drill.id,
    answer: wrong,
  });
  assert.equal(r.recommendedLesson, null);
});
