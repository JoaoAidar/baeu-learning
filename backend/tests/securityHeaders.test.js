import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';

beforeEach(() => {
  process.env.NODE_ENV = 'test';
  memoryStore.reset();
  resetStoreForTests(memoryStore);
});

test('health responses include restrictive CSP and frame protection', async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const res = await get(`http://127.0.0.1:${port}/api/v1/health`);
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-security-policy'] || '', /default-src 'none'/);
    assert.match(res.headers['content-security-policy'] || '', /frame-ancestors 'none'/);
    assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        res.resume();
        res.on('end', () => resolve(res));
      })
      .on('error', reject);
  });
}
