import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createPgStore } from '../src/repositories/pgStore.js';

const ORIG_NODE_ENV = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = ORIG_NODE_ENV;
});

test('pgStore throws in production when connection string lacks sslmode', () => {
  process.env.NODE_ENV = 'production';
  assert.throws(
    () => createPgStore({ connectionString: 'postgres://u:p@host:5432/db' }),
    /sslmode=/i
  );
});

test('pgStore accepts production connection string with sslmode=require', () => {
  process.env.NODE_ENV = 'production';
  // Construction should not throw; we end() the pool immediately to release it.
  const store = createPgStore({
    connectionString: 'postgres://u:p@host:5432/db?sslmode=require',
  });
  assert.equal(store.__mode, 'pg');
  // Best-effort cleanup; if end() rejects (it shouldn't here without a real conn), ignore.
  store.end().catch(() => {});
});

test('pgStore is permissive in non-production (no sslmode required)', () => {
  process.env.NODE_ENV = 'test';
  const store = createPgStore({ connectionString: 'postgres://u:p@host:5432/db' });
  assert.equal(store.__mode, 'pg');
  store.end().catch(() => {});
});
