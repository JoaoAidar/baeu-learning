// Depth expansion #2 — targets the thinnest TOPIK-1 skills by catalog coverage
// (question words, 있다/없다 existence, location nouns, adjective antonyms +
// ㅂ/으-irregular conjugation, honorifics/register) and deliberately uses ONLY
// multiple_choice + fill_blank to pull down the translation-heavy ratio.
//
// Every Korean form is authored and verified explicitly — no runtime derivation —
// because the learner relies on this being correct. Conventions mirror
// topik1Depth.js: MC options are {id,text}; correct_answer is the option id;
// accepted_answers carries the literal answer; prompts are distinct from existing
// ones so the additive seed (dedupe-by-prompt) never collides; skill_tags ≤ 3
// (the selector adds a per-tag bonus, so more would over-serve these items).

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mc({ module_slug, prompt, answer, distractors, explanation, skill_tags, difficulty = 'medium' }) {
  const options = shuffle([
    { id: 'a', text: answer },
    ...distractors.slice(0, 3).map((t, i) => ({ id: 'bcd'[i], text: t })),
  ]);
  return {
    module_slug,
    type: 'multiple_choice',
    difficulty,
    prompt,
    options,
    correct_answer: options.find((o) => o.text === answer).id,
    accepted_answers: [answer],
    explanation,
    skill_tags,
    metadata: {},
    status: 'published',
  };
}

function fill({ module_slug, prompt, answer, explanation, skill_tags, difficulty = 'medium' }) {
  return {
    module_slug,
    type: 'fill_blank',
    difficulty,
    prompt,
    correct_answer: answer,
    accepted_answers: [answer],
    explanation,
    skill_tags,
    metadata: {},
    status: 'published',
  };
}

// ---------- QUESTION WORDS (의문사) — module: patterns ----------

// [english meaning, korean question word, romanization]
const QUESTION_WORDS = [
  ['what', '뭐', 'mwo'],
  ['where', '어디', 'eodi'],
  ['when', '언제', 'eonje'],
  ['who', '누구', 'nugu'],
  ['why', '왜', 'wae'],
  ['how', '어떻게', 'eotteoke'],
  ['how much (price)', '얼마', 'eolma'],
  ['how many (with a counter)', '몇', 'myeot'],
];

// Question word in a real sentence — fill the blank.
const QUESTION_APPLIED = [
  { prompt: '___ 가요? (Where are you going?)', answer: '어디', rom: 'eodi' },
  { prompt: '지금 ___ 해요? (What are you doing now?)', answer: '뭐', rom: 'mwo' },
  { prompt: '생일이 ___예요? (When is your birthday?)', answer: '언제', rom: 'eonje' },
  { prompt: '이 사람은 ___예요? (Who is this person?)', answer: '누구', rom: 'nugu' },
  { prompt: '___ 늦었어요? (Why are you late?)', answer: '왜', rom: 'wae' },
  { prompt: '이거 ___예요? (How much is this?)', answer: '얼마', rom: 'eolma' },
  { prompt: '사과가 ___ 개 있어요? (How many apples are there?)', answer: '몇', rom: 'myeot' },
];

function questionWords() {
  const out = [];
  for (const [en, ko] of QUESTION_WORDS) {
    const pool = QUESTION_WORDS.map((w) => w[1]).filter((w) => w !== ko);
    out.push(
      mc({
        module_slug: 'patterns',
        prompt: `Which question word means "${en}"?`,
        answer: ko,
        distractors: shuffle(pool).slice(0, 3),
        explanation: `"${en}" = ${ko}.`,
        skill_tags: ['questions', 'vocabulary'],
        difficulty: 'easy',
      })
    );
  }
  for (const c of QUESTION_APPLIED) {
    out.push(
      fill({
        module_slug: 'patterns',
        prompt: `Fill the question word: ${c.prompt}`,
        answer: c.answer,
        explanation: `${c.answer} (${c.rom}).`,
        skill_tags: ['questions', 'word_order'],
      })
    );
  }
  return out;
}

