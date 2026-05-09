import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { _internals, rateLimit, authRateLimit } from '../src/middleware/rateLimit.js';

beforeEach(() => {
  _internals.buckets.clear();
});

function fakeReq({ ip = '1.2.3.4', body = {} } = {}) {
  return { ip, socket: { remoteAddress: ip }, body, header: () => null };
}
function fakeRes() {
  const res = {};
  res.set = () => res;
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

test('rateLimit allows up to max in window then 429s', () => {
  const mw = rateLimit({ prefix: 't', max: 3, windowMs: 60_000 });
  const calls = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const res = fakeRes();
    mw(fakeReq(), res, () => calls[i]++);
    if (i < 3) assert.equal(calls[i], 1);
    else assert.equal(res._status, 429);
  }
});

test('rateLimit isolates by IP', () => {
  const mw = rateLimit({ prefix: 't', max: 1, windowMs: 60_000 });
  const r1 = fakeRes(); let n1 = 0;
  mw(fakeReq({ ip: '1.1.1.1' }), r1, () => n1++);
  assert.equal(n1, 1);

  const r2 = fakeRes(); let n2 = 0;
  mw(fakeReq({ ip: '2.2.2.2' }), r2, () => n2++);
  assert.equal(n2, 1, 'different IP should pass');
});

test('authRateLimit keys by ip+email', () => {
  const mw = authRateLimit({ prefix: 'login', max: 1, windowMs: 60_000 });
  const r1 = fakeRes(); let n1 = 0;
  mw(fakeReq({ ip: '1.1.1.1', body: { email: 'a@x.com' } }), r1, () => n1++);
  assert.equal(n1, 1);

  // same email same ip -> blocked
  const r2 = fakeRes(); let n2 = 0;
  mw(fakeReq({ ip: '1.1.1.1', body: { email: 'a@x.com' } }), r2, () => n2++);
  assert.equal(r2._status, 429);

  // different email same ip -> allowed
  const r3 = fakeRes(); let n3 = 0;
  mw(fakeReq({ ip: '1.1.1.1', body: { email: 'b@x.com' } }), r3, () => n3++);
  assert.equal(n3, 1);
});

test('rateLimit window resets', () => {
  const past = Date.now() - 10 * 60_000;
  _internals.buckets.set('t::1.2.3.4', { count: 100, windowStart: past });
  const mw = rateLimit({ prefix: 't', max: 3, windowMs: 60_000 });
  const res = fakeRes(); let n = 0;
  mw(fakeReq(), res, () => n++);
  assert.equal(n, 1, 'expired window should reset and allow');
});
