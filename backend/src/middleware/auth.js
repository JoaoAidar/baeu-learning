import crypto from 'node:crypto';
import { fromNodeHeaders } from 'better-auth/node';
import { getAuth } from '../auth.js';
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

async function getSessionFromReq(req) {
  try {
    const auth = getAuth();
    return await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
  } catch {
    return null;
  }
}

export async function requireUser(req, res, next) {
  const session = await getSessionFromReq(req);
  if (!session?.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  req.user = session.user;
  req.userId = session.user.id;
  req.userEmail = session.user.email;
  next();
}

// Soft auth helper: populates req.userId if a valid session cookie is present,
// but lets unauthenticated requests through. Used by /modules.
export async function maybeUser(req, _res, next) {
  const session = await getSessionFromReq(req);
  if (session?.user) {
    req.user = session.user;
    req.userId = session.user.id;
    req.userEmail = session.user.email;
  }
  next();
}

export async function requireAdmin(req, res, next) {
  // 1. Static admin-token path (preserved for operator tooling/CI).
  const expected = process.env.ADMIN_TOKEN;
  const got = req.header('x-admin-token');
  if (expected && got && timingSafeEqualStr(got, expected)) {
    req.adminVia = 'token';
    req.userRole = 'admin';
    return next();
  }
  // 2. Session-based path. User must be authenticated AND have role='admin'
  //    in the user_role table.
  const session = await getSessionFromReq(req);
  if (!session?.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const store = getStore();
    const role =
      typeof store.getUserRole === 'function'
        ? await store.getUserRole(session.user.id)
        : 'user';
    if (role !== 'admin') {
      return res.status(403).json({ error: 'forbidden' });
    }
    req.user = session.user;
    req.userId = session.user.id;
    req.userEmail = session.user.email;
    req.userRole = 'admin';
    req.adminVia = 'session';
    return next();
  } catch (err) {
    return next(err);
  }
}

export const _internals = { timingSafeEqualStr };
