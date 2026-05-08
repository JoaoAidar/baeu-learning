// Template-based TOPIK 1 content. Generates ~150 exercises with consistent shape.
// Each helper returns a list of exercise rows ready for AdminService.validateExercise.

const VOCAB = [
  // [english, korean, romanization, skill]
  ['water', '물', 'mul', 'food'],
  ['rice', '밥', 'bap', 'food'],
  ['kimchi', '김치', 'gimchi', 'food'],
  ['apple', '사과', 'sagwa', 'food'],
  ['coffee', '커피', 'keopi', 'food'],
  ['tea', '차', 'cha', 'food'],
  ['milk', '우유', 'uyu', 'food'],
  ['bread', '빵', 'ppang', 'food'],
  ['meat', '고기', 'gogi', 'food'],
  ['fish', '생선', 'saengseon', 'food'],
  ['mother', '어머니', 'eomeoni', 'family'],
  ['father', '아버지', 'abeoji', 'family'],
  ['older brother (male speaker)', '형', 'hyeong', 'family'],
  ['older sister (male speaker)', '누나', 'nuna', 'family'],
  ['older brother (female speaker)', '오빠', 'oppa', 'family'],
  ['older sister (female speaker)', '언니', 'eonni', 'family'],
  ['younger sibling', '동생', 'dongsaeng', 'family'],
  ['friend', '친구', 'chingu', 'people'],
  ['teacher', '선생님', 'seonsaengnim', 'people'],
  ['student', '학생', 'haksaeng', 'people'],
  ['doctor', '의사', 'uisa', 'people'],
  ['Korean person', '한국 사람', 'hanguk saram', 'people'],
  ['book', '책', 'chaek', 'objects'],
  ['pen', '펜', 'pen', 'objects'],
  ['phone', '전화', 'jeonhwa', 'objects'],
  ['computer', '컴퓨터', 'keompyuteo', 'objects'],
  ['bag', '가방', 'gabang', 'objects'],
  ['house', '집', 'jip', 'places'],
  ['school', '학교', 'hakgyo', 'places'],
  ['library', '도서관', 'doseogwan', 'places'],
  ['restaurant', '식당', 'sikdang', 'places'],
  ['cafe', '카페', 'kape', 'places'],
  ['store', '가게', 'gage', 'places'],
  ['Korea', '한국', 'hanguk', 'places'],
  ['Seoul', '서울', 'seoul', 'places'],
  ['today', '오늘', 'oneul', 'time'],
  ['tomorrow', '내일', 'naeil', 'time'],
  ['yesterday', '어제', 'eoje', 'time'],
  ['morning', '아침', 'achim', 'time'],
  ['afternoon', '오후', 'ohu', 'time'],
  ['evening', '저녁', 'jeonyeok', 'time'],
  ['night', '밤', 'bam', 'time'],
];

// Native Korean numbers 1-10
const NUMBERS = [
  ['1', '하나', 'hana'],
  ['2', '둘', 'dul'],
  ['3', '셋', 'set'],
  ['4', '넷', 'net'],
  ['5', '다섯', 'daseot'],
  ['6', '여섯', 'yeoseot'],
  ['7', '일곱', 'ilgop'],
  ['8', '여덟', 'yeodeol'],
  ['9', '아홉', 'ahop'],
  ['10', '열', 'yeol'],
];

// Sino-Korean numbers
const SINO = [
  ['1', '일', 'il'],
  ['2', '이', 'i'],
  ['3', '삼', 'sam'],
  ['4', '사', 'sa'],
  ['5', '오', 'o'],
  ['6', '육', 'yuk'],
  ['7', '칠', 'chil'],
  ['8', '팔', 'pal'],
  ['9', '구', 'gu'],
  ['10', '십', 'sip'],
];

