// Depth expansion for thin TOPIK-1 areas: Hangul (compound vowels + batchim
// reading), Numbers (native counter forms + counter choice), Greetings (more
// phrases + register), and cross-cutting grammar discrimination (안/못 negation,
// connectives). Every Korean form is authored explicitly and verified — no
// runtime derivation — because the learner relies on this being correct.
//
// Conventions match topik1Content.js: MC options are {id,text}; correct_answer
// is the option id; accepted_answers carries the literal answer; prompts are
// distinct from existing ones so the additive seed (dedupe-by-prompt) never
// collides. skill_tags are capped at 3 — the selector adds a per-tag bonus, so a
// higher count would over-serve these items.

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a 4-option MC from a correct answer + 3 distractors.
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

// ---------- HANGUL ----------

// Compound/diphthong vowels — beyond the basic set in topik1Content.
const DIPHTHONGS = [
  ['ㅘ', 'wa'], ['ㅝ', 'wo'], ['ㅙ', 'wae'], ['ㅞ', 'we'],
  ['ㅚ', 'oe'], ['ㅟ', 'wi'], ['ㅢ', 'ui'], ['ㅒ', 'yae'], ['ㅖ', 'ye'],
];

// Syllables that end in a final consonant (받침). Reading these is the step
// after open syllables. Romanizations verified.
const BATCHIM_SYLLABLES = [
  ['학', 'hak'], ['강', 'gang'], ['밥', 'bap'], ['곰', 'gom'],
  ['산', 'san'], ['물', 'mul'], ['집', 'jip'], ['책', 'chaek'],
  ['눈', 'nun'], ['문', 'mun'], ['길', 'gil'], ['손', 'son'],
];

