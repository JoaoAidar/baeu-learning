// Deterministic classifier — no LLM. Returns { correct, errorTags, skillTags, expected }.
// Tag taxonomy:
//   vocabulary, particle, word_order, verb_conjugation, honorific_formality,
//   hangul_reading, spacing, romanization_dependency, unknown

const HANGUL_RE = /[가-힯ᄀ-ᇿ㄰-㆏]/;
const LATIN_RE = /[a-zA-Z]/;

const PARTICLES = ['은', '는', '이', '가', '을', '를', '에', '에서', '에게', '한테', '으로', '로', '와', '과', '도'];
const PARTICLE_PAIRS = [
  ['은', '는'], ['이', '가'], ['을', '를'], ['와', '과'], ['으로', '로'],
];

const FORMAL_ENDINGS = ['습니다', 'ㅂ니다', '니다', '십시오', '세요', '으세요'];
const CASUAL_ENDINGS = ['요', '아요', '어요', '해요', '이야', '야'];

// Multiple-choice can't reveal *which* aspect was missed (it's a single pick),
// so we attribute the error to the question's topic via its skill_tags. This
// keeps the diagnostic honest: a missed particle/verb/formality MC no longer
// inflates "vocabulary". Tags with no specific category fall back to vocabulary.
const SKILL_TO_ERROR_TAG = {
  hangul: 'hangul_reading',
  hangul_reading: 'hangul_reading',
  vowels: 'hangul_reading',
  consonants: 'hangul_reading',
  particles: 'particle',
  topic_marker: 'particle',
  subject_marker: 'particle',
  object_marker: 'particle',
  location: 'particle',
  verb_conjugation: 'verb_conjugation',
  verbs: 'verb_conjugation',
  negation: 'verb_conjugation',
  formality: 'honorific_formality',
  honorifics: 'honorific_formality',
  register: 'honorific_formality',
  word_order: 'word_order',
};

function mcErrorTags(skillTags) {
  const out = new Set();
  for (const t of skillTags || []) {
    const mapped = SKILL_TO_ERROR_TAG[t];
    if (mapped) out.add(mapped);
  }
  // No grammar-specific category matched → it's a vocabulary/meaning miss.
  return out.size ? [...out] : ['vocabulary'];
}