// Verbs: dictionary, polite-요, formal-습니다 (present tense)
const VERBS = [
  ['to go', '가다', '가요', '갑니다'],
  ['to come', '오다', '와요', '옵니다'],
  ['to eat', '먹다', '먹어요', '먹습니다'],
  ['to drink', '마시다', '마셔요', '마십니다'],
  ['to do', '하다', '해요', '합니다'],
  ['to see / watch', '보다', '봐요', '봅니다'],
  ['to buy', '사다', '사요', '삽니다'],
  ['to give', '주다', '줘요', '줍니다'],
  ['to read', '읽다', '읽어요', '읽습니다'],
  ['to learn', '배우다', '배워요', '배웁니다'],
  ['to know', '알다', '알아요', '압니다'],
  ['to live', '살다', '살아요', '삽니다'],
];

// Particles
const PARTICLE_DRILLS = [
  { sentence: '저___ 학생입니다.', en: 'I am a student.', answer: '는', alts: [], skill: 'topic_marker' },
  { sentence: '오빠___ 멋있어요.', en: 'My older brother is cool.', answer: '는', alts: [], skill: 'topic_marker' },
  { sentence: '책___ 좋아요.', en: 'I like books.', answer: '이', alts: [], skill: 'subject_marker' },
  { sentence: '비___ 와요.', en: 'It rains.', answer: '가', alts: [], skill: 'subject_marker' },
  { sentence: '사과___ 먹어요.', en: 'I eat an apple.', answer: '를', alts: [], skill: 'object_marker' },
  { sentence: '물___ 마셔요.', en: 'I drink water.', answer: '을', alts: [], skill: 'object_marker' },
  { sentence: '학교___ 가요.', en: 'I go to school.', answer: '에', alts: ['에'], skill: 'location' },
  { sentence: '도서관___ 공부해요.', en: 'I study at the library.', answer: '에서', alts: [], skill: 'location' },
  { sentence: '친구___ 만나요.', en: 'I meet a friend.', answer: '를', alts: [], skill: 'object_marker' },
  { sentence: '저는 한국 사람___.', en: 'I am Korean.', answer: '입니다', alts: ['이에요'], skill: 'copula' },
  { sentence: '커피___ 마셔요.', en: 'I drink coffee.', answer: '를', alts: [], skill: 'object_marker' },
  { sentence: '집___ 가요.', en: 'I go home.', answer: '에', alts: [], skill: 'location' },
  { sentence: '저___ 책을 읽어요.', en: 'I read a book.', answer: '는', alts: [], skill: 'topic_marker' },
  { sentence: '서울___ 살아요.', en: 'I live in Seoul.', answer: '에', alts: ['에서'], skill: 'location' },
  { sentence: '카페___ 친구를 만나요.', en: 'I meet a friend at a cafe.', answer: '에서', alts: [], skill: 'location' },
  { sentence: '선생님___ 학생을 가르쳐요.', en: 'The teacher teaches a student.', answer: '이', alts: [], skill: 'subject_marker' },
  { sentence: '저는 빵___ 먹어요.', en: 'I eat bread.', answer: '을', alts: [], skill: 'object_marker' },
  { sentence: '오늘___ 학교에 가요.', en: 'I go to school today.', answer: '은', alts: [], skill: 'topic_marker' },
];

// Greetings + everyday phrases
const PHRASES = [
  ['hello (formal polite)', '안녕하세요', 'annyeonghaseyo'],
  ['goodbye (to person leaving)', '안녕히 가세요', 'annyeonghi gaseyo'],
  ['goodbye (to person staying)', '안녕히 계세요', 'annyeonghi gyeseyo'],
  ['thank you (formal)', '감사합니다', 'gamsahamnida'],
  ['thank you (polite)', '고마워요', 'gomawoyo'],
  ['sorry (formal)', '죄송합니다', 'joesonghamnida'],
  ['sorry (polite)', '미안해요', 'mianhaeyo'],
  ['yes', '네', 'ne'],
  ['no', '아니요', 'aniyo'],
  ['nice to meet you', '만나서 반갑습니다', 'mannaseo bangapseumnida'],
];

// COLORS
const COLORS = [
  ['red', '빨간색', 'ppalgansaek'],
  ['blue', '파란색', 'paransaek'],
  ['yellow', '노란색', 'noransaek'],
  ['green', '초록색', 'choroksaek'],
  ['white', '흰색', 'huinsaek'],
  ['black', '검은색', 'geomeunsaek'],
];

