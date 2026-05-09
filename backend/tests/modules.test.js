import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import { MODULES } from '../src/db/modules.js';
import { runSeedIfEmpty } from '../src/db/seed.js';
import * as Practice from '../src/services/PracticeService.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(async () => {
  memoryStore.reset();
  await memoryStore.createUser({
    email: 'mod@example.com',
    password_hash: 'scrypt$00$00',
  });
  await runSeedIfEmpty();
});

test('seed inserts all 8 modules', async () => {
  const mods = await memoryStore.listModules();
  assert.equal(mods.length, MODULES.length);
  assert.deepEqual(
    mods.map((m) => m.slug).sort(),
    MODULES.map((m) => m.slug).sort()
  );
});

test('every published exercise belongs to a module', async () => {
  const exs = await memoryStore.listPublishedExercises();
  const orphans = exs.filter((e) => !e.module_id);
  assert.equal(orphans.length, 0, `${orphans.length} orphan exercises (no module_id)`);
});

test('countPublishedByModule returns positive counts for each module', async () => {
  const counts = await memoryStore.countPublishedByModule();
  for (const m of MODULES) {
    const mod = await memoryStore.getModuleBySlug(m.slug);
    const n = counts[mod.id] || 0;
    assert.ok(n >= 5, `module ${m.slug} only has ${n} exercises`);
  }
});

test('startSession with moduleSlug encodes module in mode', async () => {
  const user = await memoryStore.getUserByEmail('mod@example.com');
  const session = await Practice.startSession({
    userId: user.id,
    moduleSlug: 'greetings',
  });
  assert.equal(session.mode, 'endless:greetings');
});

test('nextQuestion scoped to a module only returns that module', async () => {
  const user = await memoryStore.getUserByEmail('mod@example.com');
  const session = await Practice.startSession({
    userId: user.id,
    moduleSlug: 'numbers',
  });
  const numbersMod = await memoryStore.getModuleBySlug('numbers');
  for (let i = 0; i < 6; i++) {
    const q = await Practice.nextQuestion({ sessionId: session.id });
    const ex = await memoryStore.getExercise(q.id);
    assert.equal(
      ex.module_id,
      numbersMod.id,
      `iter ${i}: exercise belongs to ${ex.module_id}, expected ${numbersMod.id}`
    );
  }
});

test('global session pulls across modules', async () => {
  const user = await memoryStore.getUserByEmail('mod@example.com');
  const session = await Practice.startSession({ userId: user.id });
  assert.equal(session.mode, 'endless');
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    const q = await Practice.nextQuestion({ sessionId: session.id });
    const ex = await memoryStore.getExercise(q.id);
    if (ex.module_id) seen.add(ex.module_id);
  }
  assert.ok(seen.size >= 3, `global session only saw ${seen.size} modules in 30 picks`);
});

test('startSession rejects unknown module slug', async () => {
  const user = await memoryStore.getUserByEmail('mod@example.com');
  await assert.rejects(
    Practice.startSession({ userId: user.id, moduleSlug: 'no-such-module' }),
    (e) => e.status === 404 && e.message === 'module_not_found'
  );
});
