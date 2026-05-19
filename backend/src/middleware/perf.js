// Request timing + in-memory metrics ring buffer.
//
// - Emits a structured JSON log per request (method, path, status, ms).
// - Records the sample into a bounded ring so /api/v1/admin/metrics can
//   compute p50/p95/p99 without external infra.
// - Path templating collapses ids/uuids so per-route stats don't explode.
//
// Slow-query logging lives in repositories/pgStore.js (wraps pool.query) so
// every DB roundtrip is observable, not just request-scoped ones.

const RING_SIZE = Number(process.env.PERF_RING_SIZE) || 1000;
const SLOW_REQ_MS = Number(process.env.PERF_SLOW_REQ_MS) || 500;

const ring = new Array(RING_SIZE);
let ringIdx = 0;
let ringCount = 0;

function pushSample(sample) {
  ring[ringIdx] = sample;
  ringIdx = (ringIdx + 1) % RING_SIZE;
  if (ringCount < RING_SIZE) ringCount++;
}

function templatePath(p) {
  if (!p) return p;
  // Strip query, then replace uuid + numeric ids with :id token.
  const noQuery = p.split('?')[0];
  return noQuery
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

export function perfMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const path = templatePath(req.originalUrl || req.url || '');
    const sample = {
      t: Date.now(),
      method: req.method,
      path,
      status: res.statusCode,
      ms,
    };
    pushSample(sample);
    if (ms >= SLOW_REQ_MS) {
      console.warn(
        `[baeu][perf] slow ${req.method} ${path} ${res.statusCode} ${ms.toFixed(1)}ms`
      );
    } else if (process.env.PERF_LOG_ALL === '1') {
      console.log(
        `[baeu][perf] ${req.method} ${path} ${res.statusCode} ${ms.toFixed(1)}ms`
      );
    }
  });
  next();
}

function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function snapshotMetrics({ sinceMs } = {}) {
  const cutoff = sinceMs ? Date.now() - sinceMs : 0;
  const samples = [];
  for (let i = 0; i < ringCount; i++) {
    const s = ring[i];
    if (s && s.t >= cutoff) samples.push(s);
  }
  if (!samples.length) {
    return { window: { sinceMs: sinceMs || null, count: 0 }, overall: null, byRoute: [] };
  }
  const all = samples.map((s) => s.ms).sort((a, b) => a - b);
  const errors = samples.filter((s) => s.status >= 500).length;
  const clientErrors = samples.filter((s) => s.status >= 400 && s.status < 500).length;
  const groups = new Map();
  for (const s of samples) {
    const key = `${s.method} ${s.path}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  const byRoute = [...groups.entries()]
    .map(([key, arr]) => {
      const lat = arr.map((s) => s.ms).sort((a, b) => a - b);
      return {
        route: key,
        count: arr.length,
        p50: round1(quantile(lat, 0.5)),
        p95: round1(quantile(lat, 0.95)),
        p99: round1(quantile(lat, 0.99)),
        max: round1(lat[lat.length - 1]),
        errorCount: arr.filter((s) => s.status >= 500).length,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
  return {
    window: {
      sinceMs: sinceMs || null,
      count: samples.length,
      ringCapacity: RING_SIZE,
    },
    overall: {
      count: samples.length,
      errorCount: errors,
      clientErrorCount: clientErrors,
      p50: round1(quantile(all, 0.5)),
      p95: round1(quantile(all, 0.95)),
      p99: round1(quantile(all, 0.99)),
      max: round1(all[all.length - 1]),
    },
    byRoute,
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Test-only reset.
export function _resetPerfRing() {
  for (let i = 0; i < ring.length; i++) ring[i] = undefined;
  ringIdx = 0;
  ringCount = 0;
}
