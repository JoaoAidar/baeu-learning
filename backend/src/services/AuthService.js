import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { getStore } from '../config/db.js';

const scrypt = promisify(scryptCb);
const KEYLEN = 64;

// Explicit scrypt params, pinned in code so behavior doesn't depend on
// node:crypto defaults. OWASP minimum (2023+) for scrypt: N=2^17, r=8, p=1.
// `maxmem` must be raised to fit N*r*128 bytes plus overhead.
const SCRYPT_PARAMS = Object.freeze({
  N: 1 << 17, // 131072
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024, // 256 MiB
});

// Tagged hash format: `scrypt$N$r$p$saltHex$hashHex`.
// Legacy un-parameterized format (`scrypt$saltHex$hashHex`) was minted with
// node:crypto scrypt defaults (N=16384, r=8, p=1). We accept it transparently
// in verify() and re-hash on successful login.
const LEGACY_SCRYPT_PARAMS = Object.freeze({ N: 16384, r: 8, p: 1 });

async function deriveKey(password, salt, keylen, params) {
  // Pass through cost params explicitly. maxmem default is too small for N>=2^17.
  return scrypt(password, salt, keylen, {
    N: params.N,
    r: params.r,
    p: params.p,
    maxmem: params.maxmem ?? Math.max(32 * 1024 * 1024, 128 * params.N * params.r * 2),
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt, KEYLEN, SCRYPT_PARAMS);
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/**
 * Verify a password against a stored hash.
 * Returns `{ ok, rehash }`:
 *   - ok: whether password matches.
 *   - rehash: a fresh tagged hash if the stored hash was legacy / under-cost,
 *             so callers can persist the upgraded form. null otherwise.
 */
async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.startsWith('scrypt$')) {
    return { ok: false, rehash: null };
  }
  const parts = stored.split('$');
  // Tagged: ['scrypt', N, r, p, salt, hash]
  // Legacy: ['scrypt', salt, hash]
  let params;
  let saltHex;
  let hashHex;
  let isLegacy;
  if (parts.length === 6) {
    const [, nStr, rStr, pStr, sHex, hHex] = parts;
    const N = Number(nStr);
    const r = Number(rStr);
    const p = Number(pStr);
    if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
      return { ok: false, rehash: null };
    }
    params = { N, r, p, maxmem: Math.max(32 * 1024 * 1024, 256 * 1024 * 1024) };
    saltHex = sHex;
    hashHex = hHex;
    isLegacy = false;
  } else if (parts.length === 3) {
    [, saltHex, hashHex] = parts;
    params = { ...LEGACY_SCRYPT_PARAMS };
    isLegacy = true;
  } else {
    return { ok: false, rehash: null };
  }

  let salt;
  let expected;
  try {
    salt = Buffer.from(saltHex, 'hex');
    expected = Buffer.from(hashHex, 'hex');
  } catch {
    return { ok: false, rehash: null };
  }
  if (!salt.length || !expected.length) return { ok: false, rehash: null };

  let derived;
  try {
    derived = await deriveKey(password, salt, expected.length, params);
  } catch {
    return { ok: false, rehash: null };
  }
  const ok = derived.length === expected.length && timingSafeEqual(derived, expected);
  if (!ok) return { ok: false, rehash: null };

  // Re-hash if stored used legacy format OR weaker-than-current params.
  const needsRehash =
    isLegacy ||
    params.N < SCRYPT_PARAMS.N ||
    params.r < SCRYPT_PARAMS.r ||
    params.p < SCRYPT_PARAMS.p;
  const rehash = needsRehash ? await hashPassword(password) : null;
  return { ok: true, rehash };
}

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw httpError(500, 'jwt_secret_missing');
  }
  return s;
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, tv: user.token_version ?? 0 },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export async function signup({ email, password, displayName }) {
  const store = getStore();
  const normEmail = normalizeEmail(email);
  if (!EMAIL_RE.test(normEmail)) throw httpError(400, 'invalid_email');
  if (!password || password.length < 8) throw httpError(400, 'weak_password');

  const existing = await store.getUserByEmail(normEmail);
  if (existing) throw httpError(409, 'email_taken');

  const password_hash = await hashPassword(password);
  const user = await store.createUser({
    email: normEmail,
    password_hash,
    display_name: displayName || null,
  });
  return { user: publicUser(user), token: signToken(user) };
}

export async function login({ email, password }) {
  const store = getStore();
  const user = await store.getUserByEmail(normalizeEmail(email));
  if (!user) throw httpError(401, 'invalid_credentials');
  const { ok, rehash } = await verifyPassword(password, user.password_hash);
  if (!ok) throw httpError(401, 'invalid_credentials');
  // Transparently upgrade legacy / under-cost hashes on successful login.
  if (rehash && typeof store.updateUserPasswordHash === 'function') {
    try {
      await store.updateUserPasswordHash(user.id, rehash);
    } catch {
      // non-fatal: login still succeeds even if the upgrade write fails.
    }
  }
  return { user: publicUser(user), token: signToken(user) };
}

export async function me({ userId }) {
  const store = getStore();
  const user = await store.getUserById(userId);
  if (!user) throw httpError(404, 'user_not_found');
  return publicUser(user);
}

export async function deleteAccount({ userId }) {
  const store = getStore();
  const user = await store.getUserById(userId);
  if (!user) throw httpError(404, 'user_not_found');
  await store.deleteUser(userId);
}

export async function logoutAll({ userId }) {
  const store = getStore();
  const user = await store.getUserById(userId);
  if (!user) throw httpError(404, 'user_not_found');
  const tv = await store.incrementTokenVersion(userId);
  return { ok: true, token_version: tv };
}

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    role: u.role,
  };
}

function httpError(status, code) {
  const e = new Error(code);
  e.status = status;
  return e;
}

export const _internals = { hashPassword, verifyPassword, SCRYPT_PARAMS, LEGACY_SCRYPT_PARAMS };