// ---------- 있다 / 없다 EXISTENCE — module: patterns ----------

const EXISTENCE_MC = [
  { en: 'I have money.', answer: '돈이 있어요', distractors: ['돈이 없어요', '돈이에요', '돈을 사요'] },
  { en: "There isn't any time.", answer: '시간이 없어요', distractors: ['시간이 있어요', '시간이에요', '시간이 와요'] },
  { en: 'I have a younger sibling.', answer: '동생이 있어요', distractors: ['동생이 없어요', '동생이에요', '동생을 해요'] },
  { en: 'There are no questions.', answer: '질문이 없어요', distractors: ['질문이 있어요', '질문이에요', '질문을 해요'] },
];

function existence() {
  return EXISTENCE_MC.map((c) =>
    mc({
      module_slug: 'patterns',
      prompt: `Pick the correct sentence: "${c.en}"`,
      answer: c.answer,
      distractors: c.distractors,
      explanation: `있어요 = there is / have; 없어요 = there isn't / don't have. → ${c.answer}.`,
      skill_tags: ['existence', 'particles'],
    })
  );
}

// ---------- LOCATION NOUNS (위치 명사) — module: vocab-daily ----------

// [english, korean position noun, romanization]
const POSITIONS = [
  ['on top of / above', '위', 'wi'],
  ['under / below', '아래', 'arae'],
  ['in front of', '앞', 'ap'],
  ['behind', '뒤', 'dwi'],
  ['next to / beside', '옆', 'yeop'],
  ['inside', '안', 'an'],
  ['outside', '밖', 'bak'],
];

const POSITION_APPLIED = [
  { en: 'The book is on the desk.', answer: '책상 위에 있어요', distractors: ['책상 아래에 있어요', '책상 옆에 있어요', '책상 안에 있어요'] },
  { en: 'The cat is under the chair.', answer: '고양이가 의자 아래에 있어요', distractors: ['고양이가 의자 위에 있어요', '고양이가 의자 앞에 있어요', '고양이가 의자 옆에 있어요'] },
];

function locations() {
  const out = [];
  for (const [en, ko] of POSITIONS) {
    const pool = POSITIONS.map((p) => p[1]).filter((p) => p !== ko);
    out.push(
      mc({
        module_slug: 'vocab-daily',
        prompt: `Which position word means "${en}"?`,
        answer: ko,
        distractors: shuffle(pool).slice(0, 3),
        explanation: `"${en}" = ${ko} (used with 에: ${ko}에).`,
        skill_tags: ['location', 'vocabulary'],
        difficulty: 'easy',
      })
    );
  }
  for (const c of POSITION_APPLIED) {
    out.push(
      mc({
        module_slug: 'vocab-daily',
        prompt: `Pick the correct sentence: "${c.en}"`,
        answer: c.answer,
        distractors: c.distractors,
        explanation: `Position noun + 에 marks where something is. → ${c.answer}.`,
        skill_tags: ['location', 'existence'],
      })
    );
  }
  return out;
}

// ---------- ADJECTIVE ANTONYMS (형용사 반의어) — module: vocab-daily ----------

// [korean adjective, english, korean antonym, antonym english]
const ANTONYMS = [
  ['크다', 'big', '작다', ['많다', '좋다', '높다']],
  ['많다', 'many', '적다', ['작다', '싸다', '낮다']],
  ['비싸다', 'expensive', '싸다', ['작다', '적다', '나쁘다']],
  ['덥다', 'hot (weather)', '춥다', ['맵다', '작다', '싸다']],
  ['좋다', 'good', '나쁘다', ['싸다', '적다', '작다']],
  ['높다', 'high / tall', '낮다', ['작다', '짧다', '적다']],
  ['길다', 'long', '짧다', ['작다', '낮다', '적다']],
  ['빠르다', 'fast', '느리다', ['작다', '낮다', '짧다']],
];

