import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyAnswer } from '../src/services/ErrorClassifier.js';

const mc = {
  type: 'multiple_choice',
  correct_answer: 'a',
  accepted_answers: ['안녕하세요'],
  skill_tags: ['greetings'],
};

test('multiple_choice: correct selection', () => {
  const r = classifyAnswer(mc, 'a');
  assert.equal(r.correct, true);
  assert.deepEqual(r.errorTags, []);
});

test('multiple_choice: wrong selection → vocabulary when topic has no grammar tag', () => {
  const r = classifyAnswer(mc, 'b');
  assert.equal(r.correct, false);
  assert.deepEqual(r.errorTags, ['vocabulary']);
});

test('multiple_choice: wrong selection attributes error to the skill topic', () => {
  const particleMc = { type: 'multiple_choice', correct_answer: 'a', skill_tags: ['object_marker', 'particles'] };
  assert.deepEqual(classifyAnswer(particleMc, 'b').errorTags, ['particle']);

  const verbMc = { type: 'multiple_choice', correct_answer: 'a', skill_tags: ['verbs', 'verb_conjugation', 'polite'] };
  assert.deepEqual(classifyAnswer(verbMc, 'b').errorTags, ['verb_conjugation']);

  const formalityMc = { type: 'multiple_choice', correct_answer: 'a', skill_tags: ['formality', 'honorifics'] };
  assert.deepEqual(classifyAnswer(formalityMc, 'b').errorTags, ['honorific_formality']);
});

const tr = {
  type: 'translation',
  correct_answer: '저는 사과를 먹어요',
  accepted_answers: ['저는 사과를 먹어요'],
  skill_tags: ['word_order', 'particles'],
};

test('translation: accepted answer normalized whitespace', () => {
  const r = classifyAnswer(tr, '  저는 사과를 먹어요 ');
  assert.equal(r.correct, true);
});

test('translation: spacing-only diff → spacing tag', () => {
  const r = classifyAnswer(tr, '저는사과를먹어요');
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('spacing'));
});

test('translation: romanization → romanization_dependency', () => {
  const r = classifyAnswer(tr, 'jeoneun sagwareul meogeoyo');
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('romanization_dependency'));
  assert.ok(r.errorTags.includes('hangul_reading'));
});

test('translation: word order swap → word_order', () => {
  const r = classifyAnswer(tr, '사과를 저는 먹어요');
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('word_order'));
});

test('translation: particle swap 는→가 → particle', () => {
  const r = classifyAnswer(tr, '저가 사과를 먹어요');
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('particle'));
});

test('translation: empty answer → unknown', () => {
  const r = classifyAnswer(tr, '');
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('unknown'));
});

test('translation: formality mismatch (formal expected, casual answer)', () => {
  const ex = {
    type: 'translation',
    correct_answer: '갑니다',
    accepted_answers: ['갑니다'],
    skill_tags: ['formality'],
  };
  const r = classifyAnswer(ex, '가요');
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('honorific_formality'));
});

test('translation: verb conjugation (shared stem, different ending)', () => {
  const ex = {
    type: 'translation',
    correct_answer: '먹어요',
    accepted_answers: ['먹어요'],
    skill_tags: ['verbs'],
  };
  const r = classifyAnswer(ex, '먹었다');
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('verb_conjugation'));
});
