import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { perfMiddleware, snapshotMetrics, _resetPerfRing } from '../src/middleware/perf.js';

function makeReqRes({ method = 'GET', path = '/x', status = 200 } = {}) {
  const listeners = {};
  const req = { method, originalUrl: path, url: path, headers: {} };
  const res = {
    statusCode: status,
    on(evt, fn) { listeners[evt] = fn; },
    finish() { listeners.finish && listeners.finish(); },
  };
  return { req, res };
}

beforeEach(() => _resetPerfRing());

test('records samples and computes overall + by-route stats', async () => {
  const calls = [
    { path: '/api/v1/health', status: 200 },
    { path: '/api/v1/health', status: 200 },
    { path: '/api/v1/practice/sessions/3f29c1a8-5b21-4e7e-9f10-1b2c3d4e5f60', status: 200 },
  ];
  for (const c of calls) {
    const { req, res } = makeReqRes(c);
    perfMiddleware(req, res, () => {});
    res.finish();
  }
  const snap = snapshotMetrics({});
  assert.equal(snap.overall.count, 3);
  // UUID-ish path should be templated to :id
  const templated = snap.byRoute.find((r) => r.route.includes(':id'));
  assert.ok(templated, 'expected uuid path to be templated');
});

test('templates numeric path segments', () => {
  const { req, res } = makeReqRes({ path: '/api/v1/exercises/42/status' });
  perfMiddleware(req, res, () => {});
  res.finish();
  const snap = snapshotMetrics({});
  const route = snap.byRoute[0].route;
  assert.ok(route.includes('/:id/status'), `unexpected route: ${route}`);
});
