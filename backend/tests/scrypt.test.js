import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Auth from '../src/services/AuthService.js';

const scrypt = promisify(scryptCb);

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

/** Mint a legacy `scrypt$saltHex$hashHex` hash with node defaults (no params). */
async function mintLegacyHash(password) {
  const salt = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
  const derived = await scrypt(password, salt, 64); // default cost params
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

test('verifyPassword accepts a legacy hash and returns a rehash', async () => {
  const legacy = await mintLegacyHash('password1!');
  const res = await Auth._internals.verifyPassword('password1!', legacy);
  assert.equal(res.ok, true);
  assert.ok(res.rehash, 'expected a rehash for legacy format');
  // Tagged new format: scrypt$N$r$p$salt$hash → 6 parts.
  assert.equal(res.rehash.split('$').length, 6);
  assert.ok(res.rehash.startsWith(`scrypt$${Auth._internals.SCRYPT_PARAMS.N}$`));
});

test('verifyPassword rejects wrong password on legacy hash', async () => {
  const legacy = await mintLegacyHash('password1!');
  const res = await Auth._internals.verifyPassword('wrong', legacy);
  assert.equal(res.ok, false);
  assert.equal(res.rehash, null);
});

test('verifyPassword works after re-hash (round-trip on new tagged format)', async () => {
  const legacy = await mintLegacyHash('hunter2hunter');
  const upgraded = (await Auth._internals.verifyPassword('hunter2hunter', legacy)).rehash;
  assert.ok(upgraded);
  const res2 = await Auth._internals.verifyPassword('hunter2hunter', upgraded);
  assert.equal(res2.ok, true);
  // Already at current params → no further rehash.
  assert.equal(res2.rehash, null);
});

test('login transparently upgrades a legacy hash on success', async () => {
  memoryStore.reset();
  // Seed a user whose stored hash is in legacy format.
  const legacy = await mintLegacyHash('correct horse');
  const user = await memoryStore.createUser({
    email: 'legacy@example.com',
    password_hash: legacy,
    display_name: null,
  });
  assert.equal(user.password_hash.split('$').length, 3);

  // Log in with the right password — should succeed AND upgrade the stored hash.
  const out = await Auth.login({ email: 'legacy@example.com', password: 'correct horse' });
  assert.ok(out.token);

  const refreshed = await memoryStore.getUserById(user.id);
  assert.equal(refreshed.password_hash.split('$').length, 6, 'stored hash should be upgraded to tagged format');
  // Subsequent login must still work with the upgraded hash.
  const out2 = await Auth.login({ email: 'legacy@example.com', password: 'correct horse' });
  assert.ok(out2.token);
});

test('verifyPassword rejects malformed inputs cleanly', async () => {
  for (const bad of [null, undefined, '', 'not-scrypt$x$y', 'scrypt$onlyone', 'scrypt$$$$$']) {
    const res = await Auth._internals.verifyPassword('pw', bad);
    assert.equal(res.ok, false);
    assert.equal(res.rehash, null);
  }
});
