// Lightweight in-memory token bucket. Per-process, fine for single Railway dyno.
// For multi-replica, swap to Redis. Each bucket is keyed by IP or user/admin token.

const buckets = new Map();
const SWEEP_MS = 5 * 60 * 1000;

function key(prefix, id) {
  return `${prefix}::${id}`;
}

function take({ k, max, windowMs, now = Date.now() }) {
  let b = buckets.get(k);
  if (!b || now - b.windowStart >= windowMs) {
    b = { count: 0, windowStart: now };
    buckets.set(k, b);
  }
  if (b.count >= max) {
    const retryAfter = Math.ceil((b.windowStart + windowMs - now) / 1000);
    return { ok: false, retryAfter };
  }
  b.count += 1;
  return { ok: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now - b.windowStart > 60 * 60 * 1000) buckets.delete(k);
  }
}, SWEEP_MS).unref?.();

function clientId(req, prefix) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return key(prefix, ip);
}

export function rateLimit({ prefix, max, windowMs }) {
  return (req, res, next) => {
    const r = take({ k: clientId(req, prefix), max, windowMs });
    if (!r.ok) {
      res.set('Retry-After', String(r.retryAfter));
      return res.status(429).json({ error: 'rate_limited', retryAfter: r.retryAfter });
    }
    next();
  };
}

// Helper: combine email + IP for auth so attackers can't burn through users.
export function authRateLimit({ max, windowMs, prefix }) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const email = (req.body?.email || 'anon').toLowerCase();
    const k = key(prefix, `${ip}::${email}`);
    const r = take({ k, max, windowMs });
    if (!r.ok) {
      res.set('Retry-After', String(r.retryAfter));
      return res.status(429).json({ error: 'rate_limited', retryAfter: r.retryAfter });
    }
    next();
  };
}

export const _internals = { buckets, take };
