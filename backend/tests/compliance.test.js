import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Auth from '../src/services/AuthService.js';
import { requireUser } from '../src/middleware/auth.js';
import { isPatternAllowed } from '../src/db/cleanup-test-users.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(() => {
  memoryStore.reset();
});

function fakeReqRes(token) {
  const req = {
    header(name) {
      if (String(name).toLowerCase() === 'authorization') return `Bearer ${token}`;
      return undefined;
    },
  };
  let statusCode = 200;
  let body = null;
  const res = {
    status(c) { statusCode = c; return this; },
    json(b) { body = b; return this; },
  };
  return { req, res, get statusCode() { return statusCode; }, get body() { return body; } };
}

async function runMw(token) {
  const ctx = fakeReqRes(token);
  let nextCalled = false;
  let nextErr = null;
  await new Promise((resolve) => {
    const ret = requireUser(ctx.req, ctx.res, (err) => {
      nextCalled = true;
      nextErr = err || null;
      resolve();
    });
    // requireUser is async — if it didn't call next, it called res.status/json; resolve when those happen.
    if (ret && typeof ret.then === 'function') {
      ret.then(() => resolve());
    }
  });
  return { nextCalled, nextErr, statusCode: ctx.statusCode, body: ctx.body };
}

test('deleteAccount removes user; subsequent auth fails', async () => {
  const { user, token } = await Auth.signup({ email: 'del@example.com', password: 'password1' });
  // sanity: token works
  const r1 = await runMw(token);
  assert.equal(r1.nextCalled, true);
  // delete
  await Auth.deleteAccount({ userId: user.id });
  assert.equal(await memoryStore.getUserById(user.id), null);
  // token now fails: requireUser cannot find user
  const r2 = await runMw(token);
  assert.equal(r2.nextCalled, false);
  assert.equal(r2.statusCode, 401);
});

test('logoutAll bumps token_version and invalidates old JWTs', async () => {
  const { user, token } = await Auth.signup({ email: 'lo@example.com', password: 'password1' });
  // old token works
  const r1 = await runMw(token);
  assert.equal(r1.nextCalled, true, 'fresh JWT must be accepted');
  // logout-all
  const out = await Auth.logoutAll({ userId: user.id });
  assert.equal(out.ok, true);
  assert.equal(out.token_version, 1);
  // old token rejected
  const r2 = await runMw(token);
  assert.equal(r2.nextCalled, false);
  assert.equal(r2.statusCode, 401);
  // newly issued token works again
  const fresh = await memoryStore.getUserById(user.id);
  const newToken = Auth.signToken(fresh);
  const r3 = await runMw(newToken);
  assert.equal(r3.nextCalled, true);
});

test('backward compat: JWT minted without tv claim still works when token_version === 0', async () => {
  const { user } = await Auth.signup({ email: 'bc@example.com', password: 'password1' });
  // forge a legacy-style JWT with no `tv` claim
  const legacy = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
  const r1 = await runMw(legacy);
  assert.equal(r1.nextCalled, true, 'legacy JWT (no tv) must be accepted when token_version is 0');

  // after logout-all, same legacy token must fail
  await Auth.logoutAll({ userId: user.id });
  const r2 = await runMw(legacy);
  assert.equal(r2.nextCalled, false);
  assert.equal(r2.statusCode, 401);
});

test('cleanup-test-users pattern guard fails closed', () => {
  // refused
  assert.equal(isPatternAllowed('%'), false, 'bare wildcard');
  assert.equal(isPatternAllowed(''), false, 'empty string');
  assert.equal(isPatternAllowed('%@test.local'), false, 'no audit- prefix');
  assert.equal(isPatternAllowed('admin%@test.local'), false, 'wrong prefix');
  assert.equal(isPatternAllowed('audit-%'), false, 'no @test.local');
  assert.equal(isPatternAllowed('audit-%@example.com'), false, 'wrong domain');
  // accepted
  assert.equal(isPatternAllowed('audit-%@test.local'), true);
  assert.equal(isPatternAllowed('audit-2025-%@test.local'), true);
});
