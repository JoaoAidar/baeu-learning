import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { getStore } from '../config/db.js';

const scrypt = promisify(scryptCb);
const KEYLEN = 64;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, saltHex, hashHex] = stored.split('$');
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = await scrypt(password, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
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
    { sub: user.id, email: user.email, role: user.role },
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
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw httpError(401, 'invalid_credentials');
  return { user: publicUser(user), token: signToken(user) };
}

export async function me({ userId }) {
  const store = getStore();
  const user = await store.getUserById(userId);
  if (!user) throw httpError(404, 'user_not_found');
  return publicUser(user);
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

export const _internals = { hashPassword, verifyPassword };
