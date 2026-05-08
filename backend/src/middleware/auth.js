import { verifyToken } from '../services/AuthService.js';

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

export function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  const got = req.header('x-admin-token');
  if (expected && got && got === expected) {
    req.adminVia = 'token';
    return next();
  }
  // Fallback: JWT-authenticated user with role=admin
  const header = req.header('authorization') || '';
  const tok = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = tok ? verifyToken(tok) : null;
  if (payload?.role === 'admin') {
    req.userId = payload.sub;
    req.adminVia = 'jwt';
    return next();
  }
  return res.status(403).json({ error: 'forbidden' });
}