const normalize = (s) =>
  String(s ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFC');

const stripPunct = (s) => s.replace(/[.,!?;:"'()]/g, '');

const tokens = (s) => stripPunct(normalize(s)).split(' ').filter(Boolean);

const charBag = (s) => {
  const m = new Map();
  for (const c of stripPunct(normalize(s)).replace(/\s+/g, '')) {
    m.set(c, (m.get(c) || 0) + 1);
  }
  return m;
};

const bagDiff = (a, b) => {
  const missing = [];
  const extra = [];
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    const da = a.get(k) || 0;
    const db = b.get(k) || 0;
    if (da > db) for (let i = 0; i < da - db; i++) extra.push(k);
    if (db > da) for (let i = 0; i < db - da; i++) missing.push(k);
  }
  return { missing, extra };
};

function pickExpected(exercise) {
  if (exercise.type === 'multiple_choice') {
    return exercise.correct_answer;
  }
  const accepted = exercise.accepted_answers || [];
  if (accepted.length) return accepted[0];
  return exercise.correct_answer || '';
}

function isAcceptedAnswer(exercise, answer) {
  const norm = normalize(answer).toLowerCase();
  const accepted = (exercise.accepted_answers || []).map((a) => normalize(a).toLowerCase());
  if (exercise.correct_answer) accepted.push(normalize(exercise.correct_answer).toLowerCase());
  return accepted.includes(norm);
}

// For multiple_choice, `correct_answer` is the option *id* (a/b/c/d). Comparing
// answers uses that id, but the learner-facing "Expected:" line must show the
// option's *content* (e.g. "안녕하세요"), not the bare letter "a". Resolve the
// correct option's text, falling back to the id when options aren't available.
function mcExpectedDisplay(exercise) {
  const id = exercise.correct_answer;
  const options = Array.isArray(exercise.options) ? exercise.options : [];
  const match = options.find((o) => String(o?.id) === String(id));
  return match && match.text != null && match.text !== '' ? match.text : id;
}

function classifyMultipleChoice(exercise, answer) {
  const correct = normalize(answer) === normalize(exercise.correct_answer);
  const expected = mcExpectedDisplay(exercise);
  if (correct) return { correct: true, errorTags: [], expected };
  return { correct: false, errorTags: mcErrorTags(exercise.skill_tags), expected };
}

function classifyText(exercise, answer) {
  const expected = pickExpected(exercise);
  const expectedNorm = normalize(expected);
  const answerNorm = normalize(answer);

  if (!answerNorm) {
    return { correct: false, errorTags: ['unknown'], expected };
  }

  if (isAcceptedAnswer(exercise, answer)) {
    return { correct: true, errorTags: [], expected };
  }

  // Case-insensitive exact match for romanized/latin answers
  if (expectedNorm.toLowerCase() === answerNorm.toLowerCase()) {
    return { correct: true, errorTags: [], expected };
  }

  const tags = new Set();

  const expectedHasHangul = HANGUL_RE.test(expectedNorm);
  const answerHasHangul = HANGUL_RE.test(answerNorm);
  const answerHasLatin = LATIN_RE.test(answerNorm);

  // Romanization dependency: expected is hangul, learner answered in latin
  if (expectedHasHangul && !answerHasHangul && answerHasLatin) {
    tags.add('romanization_dependency');
    tags.add('hangul_reading');
    return { correct: false, errorTags: [...tags], expected };
  }

  // Spacing-only difference
  if (expectedNorm.replace(/\s+/g, '') === answerNorm.replace(/\s+/g, '')) {
    tags.add('spacing');
    return { correct: false, errorTags: [...tags], expected };
  }

  const expTokens = tokens(expected);
  const ansTokens = tokens(answer);

  // Word-order: same multiset of tokens, different order
  if (expTokens.length > 1 && expTokens.length === ansTokens.length) {
    const sortedEq =
      [...expTokens].sort().join(' ') === [...ansTokens].sort().join(' ');
    if (sortedEq && expTokens.join(' ') !== ansTokens.join(' ')) {
      tags.add('word_order');
    }
  }

  // Particle: char bag differs only on particle chars / pair swap
  if (expectedHasHangul) {
    const { missing, extra } = bagDiff(charBag(expected), charBag(answer));
    const onlyParticles =
      missing.length > 0 &&
      extra.length > 0 &&
      missing.every((c) => PARTICLES.includes(c)) &&
      extra.every((c) => PARTICLES.includes(c));
    if (onlyParticles) tags.add('particle');

    // explicit pair swap
    for (const [a, b] of PARTICLE_PAIRS) {
      if (
        (missing.includes(a) && extra.includes(b)) ||
        (missing.includes(b) && extra.includes(a))
      ) {
        tags.add('particle');
      }
    }
  }

  // Formality mismatch
  const expectedFormal = FORMAL_ENDINGS.some((e) => expectedNorm.endsWith(e));
  const expectedCasual = CASUAL_ENDINGS.some((e) => expectedNorm.endsWith(e));
  const answerFormal = FORMAL_ENDINGS.some((e) => answerNorm.endsWith(e));
  const answerCasual = CASUAL_ENDINGS.some((e) => answerNorm.endsWith(e));
  if ((expectedFormal && answerCasual) || (expectedCasual && answerFormal)) {
    tags.add('honorific_formality');
  }

  // Verb conjugation: same stem prefix but different ending
  if (expectedHasHangul && answerHasHangul && !tags.has('particle')) {
    const minLen = Math.min(expectedNorm.length, answerNorm.length);
    let shared = 0;
    for (let i = 0; i < minLen; i++) {
      if (expectedNorm[i] === answerNorm[i]) shared++;
      else break;
    }
    if (
      shared >= 1 &&
      shared >= Math.min(expectedNorm.length, answerNorm.length) - 3 &&
      shared < Math.max(expectedNorm.length, answerNorm.length)
    ) {
      tags.add('verb_conjugation');
    }
  }

  if (tags.size === 0) {
    // Fallback heuristic: if many tokens overlap → vocabulary; else unknown
    const overlap = expTokens.filter((t) => ansTokens.includes(t)).length;
    if (overlap > 0 && overlap < expTokens.length) tags.add('vocabulary');
    else tags.add('unknown');
  }

  return { correct: false, errorTags: [...tags], expected };
}

export function classifyAnswer(exercise, answer) {
  if (!exercise) {
    return { correct: false, errorTags: ['unknown'], expected: '' };
  }
  const skillTags = Array.isArray(exercise.skill_tags) ? exercise.skill_tags : [];
  let result;
  if (exercise.type === 'multiple_choice') {
    result = classifyMultipleChoice(exercise, answer);
  } else {
    result = classifyText(exercise, answer);
  }
  return { ...result, skillTags };
}

export const _internals = { normalize, tokens, charBag, bagDiff };
