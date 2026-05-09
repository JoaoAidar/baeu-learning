// Catalog of learning modules. The slug is the public identifier.
// Order_index controls display order on the home page.

export const MODULES = [
  {
    slug: 'hangul',
    title: 'Hangul & Reading',
    description: 'Learn the Korean alphabet — vowels, consonants, and how syllables combine.',
    order_index: 10,
    icon: '한',
  },
  {
    slug: 'greetings',
    title: 'Greetings & Politeness',
    description: 'Hello, thank you, sorry — and the formality levels behind them.',
    order_index: 20,
    icon: '안',
  },
  {
    slug: 'numbers',
    title: 'Numbers & Counting',
    description: 'Native and Sino-Korean numbers, plus counters for time, age, and money.',
    order_index: 30,
    icon: '一',
  },
  {
    slug: 'particles',
    title: 'Particles',
    description: 'The system: 은/는, 이/가, 을/를, 에, 에서 — what each one marks and why.',
    order_index: 40,
    icon: '은',
  },
  {
    slug: 'verbs-present',
    title: 'Verbs — Present Tense',
    description: 'Dictionary form, polite -아/어요, and formal -ㅂ니다 across common verbs.',
    order_index: 50,
    icon: '하',
  },
  {
    slug: 'vocab-daily',
    title: 'Daily Life Vocabulary',
    description: 'Food, family, places, time, objects, colors — everyday words in context.',
    order_index: 60,
    icon: '집',
  },
  {
    slug: 'patterns',
    title: 'Sentence Patterns',
    description: 'SOV order, the copula, negation, questions — building real sentences.',
    order_index: 70,
    icon: '문',
  },
  {
    slug: 'reading',
    title: 'Reading & Translation',
    description: 'Translate full sentences and short passages, both directions.',
    order_index: 80,
    icon: '글',
  },
];