function vocabTranslations() {
  return VOCAB.map(([en, ko, rom, skill]) => ({
    type: 'translation',
    difficulty: 'easy',
    prompt: `Translate to Korean: "${en}"`,
    correct_answer: ko,
    accepted_answers: [ko],
    explanation: `${ko} (${rom}) = ${en}.`,
    skill_tags: ['vocabulary', skill],
    metadata: { romanization: rom },
    status: 'published',
  }));
}

function vocabReverse() {
  // Sample 12 of the easy ones for reverse direction
  return VOCAB.slice(0, 12).map(([en, ko, rom, skill]) => ({
    type: 'translation',
    difficulty: 'easy',
    prompt: `What does "${ko}" mean in English?`,
    correct_answer: en,
    accepted_answers: [en, en.toLowerCase()],
    explanation: `${ko} (${rom}) = ${en}.`,
    skill_tags: ['vocabulary', 'reading', skill],
    metadata: { romanization: rom },
    status: 'published',
  }));
}

function vocabMC() {
  // For each of 15 vocab items, build an MC with 3 distractors from the same skill bucket.
  const out = [];
  for (let i = 0; i < 15 && i < VOCAB.length; i++) {
    const [en, ko, rom, skill] = VOCAB[i];
    const distractors = VOCAB.filter(
      (v) => v[1] !== ko && (v[3] === skill || Math.random() < 0.3)
    )
      .slice(0, 3)
      .map((v) => v[1]);
    while (distractors.length < 3) {
      const cand = VOCAB[Math.floor(Math.random() * VOCAB.length)][1];
      if (cand !== ko && !distractors.includes(cand)) distractors.push(cand);
    }
    const options = shuffle([
      { id: 'a', text: ko },
      { id: 'b', text: distractors[0] },
      { id: 'c', text: distractors[1] },
      { id: 'd', text: distractors[2] },
    ]);
    const correctId = options.find((o) => o.text === ko).id;
    out.push({
      type: 'multiple_choice',
      difficulty: 'easy',
      prompt: `Which Korean word means "${en}"?`,
      options,
      correct_answer: correctId,
      accepted_answers: [ko],
      explanation: `${ko} (${rom}) = ${en}.`,
      skill_tags: ['vocabulary', skill],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  return out;
}

function numberDrills() {
  const native = NUMBERS.map(([num, ko, rom]) => ({
    type: 'translation',
    difficulty: 'easy',
    prompt: `Native Korean number: write "${num}" in Hangul (e.g., 하나).`,
    correct_answer: ko,
    accepted_answers: [ko],
    explanation: `${num} = ${ko} (${rom}). Native numbers count people/things.`,
    skill_tags: ['numbers', 'native_numbers'],
    metadata: { romanization: rom },
    status: 'published',
  }));
  const sino = SINO.map(([num, ko, rom]) => ({
    type: 'translation',
    difficulty: 'easy',
    prompt: `Sino-Korean number: write "${num}" in Hangul (e.g., 일).`,
    correct_answer: ko,
    accepted_answers: [ko],
    explanation: `${num} = ${ko} (${rom}). Sino numbers are used for dates, money, minutes.`,
    skill_tags: ['numbers', 'sino_numbers'],
    metadata: { romanization: rom },
    status: 'published',
  }));
  return [...native, ...sino];
}

function verbDrills() {
  const out = [];
  for (const [en, dict, polite, formal] of VERBS) {
    out.push({
      type: 'translation',
      difficulty: 'medium',
      prompt: `Polite (-요) form of ${dict} (${en})`,
      correct_answer: polite,
      accepted_answers: [polite],
      explanation: `${dict} → ${polite} (polite, present).`,
      skill_tags: ['verbs', 'verb_conjugation', 'polite'],
      metadata: {},
      status: 'published',
    });
    out.push({
      type: 'translation',
      difficulty: 'medium',
      prompt: `Formal (-습니다) form of ${dict} (${en})`,
      correct_answer: formal,
      accepted_answers: [formal],
      explanation: `${dict} → ${formal} (formal, present).`,
      skill_tags: ['verbs', 'verb_conjugation', 'formality'],
      metadata: {},
      status: 'published',
    });
  }
  // MC: pick formal vs polite
  for (let i = 0; i < 6; i++) {
    const [en, dict, polite, formal] = VERBS[i];
    const options = shuffle([
      { id: 'a', text: polite },
      { id: 'b', text: formal },
      { id: 'c', text: dict },
      { id: 'd', text: dict.replace(/.$/, '았다') },
    ]);
    const correctId = options.find((o) => o.text === formal).id;
    out.push({
      type: 'multiple_choice',
      difficulty: 'medium',
      prompt: `Which is the formal (-습니다) form of ${dict} ("${en}")?`,
      options,
      correct_answer: correctId,
      accepted_answers: [formal],
      explanation: `${dict} → ${formal} (formal-polite present).`,
      skill_tags: ['verbs', 'formality', 'honorifics'],
      metadata: {},
      status: 'published',
    });
  }
  return out;
}

function particleDrills() {
  return PARTICLE_DRILLS.map(({ sentence, en, answer, alts, skill }) => ({
    type: 'fill_blank',
    difficulty: 'medium',
    prompt: `Fill in the particle: ${sentence} ("${en}")`,
    correct_answer: answer,
    accepted_answers: [answer, ...alts],
    explanation: `Particle ${answer} marks ${skill.replace(/_/g, ' ')}.`,
    skill_tags: ['particles', skill],
    metadata: {},
    status: 'published',
  }));
}

function phraseDrills() {
  return PHRASES.map(([en, ko, rom]) => ({
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
}

function colorDrills() {
  return COLORS.map(([en, ko, rom]) => ({
    type: 'translation',
    difficulty: 'easy',
    prompt: `Translate to Korean: "${en}"`,
    correct_answer: ko,
    accepted_answers: [ko],
    explanation: `${ko} = ${en}.`,
    skill_tags: ['vocabulary', 'colors'],
    metadata: { romanization: rom },
    status: 'published',
  }));
}

function sentenceDrills() {
  return [
    { en: 'I am a student.', ko: '저는 학생이에요', alts: ['저는 학생입니다'], skills: ['copula', 'sentence'] },
    { en: 'I eat rice.', ko: '저는 밥을 먹어요', alts: [], skills: ['verbs', 'word_order'] },
    { en: 'I drink water.', ko: '저는 물을 마셔요', alts: [], skills: ['verbs', 'word_order'] },
    { en: 'I go to school.', ko: '저는 학교에 가요', alts: [], skills: ['verbs', 'particles'] },
    { en: 'I read a book.', ko: '저는 책을 읽어요', alts: [], skills: ['verbs'] },
    { en: 'I meet a friend.', ko: '저는 친구를 만나요', alts: [], skills: ['verbs'] },
    { en: 'I learn Korean.', ko: '저는 한국어를 배워요', alts: [], skills: ['verbs', 'vocabulary'] },
    { en: 'I live in Seoul.', ko: '저는 서울에 살아요', alts: [], skills: ['verbs', 'particles'] },
    { en: 'I like coffee.', ko: '저는 커피를 좋아해요', alts: [], skills: ['verbs', 'preferences'] },
    { en: 'I do not know.', ko: '저는 몰라요', alts: ['몰라요'], skills: ['verbs', 'negation'] },
    { en: 'It is delicious.', ko: '맛있어요', alts: [], skills: ['adjectives'] },
    { en: 'It is too expensive.', ko: '너무 비싸요', alts: [], skills: ['adjectives'] },
  ].map(({ en, ko, alts, skills }) => ({
    type: 'translation',
    difficulty: 'medium',
    prompt: `Translate to Korean: "${en}"`,
    correct_answer: ko,
    accepted_answers: [ko, ...alts],
    explanation: `${ko}.`,
    skill_tags: skills,
    metadata: {},
    status: 'published',
  }));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Re-id options sequentially
  return a.map((o, idx) => ({ ...o, id: 'abcd'[idx] }));
}

export function buildTopik1Content() {
  return [
    ...vocabTranslations(),
    ...vocabReverse(),
    ...vocabMC(),
    ...numberDrills(),
    ...verbDrills(),
    ...particleDrills(),
    ...phraseDrills(),
    ...colorDrills(),
    ...sentenceDrills(),
  ];
}
