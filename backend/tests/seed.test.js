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
  assert.ok(hard.length >= 8, `expected hard items, got ${hard.length}`);
  const wordOrder = items.filter((i) => (i.skill_tags || []).includes('word_order'));
  assert.ok(wordOrder.length >= 10, `expected word_order coverage, got ${wordOrder.length}`);
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
