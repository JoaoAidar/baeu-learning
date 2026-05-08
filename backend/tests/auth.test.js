import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Auth from '../src/services/AuthService.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(() => {
  memoryStore.reset();
});

test('signup creates user and returns token', async () => {
  const { user, token } = await Auth.signup({
    email: 'A@example.com',
    password: 'password1!',
    displayName: 'Alice',
  });
  assert.equal(user.email, 'a@example.com'); // normalized
  assert.equal(user.role, 'user');
  assert.ok(token);
  const payload = Auth.verifyToken(token);
  assert.equal(payload.sub, user.id);
});

test('signup rejects invalid email and weak password', async () => {
  await assert.rejects(
    Auth.signup({ email: 'not-an-email', password: 'password1' }),
    (e) => e.status === 400 && e.message === 'invalid_email'
  );
  await assert.rejects(
    Auth.signup({ email: 'b@example.com', password: 'short' }),
    (e) => e.status === 400 && e.message === 'weak_password'
  );
});

test('signup rejects duplicate email (case-insensitive)', async () => {
  await Auth.signup({ email: 'dup@example.com', password: 'password1' });
  await assert.rejects(
    Auth.signup({ email: 'DUP@example.com', password: 'password1' }),
    (e) => e.status === 409 && e.message === 'email_taken'
  );
});

test('login succeeds with right password, fails otherwise', async () => {
  await Auth.signup({ email: 'c@example.com', password: 'password1' });
  const ok = await Auth.login({ email: 'c@example.com', password: 'password1' });
  assert.ok(ok.token);
  await assert.rejects(
    Auth.login({ email: 'c@example.com', password: 'wrong' }),
    (e) => e.status === 401
  );
  await assert.rejects(
    Auth.login({ email: 'nobody@example.com', password: 'password1' }),
    (e) => e.status === 401
  );
});

test('verifyToken rejects garbage', () => {
  assert.equal(Auth.verifyToken('not-a-jwt'), null);
  assert.equal(Auth.verifyToken(''), null);
});

test('me returns the public user', async () => {
  const { user } = await Auth.signup({ email: 'd@example.com', password: 'password1' });
  const u = await Auth.me({ userId: user.id });
  assert.equal(u.id, user.id);
  assert.equal(u.email, 'd@example.com');
  assert.equal(u.password_hash, undefined);
});
