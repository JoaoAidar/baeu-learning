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

test('multiple_choice: expected shows the option text, not the letter id', () => {
  const withOptions = {
    type: 'multiple_choice',
    correct_answer: 'c',
    options: [
      { id: 'a', text: 'Thank you' },
      { id: 'b', text: 'Good night' },
      { id: 'c', text: '안녕하세요' },
    ],
    skill_tags: ['greetings'],
  };
  // Wrong pick still resolves the human-readable expected content.
  assert.equal(classifyAnswer(withOptions, 'a').expected, '안녕하세요');
  // Correct pick too.
  assert.equal(classifyAnswer(withOptions, 'c').expected, '안녕하세요');
  // No options available → fall back to the id (graceful).
  assert.equal(classifyAnswer(mc, 'b').expected, 'a');
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

test('translation: tense error (present written where past expected)', () => {
  const ex = { type: 'translation', correct_answer: '먹었어요', accepted_answers: ['먹었어요'], skill_tags: ['verbs'] };
  const r = classifyAnswer(ex, '먹어요'); // present, but past expected
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('tense'), `expected tense, got ${r.errorTags}`);
  // tense is more specific — don't also emit the generic verb_conjugation
  assert.ok(!r.errorTags.includes('verb_conjugation'));
});

test('translation: tense error (past written where future expected)', () => {
  const ex = { type: 'translation', correct_answer: '갈 거예요', accepted_answers: ['갈 거예요'], skill_tags: ['verbs'] };
  const r = classifyAnswer(ex, '갔어요'); // past, but future expected
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('tense'), `expected tense, got ${r.errorTags}`);
});

test('translation: verb conjugation that is NOT a tense difference', () => {
  const ex = { type: 'translation', correct_answer: '가요', accepted_answers: ['가요'], skill_tags: ['verbs'] };
  const r = classifyAnswer(ex, '가다'); // dictionary form — no detectable tense
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('verb_conjugation'), `expected verb_conjugation, got ${r.errorTags}`);
  assert.ok(!r.errorTags.includes('tense'));
});

test('translation: particle omission is tagged particle', () => {
  const ex = { type: 'translation', correct_answer: '사과를 먹어요', accepted_answers: ['사과를 먹어요'], skill_tags: ['particles'] };
  const r = classifyAnswer(ex, '사과 먹어요'); // dropped 를
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('particle'), `expected particle, got ${r.errorTags}`);
});

test('translation: syntax error (missing word in a sentence)', () => {
  const ex = { type: 'translation', correct_answer: '저는 매일 한국어를 공부해요', accepted_answers: ['저는 매일 한국어를 공부해요'], skill_tags: ['sentence'] };
  const r = classifyAnswer(ex, '저는 한국어를 공부해요'); // dropped 매일
  assert.equal(r.correct, false);
  assert.ok(r.errorTags.includes('syntax'), `expected syntax, got ${r.errorTags}`);
});
