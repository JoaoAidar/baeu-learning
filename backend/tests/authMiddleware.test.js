import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import { requireUser, requireAdmin } from '../src/middleware/auth.js';

before(() => {
  // Better Auth needs a secret + base URL. Tests don't make real HTTP calls
  // through Better Auth; they exercise the middleware's session-resolution path.
  process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'test-secret-12345678901234567890';
  process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
  resetStoreForTests(memoryStore);
});

beforeEach(() => {
  memoryStore.reset();
});

function mockReqRes(headers = {}) {
  const req = {
    headers,
    header(name) {
      return headers[String(name).toLowerCase()];
    },
  };
  let statusCode = 200;
  let body = null;
  const res = {
    status(c) {
      statusCode = c;
      return this;
    },
    json(b) {
      body = b;
      return this;
    },
  };
  return {
    req,
    res,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
  };
}

async function run(mw, headers = {}) {
  const ctx = mockReqRes(headers);
  let nextCalled = false;
  let nextErr = null;
  await new Promise((resolve) => {
    const ret = mw(ctx.req, ctx.res, (err) => {
      nextCalled = true;
      nextErr = err || null;
      resolve();
    });
    if (ret && typeof ret.then === 'function') ret.then(() => resolve());
  });
  return { nextCalled, nextErr, statusCode: ctx.statusCode, body: ctx.body, req: ctx.req };
}

test('requireUser returns 401 when no session cookie', async () => {
  const r = await run(requireUser, {});
  assert.equal(r.nextCalled, false);
  assert.equal(r.statusCode, 401);
  assert.deepEqual(r.body, { error: 'unauthorized' });
});

test('requireUser returns 401 with a bogus cookie', async () => {
  const r = await run(requireUser, { cookie: 'better-auth.session_token=garbage' });
  assert.equal(r.nextCalled, false);
  assert.equal(r.statusCode, 401);
});

test('requireAdmin via x-admin-token succeeds (timing-safe)', async () => {
  const prev = process.env.ADMIN_TOKEN;
  process.env.ADMIN_TOKEN = 'super-secret-admin-token';
  try {
    const r = await run(requireAdmin, { 'x-admin-token': 'super-secret-admin-token' });
    assert.equal(r.nextCalled, true);
    assert.equal(r.req.adminVia, 'token');
    assert.equal(r.req.userRole, 'admin');
  } finally {
    if (prev === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = prev;
  }
});

test('requireAdmin via wrong x-admin-token falls through to session check (401 no session)', async () => {
  const prev = process.env.ADMIN_TOKEN;
  process.env.ADMIN_TOKEN = 'super-secret-admin-token';
  try {
    const r = await run(requireAdmin, { 'x-admin-token': 'wrong-token' });
    assert.equal(r.nextCalled, false);
    assert.equal(r.statusCode, 401);
  } finally {
    if (prev === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = prev;
  }
});

test('requireAdmin returns 401 when no session AND no admin token', async () => {
  const prev = process.env.ADMIN_TOKEN;
  delete process.env.ADMIN_TOKEN;
  try {
    const r = await run(requireAdmin, {});
    assert.equal(r.nextCalled, false);
    assert.equal(r.statusCode, 401);
  } finally {
    if (prev !== undefined) process.env.ADMIN_TOKEN = prev;
  }
});

test('memoryStore.setUserRole / getUserRole round-trip', async () => {
  await memoryStore.setUserRole('user-abc', 'admin');
  assert.equal(await memoryStore.getUserRole('user-abc'), 'admin');
  await memoryStore.setUserRole('user-abc', 'user');
  assert.equal(await memoryStore.getUserRole('user-abc'), 'user');
  // unknown user defaults to 'user'
  assert.equal(await memoryStore.getUserRole('nobody'), 'user');
  // invalid role rejected
  await assert.rejects(memoryStore.setUserRole('user-abc', 'root'));
});
