import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import { parseExercisesFromLLM, generateExercises } from '../src/services/LLMGenerator.js';
import { generateAndImport } from '../src/services/AdminService.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  process.env.LLM_API_KEY = 'test-key';
  resetStoreForTests(memoryStore);
});

beforeEach(() => {
  memoryStore.reset();
});

test('parseExercisesFromLLM accepts a bare JSON array', () => {
  const raw = '[{"type":"translation","prompt":"x","correct_answer":"y"}]';
  const out = parseExercisesFromLLM(raw);
  assert.equal(out.length, 1);
});

test('parseExercisesFromLLM strips markdown fences', () => {
  const raw = '```json\n[{"type":"translation","prompt":"x","correct_answer":"y"}]\n```';
  const out = parseExercisesFromLLM(raw);
  assert.equal(out[0].type, 'translation');
});

test('parseExercisesFromLLM accepts {"exercises": [...]}', () => {
  const raw = '{"exercises":[{"type":"translation","prompt":"x","correct_answer":"y"}]}';
  const out = parseExercisesFromLLM(raw);
  assert.equal(out.length, 1);
});

test('parseExercisesFromLLM throws on invalid JSON', () => {
  assert.throws(() => parseExercisesFromLLM('no json here'), (e) => e.status === 502);
});

test('generateExercises uses fetch mock and returns array', async () => {
  const fakeFetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                type: 'translation',
                difficulty: 'easy',
                prompt: 'Translate to Korean: cat',
                correct_answer: '고양이',
                accepted_answers: ['고양이'],
                skill_tags: ['vocabulary', 'animals'],
                explanation: '고양이 = cat',
                metadata: { romanization: 'goyangi' },
              },
            ]),
          },
        },
      ],
    }),
    text: async () => '',
  });
  const out = await generateExercises({
    topic: 'animals',
    count: 1,
    fetchImpl: fakeFetch,
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].correct_answer, '고양이');
});

test('generateAndImport stamps drafts and validates', async () => {
  // Stub global fetch
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                type: 'translation',
                prompt: 'p1',
                correct_answer: 'a1',
                accepted_answers: ['a1'],
                skill_tags: ['vocabulary'],
              },
              { type: 'translation' /* invalid: no prompt */ },
            ]),
          },
        },
      ],
    }),
    text: async () => '',
  });
  try {
    const r = await generateAndImport({ topic: 'x', count: 2, autoPublish: false });
    assert.equal(r.generated, 2);
    assert.equal(r.created, 1);
    assert.equal(r.failed.length, 1);
    const stored = await memoryStore.listExercisesByStatus('draft');
    assert.equal(stored.length, 1);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('generateExercises errors when LLM_API_KEY missing', async () => {
  const old = process.env.LLM_API_KEY;
  delete process.env.LLM_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  await assert.rejects(
    generateExercises({ topic: 'x' }),
    (e) => e.status === 503 && e.message === 'llm_not_configured'
  );
  process.env.LLM_API_KEY = old;
});
