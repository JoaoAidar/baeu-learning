import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Analytics from '../src/services/AnalyticsService.js';
import * as Practice from '../src/services/PracticeService.js';
import { SAMPLE_EXERCISES } from '../src/db/seed.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-long-enough';
  resetStoreForTests(memoryStore);
});

beforeEach(async () => {
  memoryStore.reset();
  await memoryStore.insertExercises(SAMPLE_EXERCISES);
  await memoryStore.createUser({ email: 'a@example.com' });
});

test('learnerAnalytics: shape is correct with zero attempts', async () => {
  const user = await memoryStore.getUserByEmail('a@example.com');
  const r = await Analytics.learnerAnalytics({ userId: user.id, days: 30 });
  assert.equal(r.totals.attempts, 0);
  assert.equal(r.daily.length, 30);
  assert.equal(r.toughestExercises.length, 0);
  assert.deepEqual(
    r.masteryByLevel.map((m) => m.level),
    [0, 1, 2, 3, 4, 5]
  );
});

test('learnerAnalytics: aggregates daily + toughest after attempts', async () => {
  const user = await memoryStore.getUserByEmail('a@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const exes = await memoryStore.listPublishedExercises();
  // Same exercise twice, both wrong → should be the toughest with 0% accuracy.
  await Practice.submitAnswer({ sessionId: session.id, exerciseId: exes[0].id, answer: 'wrong-1' });
  await Practice.submitAnswer({ sessionId: session.id, exerciseId: exes[0].id, answer: 'wrong-2' });
  await Practice.submitAnswer({
    sessionId: session.id,
    exerciseId: exes[1].id,
    answer: exes[1].correct_answer,
  });
  const r = await Analytics.learnerAnalytics({ userId: user.id, days: 30 });
  assert.equal(r.totals.attempts, 3);
  assert.equal(r.totals.correct, 1);
  assert.ok(r.toughestExercises.length >= 1, 'expected at least one toughest item');
  assert.equal(r.toughestExercises[0].exerciseId, exes[0].id);
  assert.equal(r.toughestExercises[0].accuracy, 0);
});

test('computeRetention: streaks and D1/D7 comeback rates are deterministic', () => {
  const now = new Date('2026-06-10T12:00:00Z');
  // Practiced: Jun 1,2,3 (3-day run), skipped, Jun 8.
  const days = new Set(['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-08']);
  const r = Analytics._internals.computeRetention(days, now);
  assert.equal(r.activeDays, 4);
  assert.equal(r.longestStreak, 3);
  assert.equal(r.currentStreak, 0, 'no practice on Jun 9 or 10 → streak broken');
  // D1 denominator: days with a next-day chance (all 4 are ≤ Jun 9). Jun 1→2 yes,
  // Jun 2→3 yes, Jun 3→4 no, Jun 8→9 no = 2/4.
  assert.equal(r.d1ComebackRate, 2 / 4);
  // D7 denominator: days with a full 7-day chance (≤ Jun 3). Jun 1 (→8 within 7) yes,
  // Jun 2 (→8 within 7) yes, Jun 3 (→8>+7? 3+7=10≥8 yes) yes = 3/3.
  assert.equal(r.d7ComebackRate, 3 / 3);
});

test('responseTimeStats: quadrants, automaticity, and averages', () => {
  const A = (correct, ms) => ({ correct, response_ms: ms });
  const stats = Analytics._internals.responseTimeStats(
    [
      A(true, 2000), // fast correct
      A(true, 9000), // slow correct
      A(false, 1000), // fast wrong
      A(false, 12000), // slow wrong
      A(true, 4000), // fast correct
      { correct: true }, // no response_ms → ignored
    ],
    6000
  );
  assert.equal(stats.count, 5, 'untimed attempt excluded');
  assert.deepEqual(stats.speedAccuracy, {
    fastCorrect: 2,
    slowCorrect: 1,
    fastWrong: 1,
    slowWrong: 1,
  });
  assert.equal(stats.automaticityRate, 2 / 3); // 2 fast-correct of 3 correct
  assert.equal(stats.avgCorrectMs, Math.round((2000 + 9000 + 4000) / 3));
  assert.equal(stats.medianMs, 4000); // sorted [1000,2000,4000,9000,12000]
});

test('computeForgetting: leeches, relearn, due, mature from SRS rows', () => {
  const now = Date.parse('2026-06-13T12:00:00Z');
  const rows = [
    { exercise_id: 'leech', lapses: 4, repetitions: 0, interval_days: 0, ease: 1.6, due_at: '2026-06-13T11:00:00Z' }, // overdue, in relearn
    { exercise_id: 'shaky', lapses: 2, repetitions: 3, interval_days: 5, ease: 2.1, due_at: '2026-06-20T00:00:00Z' }, // leech but not due
    { exercise_id: 'mature', lapses: 0, repetitions: 6, interval_days: 30, ease: 2.6, due_at: '2026-07-10T00:00:00Z' }, // mature
    { exercise_id: 'fresh', lapses: 0, repetitions: 1, interval_days: 1, ease: 2.5, due_at: '2026-06-13T06:00:00Z' }, // due now
  ];
  const f = Analytics._internals.computeForgetting(rows, now);
  assert.equal(f.trackedItems, 4);
  assert.equal(f.totalLapses, 6);
  assert.equal(f.itemsInRelearn, 1); // only 'leech' (lapses>0 & reps===0)
  assert.equal(f.dueNow, 2); // 'leech' and 'fresh'
  assert.equal(f.matureItems, 1); // 'mature' (interval>=21)
  assert.deepEqual(f.leeches.map((l) => l.exerciseId), ['leech', 'shaky']); // lapses>=2, sorted desc
});

test('responseTimeBySkill: avg per skill from timed attempts', () => {
  const rows = [
    { correct: true, response_ms: 2000, skill_tags: ['particles'] },
    { correct: false, response_ms: 8000, skill_tags: ['particles'] },
    { correct: true, response_ms: 1000, skill_tags: ['hangul'] },
    { correct: true, response_ms: 3000, skill_tags: ['hangul'] },
    { correct: true, skill_tags: ['hangul'] }, // untimed → ignored
  ];
  const r = Analytics._internals.responseTimeBySkill(rows);
  const particles = r.find((x) => x.skill === 'particles');
  const hangul = r.find((x) => x.skill === 'hangul');
  assert.equal(particles.avgMs, 5000);
  assert.equal(particles.attempts, 2);
  assert.equal(hangul.avgMs, 2000);
  assert.equal(hangul.accuracy, 1);
  assert.equal(r[0].skill, 'particles'); // slowest first
});

test('sentenceErrorBreakdown: scopes error tags to text exercises only', () => {
  const rows = [
    { exercise_type: 'translation', correct: false, error_tags: ['tense', 'particle'] },
    { exercise_type: 'fill_blank', correct: false, error_tags: ['particle'] },
    { exercise_type: 'translation', correct: true, error_tags: [] },
    { exercise_type: 'multiple_choice', correct: false, error_tags: ['vocabulary'] }, // excluded
    { exercise_type: null, correct: false, error_tags: ['tense'] }, // legacy → excluded
  ];
  const r = Analytics._internals.sentenceErrorBreakdown(rows);
  assert.equal(r.textAttempts, 3);
  assert.equal(r.textWrong, 2);
  assert.deepEqual(r.byTag, { tense: 1, particle: 2 });
});

test('responseTimeStats: empty input is null-safe', () => {
  const s = Analytics._internals.responseTimeStats([]);
  assert.equal(s.count, 0);
  assert.equal(s.automaticityRate, null);
  assert.deepEqual(s.speedAccuracy, { fastCorrect: 0, slowCorrect: 0, fastWrong: 0, slowWrong: 0 });
});

test('learnerAnalytics: includes retention block', async () => {
  const user = await memoryStore.getUserByEmail('a@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const exes = await memoryStore.listPublishedExercises();
  await Practice.submitAnswer({ sessionId: session.id, exerciseId: exes[0].id, answer: 'x' });
  const r = await Analytics.learnerAnalytics({ userId: user.id, days: 30 });
  assert.ok(r.retention, 'retention block present');
  assert.equal(r.retention.activeDays, 1);
  assert.equal(r.retention.currentStreak, 1, 'practiced today → 1-day streak');
});

test('adminAnalytics: rolls up by module and flags calibration outliers', async () => {
  const user = await memoryStore.getUserByEmail('a@example.com');
  const session = await Practice.startSession({ userId: user.id });
  const exes = await memoryStore.listPublishedExercises();
  // Force one exercise to be "too easy" (≥10 attempts, ≥95% correct).
  for (let i = 0; i < 12; i++) {
    await Practice.submitAnswer({
      sessionId: session.id,
      exerciseId: exes[0].id,
      answer: exes[0].correct_answer,
    });
  }
  const r = await Analytics.adminAnalytics({ days: 30 });
  assert.ok(r.totals.attempts >= 12);
  assert.ok(r.totals.activeLearners >= 1);
  assert.ok(r.moduleRollup.length >= 1, 'expected at least one module rollup row');
  // The hot item should be classified as too_easy.
  const easy = r.exerciseDifficulty.find((e) => e.exerciseId === exes[0].id);
  assert.ok(easy, 'expected the repeated exercise to show in difficulty list');
  assert.equal(easy.calibrationSignal, 'too_easy');
});
