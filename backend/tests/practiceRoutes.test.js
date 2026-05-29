import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import { runSeedIfEmpty } from '../src/db/seed.js';

process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-must-be-long-enough-for-routes';
process.env.BETTER_AUTH_URL = 'http://127.0.0.1';
process.env.CORS_ORIGIN = 'http://127.0.0.1';

const { createApp } = await import('../src/app.js');

before(async () => {
  resetStoreForTests(memoryStore);
});

test('practice routes reject another authenticated user session', async () => {
  memoryStore.reset();
  await runSeedIfEmpty();

  const server = createApp().listen(0);
  try {
    const port = server.address().port;
    const owner = await signUp(port, 'route-owner');
    const attacker = await signUp(port, 'route-attacker');

    const sessionRes = await request(port, 'POST', '/api/v1/practice/sessions', {
      cookie: owner.cookie,
      body: {},
    });
    assert.equal(sessionRes.statusCode, 200);
    assert.ok(sessionRes.json.id);

    const nextRes = await request(
      port,
      'GET',
      `/api/v1/practice/next?sessionId=${encodeURIComponent(sessionRes.json.id)}`,
      { cookie: attacker.cookie }
    );
    assert.equal(nextRes.statusCode, 403);
    assert.deepEqual(nextRes.json, { error: 'session_forbidden' });

    const exercise = (await memoryStore.listPublishedExercises())[0];
    const answerRes = await request(port, 'POST', '/api/v1/practice/answer', {
      cookie: attacker.cookie,
      body: {
        sessionId: sessionRes.json.id,
        exerciseId: exercise.id,
        answer: exercise.correct_answer || '',
      },
    });
    assert.equal(answerRes.statusCode, 403);
    assert.deepEqual(answerRes.json, { error: 'session_forbidden' });

    const summaryRes = await request(
      port,
      'GET',
      `/api/v1/practice/sessions/${encodeURIComponent(sessionRes.json.id)}/summary`,
      { cookie: attacker.cookie }
    );
    assert.equal(summaryRes.statusCode, 403);
    assert.deepEqual(summaryRes.json, { error: 'session_forbidden' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function signUp(port, prefix) {
  const res = await request(port, 'POST', '/api/auth/sign-up/email', {
    body: {
      email: `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@test.local`,
      password: 'route-test-123',
      name: prefix,
    },
  });
  assert.equal(res.statusCode, 200);
  assert.ok(res.cookie, 'signup response should set session cookie');
  return { cookie: res.cookie };
}

function request(port, method, path, { body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const headers = {};
    if (payload) {
      headers['content-type'] = 'application/json';
      headers['content-length'] = Buffer.byteLength(payload);
    }
    if (cookie) headers.cookie = cookie;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          const setCookie = res.headers['set-cookie'] || [];
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            cookie: setCookie.map((value) => value.split(';')[0]).join('; '),
            text,
            json: text ? JSON.parse(text) : null,
          });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