function hangulDepth() {
  const out = [];
  for (const [letter, sound] of DIPHTHONGS) {
    const pool = DIPHTHONGS.map((d) => d[1]).filter((s) => s !== sound);
    const distractors = shuffle(pool).slice(0, 3);
    out.push(
      mc({
        module_slug: 'hangul',
        prompt: `Compound vowel ${letter} — what sound does it make?`,
        answer: sound,
        distractors,
        explanation: `${letter} = "${sound}".`,
        skill_tags: ['hangul', 'hangul_reading', 'vowels'],
        difficulty: 'easy',
      })
    );
  }
  for (const [syl, rom] of BATCHIM_SYLLABLES) {
    out.push({
      module_slug: 'hangul',
      type: 'translation',
      difficulty: 'easy',
      prompt: `Romanize this syllable (note the final consonant): ${syl}`,
      correct_answer: rom,
      accepted_answers: [rom, rom.toLowerCase()],
      explanation: `${syl} = ${rom} — the last letter is a 받침 (final consonant).`,
      skill_tags: ['hangul', 'hangul_reading', 'batchim'],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  return out;
}

// ---------- NUMBERS & COUNTING ----------

// Native numbers shorten before a counter — a top beginner error (하나→한 개,
// not 하나 개). [number, full native, short form before a counter].
const NATIVE_COUNTER_FORMS = [
  ['1', '하나', '한'],
  ['2', '둘', '두'],
  ['3', '셋', '세'],
  ['4', '넷', '네'],
  ['20', '스물', '스무'],
];

// Which counter goes with the noun? Counters are the hardest part of Korean
// numbers. All phrases verified (native number + counter).
const COUNTER_CHOICE = [
  { en: 'two books', answer: '두 권', distractors: ['두 명', '두 마리', '두 개'] },
  { en: 'three cats', answer: '세 마리', distractors: ['세 명', '세 개', '세 권'] },
  { en: 'one cup of coffee', answer: '한 잔', distractors: ['한 병', '한 개', '한 마리'] },
  { en: 'five people', answer: '다섯 명', distractors: ['다섯 개', '다섯 마리', '다섯 권'] },
  { en: 'two bottles of beer', answer: '두 병', distractors: ['두 잔', '두 개', '두 마리'] },
  { en: 'one sheet of paper', answer: '한 장', distractors: ['한 개', '한 권', '한 잔'] },
  { en: 'one car', answer: '한 대', distractors: ['한 개', '한 마리', '한 명'] },
];

function numbersDepth() {
  const out = [];
  for (const [num, full, short] of NATIVE_COUNTER_FORMS) {
    out.push({
      module_slug: 'numbers',
      type: 'fill_blank',
      difficulty: 'medium',
      prompt: `Before a counter, the native number "${num}" (${full}) changes form: ___ 개`,
      correct_answer: short,
      accepted_answers: [short],
      explanation: `${full} → ${short} before a counter (e.g., ${short} 개).`,
      skill_tags: ['numbers', 'native_numbers', 'counters'],
      metadata: {},
      status: 'published',
    });
  }
  for (const c of COUNTER_CHOICE) {
    out.push(
      mc({
        module_slug: 'numbers',
        prompt: `Pick the correct counter phrase: "${c.en}"`,
        answer: c.answer,
        distractors: c.distractors,
        explanation: `"${c.en}" = ${c.answer}.`,
        skill_tags: ['numbers', 'counters', 'native_numbers'],
      })
    );
  }
  return out;
}

// ---------- GREETINGS & POLITENESS ----------

// More everyday set phrases. [en, ko, romanization]. Verified.
const GREETINGS_EXTRA = [
  ['I will eat well (said before a meal)', '잘 먹겠습니다', 'jal meokgesseumnida'],
  ['Thank you for the meal (said after eating)', '잘 먹었습니다', 'jal meogeosseumnida'],
  ['Long time no see', '오랜만이에요', 'oraenmanieyo'],
  ['Welcome / come in (shopkeeper)', '어서 오세요', 'eoseo oseyo'],
  ['Excuse me (to interrupt or pass)', '실례합니다', 'sillyehamnida'],
  ['How have you been?', '잘 지냈어요?', 'jal jinaesseoyo'],
  ['Good night (honorific)', '안녕히 주무세요', 'annyeonghi jumuseyo'],
  ['Congratulations', '축하해요', 'chukahaeyo'],
  ['Nice to meet you (formal, first meeting)', '처음 뵙겠습니다', 'cheoeum boepgesseumnida'],
];

// Register/situation: pick the phrase that fits the formality of the moment.
const REGISTER_MC = [
  { en: 'Right before you start eating, you say…', answer: '잘 먹겠습니다', distractors: ['잘 먹었습니다', '맛있어요', '안녕하세요'] },
  { en: 'A shop clerk greets you as you enter…', answer: '어서 오세요', distractors: ['안녕히 가세요', '실례합니다', '잘 가요'] },
  { en: 'Saying good night to your grandparents (honorific)…', answer: '안녕히 주무세요', distractors: ['잘 자', '안녕', '잘 가요'] },
  { en: 'Thanking your boss formally…', answer: '감사합니다', distractors: ['고마워', '고마워요', '미안해요'] },
];

function greetingsDepth() {
  const out = GREETINGS_EXTRA.map(([en, ko, rom]) => ({
    module_slug: 'greetings',
    type: 'translation',
    difficulty: 'easy',
    prompt: `Translate to Korean: "${en}"`,
    correct_answer: ko,
    accepted_answers: [ko],
    explanation: `${ko} (${rom}).`,
    skill_tags: ['greetings', 'phrases'],
    metadata: { romanization: rom },
    status: 'published',
  }));
  for (const c of REGISTER_MC) {
    out.push(
      mc({
        module_slug: 'greetings',
        prompt: c.en,
        answer: c.answer,
        distractors: c.distractors,
        explanation: `In context, ${c.answer} fits the register.`,
        skill_tags: ['greetings', 'register'],
      })
    );
  }
  return out;
}

// ---------- GRAMMAR DISCRIMINATION (cross-cutting, lives in patterns) ----------

// 안 (don't — choice) vs 못 (can't — inability). The classic negation mix-up.
const NEGATION_MC = [
  { en: "I don't drink coffee (by choice).", answer: '안 마셔요', distractors: ['못 마셔요', '안 마셨어요', '못 마셔'] },
  { en: "I can't speak Korean well (ability).", answer: '잘 못해요', distractors: ['잘 안 해요', '잘 못했어요', '잘 안 했어요'] },
  { en: "I didn't go yesterday (chose not to).", answer: '안 갔어요', distractors: ['못 갔어요', '안 가요', '못 가요'] },
  { en: "I couldn't sleep last night (unable).", answer: '못 잤어요', distractors: ['안 잤어요', '못 자요', '안 자요'] },
  { en: "I don't eat meat.", answer: '안 먹어요', distractors: ['못 먹어요', '안 먹었어요', '못 먹어'] },
];

// Connective endings — concept first, then applied (with verified irregulars).
const CONNECTIVE_CONCEPT = [
  { en: "Which ending links clauses as 'and / and then'?", answer: '-고', distractors: ['-지만', '-아서/어서', '-(으)면'] },
  { en: "Which ending means 'but'?", answer: '-지만', distractors: ['-고', '-아서/어서', '-(으)면'] },
  { en: "Which ending means 'so / because'?", answer: '-아서/어서', distractors: ['-고', '-지만', '-(으)면'] },
  { en: "Which ending means 'if / when'?", answer: '-(으)면', distractors: ['-고', '-지만', '-아서/어서'] },
];
const CONNECTIVE_APPLIED = [
  { en: 'I eat breakfast and (then) go to school.', answer: '먹고', distractors: ['먹지만', '먹어서', '먹으면'] },
  { en: 'Korean is hard but fun.', answer: '어렵지만', distractors: ['어렵고', '어려워서', '어려우면'] },
  { en: "Because I'm busy, I can't go.", answer: '바빠서', distractors: ['바쁘고', '바쁘지만', '바쁘면'] },
];

function grammarDepth() {
  const out = [];
  for (const c of NEGATION_MC) {
    out.push(
      mc({
        module_slug: 'patterns',
        prompt: `Pick the correct negation: "${c.en}"`,
        answer: c.answer,
        distractors: c.distractors,
        explanation: `안 = simple "don't" (choice); 못 = "can't" (inability). → ${c.answer}.`,
        skill_tags: ['negation', 'verbs'],
      })
    );
  }
  for (const c of CONNECTIVE_CONCEPT) {
    out.push(
      mc({
        module_slug: 'patterns',
        prompt: c.en,
        answer: c.answer,
        distractors: c.distractors,
        explanation: `${c.answer} — ${c.en.replace(/^Which ending /, '').replace(/\?$/, '')}.`,
        skill_tags: ['connectives', 'grammar'],
      })
    );
  }
  for (const c of CONNECTIVE_APPLIED) {
    out.push(
      mc({
        module_slug: 'patterns',
        prompt: `Pick the correct connective form: "${c.en}"`,
        answer: c.answer,
        distractors: c.distractors,
        explanation: `"${c.en}" → ${c.answer}.`,
        skill_tags: ['connectives', 'verb_conjugation'],
      })
    );
  }
  return out;
}

export function buildDepthContent() {
  return [
    ...hangulDepth(),
    ...numbersDepth(),
    ...greetingsDepth(),
    ...grammarDepth(),
  ];
}
