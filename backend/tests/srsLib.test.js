import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextSrsState, MIN_EASE, DEFAULT_EASE, round } from '../src/lib/srs/index.js';

// The pure lib must stand on its own — no app/store imports — so the fleet can
// lift it out. These tests exercise it directly via its own entry point.

test('lib: deterministic for the same inputs (pure)', () => {
  const now = new Date('2026-06-01T12:00:00Z');
  const a = nextSrsState(null, true, now);
  const b = nextSrsState(null, true, now);
  assert.deepEqual(a, b);
});

test('lib: first correct review = 1d interval, reps 1', () => {
  const now = new Date('2026-06-01T12:00:00Z');
  const s = nextSrsState(null, true, now);
  assert.equal(s.interval_days, 1);
  assert.equal(s.repetitions, 1);
  assert.equal(s.ease, round(DEFAULT_EASE + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02))));
});

test('lib: ease floors at MIN_EASE under repeated misses', () => {
  const now = new Date('2026-06-01T12:00:00Z');
  let s = nextSrsState(null, false, now);
  for (let i = 0; i < 25; i++) s = nextSrsState(s, false, now);
  assert.equal(s.ease, MIN_EASE);
  assert.equal(s.interval_days, 0);
  assert.equal(s.repetitions, 0);
});
