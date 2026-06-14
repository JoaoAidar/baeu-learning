import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import { buildSampleExercises, runSeedIfEmpty, seedNewExercises } from '../src/db/seed.js';
import { validateExercise } from '../src/services/AdminService.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

test('seed produces 100+ valid exercises', () => {
  const items = buildSampleExercises();
  assert.ok(items.length >= 100, `expected 100+, got ${items.length}`);
  let invalid = 0;
  for (let i = 0; i < items.length; i++) {
    const { errors } = validateExercise(items[i], i);
    if (errors.length) {
      invalid++;
      if (invalid <= 3) console.error('seed invalid:', items[i], errors);
    }
  }
  assert.equal(invalid, 0, `${invalid} invalid seed items`);
});

test('seed covers core skills', () => {
  const items = buildSampleExercises();
  const allSkills = new Set();
  for (const it of items) for (const s of it.skill_tags || []) allSkills.add(s);
  for (const must of ['vocabulary', 'particles', 'verbs', 'numbers', 'greetings']) {
    assert.ok(allSkills.has(must), `missing core skill: ${must}`);
  }
});

test('catalog has a hard tier and reinforced grammar drills', () => {
  const items = buildSampleExercises();
  const hard = items.filter((i) => i.difficulty === 'hard');
  assert.ok(hard.length >= 45, `expected a deep hard tier (50+ target), got ${hard.length}`);
  const wordOrder = items.filter((i) => (i.skill_tags || []).includes('word_order'));
  assert.ok(wordOrder.length >= 10, `expected word_order coverage, got ${wordOrder.length}`);
});

test('depth content (hangul/numbers/greetings/grammar) is well-formed', () => {
  const items = buildSampleExercises();
  // New skills introduced by the depth expansion.
  for (const skill of ['batchim', 'counters', 'connectives']) {
    const hits = items.filter((i) => (i.skill_tags || []).includes(skill));
    assert.ok(hits.length >= 3, `expected ${skill} drills, got ${hits.length}`);
  }
  // All multiple-choice depth items must be well-formed and ≤3 tags.
  const depthMc = items.filter(
    (i) =>
      i.type === 'multiple_choice' &&
      (i.skill_tags || []).some((t) => ['counters', 'connectives', 'register', 'batchim'].includes(t))
  );
  assert.ok(depthMc.length >= 8, `expected depth MC, got ${depthMc.length}`);
  for (const it of depthMc) {
    assert.equal(it.options.length, 4, `4 options: ${it.prompt}`);
    assert.ok((it.skill_tags || []).length <= 3, `<=3 tags: ${it.prompt}`);
    const texts = it.options.map((o) => o.text);
    assert.equal(new Set(texts).size, texts.length, `no dup options: ${it.prompt}`);
    const correct = it.options.find((o) => o.id === it.correct_answer);
    assert.ok(correct && correct.text === it.accepted_answers[0], `correct maps: ${it.prompt}`);
  }
});

test('past-tense + tense-contrast drills exist and are well-formed', () => {
  const items = buildSampleExercises();
  const past = items.filter(
    (i) => i.type === 'fill_blank' && (i.skill_tags || []).includes('past')
  );
  assert.ok(past.length >= 12, `expected past-tense drills, got ${past.length}`);
  for (const it of past) {
    assert.ok(it.correct_answer && it.accepted_answers.includes(it.correct_answer));
  }
  const tense = items.filter(
    (i) => i.type === 'multiple_choice' && (i.skill_tags || []).includes('tense')
  );
  assert.ok(tense.length >= 4, `expected tense-contrast MC, got ${tense.length}`);
  for (const it of tense) {
    assert.equal(it.options.length, 4, `4 options expected: ${it.prompt}`);
    // selector adds a per-tag bonus; keep these from dominating the catalog.
    assert.ok((it.skill_tags || []).length <= 3, `<=3 tags expected: ${it.prompt}`);
    const correct = it.options.find((o) => o.id === it.correct_answer);
    assert.ok(correct && correct.text === it.accepted_answers[0]);
  }
});

test('particle-contrast drills are well-formed multiple choice', () => {
  const items = buildSampleExercises();
  const pc = items.filter((i) => (i.skill_tags || []).includes('particle_contrast'));
  assert.ok(pc.length >= 10, `expected a particle-contrast set, got ${pc.length}`);
  for (const it of pc) {
    assert.equal(it.type, 'multiple_choice');
    assert.equal(it.options.length, 4, `4 options expected: ${it.prompt}`);
    const texts = it.options.map((o) => o.text);
    assert.equal(new Set(texts).size, texts.length, `no duplicate options: ${it.prompt}`);
    const correct = it.options.find((o) => o.id === it.correct_answer);
    assert.ok(correct, `correct_answer must map to an option: ${it.prompt}`);
    assert.equal(correct.text, it.accepted_answers[0], `correct option matches answer: ${it.prompt}`);
  }
});

test('seedNewExercises is additive and idempotent (no duplicate prompts)', async () => {
  memoryStore.reset();
  const first = await runSeedIfEmpty();
  assert.ok(first.length > 0);
  // Re-running adds nothing — every prompt already present.
  const added = await seedNewExercises();
  assert.equal(added.length, 0, `expected 0 added on rerun, got ${added.length}`);
  // No prompt appears twice in the store.
  const prompts = await memoryStore.listExercisePrompts();
  assert.equal(new Set(prompts).size, prompts.length, 'no duplicate prompts inserted');
});
