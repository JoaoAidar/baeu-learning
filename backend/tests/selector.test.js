import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectNext, computeWeakSkills } from '../src/services/ExerciseSelector.js';

const make = (id, skills, type = 'translation') => ({
  id,
  type,
  skill_tags: skills,
});

test('focus=weak filters to candidates whose skills overlap with user weak skills', () => {
  const exercises = [
    make('e1', ['greetings']),
    make('e2', ['particles']),
    make('e3', ['verbs']),
    make('e4', ['particles', 'verbs']),
  ];
  const recentAttempts = [
    { correct: false, skill_tags: ['particles'], error_tags: ['particle'], exercise_id: 'x' },
    { correct: false, skill_tags: ['particles'], error_tags: ['particle'], exercise_id: 'y' },
    { correct: false, skill_tags: ['verbs'], error_tags: ['verb_conjugation'], exercise_id: 'z' },
    { correct: true, skill_tags: ['greetings'], error_tags: [], exercise_id: 'g' },
  ];
  const ex = selectNext({ exercises, recentAttempts, sessionAttempts: [], focus: 'weak' });
  assert.ok(['e2', 'e3', 'e4'].includes(ex.id), `picked ${ex.id}`);
  assert.notEqual(ex.id, 'e1');
});

test('focus=weak with no weak history falls back to normal selection', () => {
  const exercises = [make('a', ['greetings']), make('b', ['food'])];
  const ex = selectNext({ exercises, recentAttempts: [], sessionAttempts: [], focus: 'weak' });
  assert.ok(['a', 'b'].includes(ex.id));
});

test('skips exercises already seen in this session', () => {
  const exercises = [make('a', ['x']), make('b', ['y'])];
  const ex = selectNext({
    exercises,
    recentAttempts: [],
    sessionAttempts: [{ exercise_id: 'a', skill_tags: ['x'], correct: true, error_tags: [] }],
  });
  assert.equal(ex.id, 'b');
});

test('computeWeakSkills aggregates only wrong attempts', () => {
  const ws = computeWeakSkills([
    { correct: false, skill_tags: ['particles'] },
    { correct: false, skill_tags: ['particles', 'verbs'] },
    { correct: true, skill_tags: ['particles'] },
  ]);
  assert.equal(ws[0].skill, 'particles');
  assert.equal(ws[0].count, 2);
});
