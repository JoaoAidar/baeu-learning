import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import { buildSampleExercises } from '../src/db/seed.js';
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
