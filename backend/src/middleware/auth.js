import crypto from 'node:crypto';
import { verifyToken } from '../services/AuthService.js';
import { getStore } from '../config/db.js';

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  try {
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export function requireUser(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload?.sub) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  req.userId = payload.sub;
  req.userRole = payload.role || 'user';
  req.userEmail = payload.email;
  next();
}

export async function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  const got = req.header('x-admin-token');
  if (expected && got && timingSafeEqualStr(got, expected)) {
    req.adminVia = 'token';
    return next();
  }
  // Fallback: JWT-authenticated user, re-checked against the store.
  const header = req.header('authorization') || '';
  const tok = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = tok ? verifyToken(tok) : null;
  if (!payload?.sub) {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const store = getStore();
    const user = await store.getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'forbidden' });
    }
    req.userId = user.id;
    req.userRole = 'admin';
    req.adminVia = 'jwt';
    return next();
  } catch (err) {
    return next(err);
  }
}