function antonyms() {
  return ANTONYMS.map(([ko, en, ant, distractors]) =>
    mc({
      module_slug: 'vocab-daily',
      prompt: `What is the opposite of ${ko} (${en})?`,
      answer: ant,
      distractors,
      explanation: `${ko} (${en}) ↔ ${ant}.`,
      skill_tags: ['adjectives', 'vocabulary'],
    })
  );
}

// ---------- ADJECTIVE CONJUGATION (ㅂ / 으 irregulars) — module: verbs-present ----

// The polite present 요-form of irregular descriptive verbs — a classic error
// zone. [dictionary form, correct 요-form, english, [wrong forms]]
const ADJ_CONJ = [
  ['춥다', '추워요', 'to be cold', ['춥어요', '추어요', '춥아요']],
  ['덥다', '더워요', 'to be hot', ['덥어요', '더어요', '덥아요']],
  ['맵다', '매워요', 'to be spicy', ['맵어요', '매어요', '맵아요']],
  ['크다', '커요', 'to be big', ['크어요', '크아요', '키요']],
  ['예쁘다', '예뻐요', 'to be pretty', ['예쁘어요', '예쁘아요', '예뻐어요']],
  ['바쁘다', '바빠요', 'to be busy', ['바쁘아요', '바쁘어요', '바뻐요']],
];

function adjConjugation() {
  return ADJ_CONJ.map(([dict, form, en, wrong]) =>
    mc({
      module_slug: 'verbs-present',
      prompt: `Conjugate ${dict} (${en}) to the polite present 요-form:`,
      answer: form,
      distractors: wrong,
      explanation:
        `${dict} → ${form}. ` +
        (['춥다', '덥다', '맵다'].includes(dict)
          ? 'ㅂ-irregular: 받침 ㅂ → 우 before -어요.'
          : '으-irregular: the ㅡ drops before the vowel ending.'),
      skill_tags: ['adjectives', 'verb_conjugation'],
      difficulty: 'hard',
    })
  );
}

// ---------- HONORIFICS / REGISTER (높임말) — module: greetings ----------

const HONORIFICS_MC = [
  { prompt: 'Honorific subject marker (e.g. 할아버지___ 오세요 — Grandfather is coming):', answer: '께서', distractors: ['가', '이', '은'], exp: '께서 is the honorific form of 가/이 for a respected subject.' },
  { prompt: 'Honorific way to say "please eat" (to an elder):', answer: '드세요', distractors: ['먹어요', '먹어', '잡아요'], exp: '드세요 (from 드시다) is the honorific of 먹다.' },
  { prompt: 'Honorific verb "to be / stay" for a person (e.g. Is your father home?):', answer: '계세요', distractors: ['있어요', '없어요', '이에요'], exp: '계시다 is the honorific of 있다 for people.' },
  { prompt: 'Honorific way to say "please sleep / good night":', answer: '주무세요', distractors: ['자요', '자', '누워요'], exp: '주무시다 is the honorific of 자다.' },
  { prompt: 'Honorific word for "name":', answer: '성함', distractors: ['이름', '별명', '제목'], exp: '성함 is the honorific of 이름.' },
  { prompt: 'Honorific word for "age":', answer: '연세', distractors: ['나이', '시간', '생일'], exp: '연세 is the honorific of 나이.' },
  { prompt: 'Honorific counter for people (e.g. "three people", to be polite):', answer: '세 분', distractors: ['세 명', '세 개', '세 마리'], exp: '분 is the honorific counter for people (vs the plain 명).' },
  { prompt: 'Polite way to request "please give me water":', answer: '물 주세요', distractors: ['물 줘', '물 있어요', '물 사요'], exp: '주세요 (from 주다) is the standard polite request form.' },
];

function honorifics() {
  return HONORIFICS_MC.map((c) =>
    mc({
      module_slug: 'greetings',
      prompt: c.prompt,
      answer: c.answer,
      distractors: c.distractors,
      explanation: c.exp,
      skill_tags: ['honorifics', 'register'],
    })
  );
}

export function buildDepth2Content() {
  return [
    ...questionWords(),
    ...existence(),
    ...locations(),
    ...antonyms(),
    ...adjConjugation(),
    ...honorifics(),
  ];
}
