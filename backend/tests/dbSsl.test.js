import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildPgSslConfig } from '../src/db/ssl.js';

const ORIG_NODE_ENV = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = ORIG_NODE_ENV;
});

test('buildPgSslConfig refuses production URLs without sslmode when required', () => {
  process.env.NODE_ENV = 'production';
  assert.throws(
    () =>
      buildPgSslConfig('postgres://u:p@host:5432/db', {
        requireInProduction: true,
        label: 'test db',
      }),
    /sslmode=require/i
  );
});

test('buildPgSslConfig accepts production URLs with sslmode', () => {
  process.env.NODE_ENV = 'production';
  assert.equal(
    buildPgSslConfig('postgres://u:p@host:5432/db?sslmode=require', {
      requireInProduction: true,
      label: 'test db',
    }),
    undefined
  );
});

test('buildPgSslConfig keeps dev/test permissive fallback', () => {
  process.env.NODE_ENV = 'test';
  assert.deepEqual(
    buildPgSslConfig('postgres://u:p@host:5432/db', { requireInProduction: true }),
    { rejectUnauthorized: false }
  );
});
