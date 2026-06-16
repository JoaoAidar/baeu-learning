// TOPIK 1 content generators. Each returns exercises with `module_slug` set.
// Seed step resolves slug → module_id at insert time.

import { buildDepthContent } from './topik1Depth.js';
import { buildDepth2Content } from './topik1Depth2.js';

// ---------- VOCAB SOURCE TABLES ----------

const VOCAB = [
  // [english, korean, romanization, sub_skill]
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
  ['noodles', '국수', 'guksu', 'food'],
  ['egg', '달걀', 'dalgyal', 'food'],
  ['vegetable', '채소', 'chaeso', 'food'],
  ['mother', '어머니', 'eomeoni', 'family'],
  ['father', '아버지', 'abeoji', 'family'],
  ['older brother (male speaker)', '형', 'hyeong', 'family'],
  ['older sister (male speaker)', '누나', 'nuna', 'family'],
  ['older brother (female speaker)', '오빠', 'oppa', 'family'],
  ['older sister (female speaker)', '언니', 'eonni', 'family'],
  ['younger sibling', '동생', 'dongsaeng', 'family'],
  ['son', '아들', 'adeul', 'family'],
  ['daughter', '딸', 'ttal', 'family'],
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
  ['chair', '의자', 'uija', 'objects'],
  ['table', '책상', 'chaeksang', 'objects'],
  ['key', '열쇠', 'yeolsoe', 'objects'],
  ['house', '집', 'jip', 'places'],
  ['school', '학교', 'hakgyo', 'places'],
  ['library', '도서관', 'doseogwan', 'places'],
  ['restaurant', '식당', 'sikdang', 'places'],
  ['cafe', '카페', 'kape', 'places'],
  ['store', '가게', 'gage', 'places'],
  ['bank', '은행', 'eunhaeng', 'places'],
  ['hospital', '병원', 'byeongwon', 'places'],
  ['Korea', '한국', 'hanguk', 'places'],
  ['Seoul', '서울', 'seoul', 'places'],
  ['today', '오늘', 'oneul', 'time'],
  ['tomorrow', '내일', 'naeil', 'time'],
  ['yesterday', '어제', 'eoje', 'time'],
  ['morning', '아침', 'achim', 'time'],
  ['afternoon', '오후', 'ohu', 'time'],
  ['evening', '저녁', 'jeonyeok', 'time'],
  ['night', '밤', 'bam', 'time'],
  ['week', '주', 'ju', 'time'],
  ['month', '월', 'wol', 'time'],
  ['year', '년', 'nyeon', 'time'],
];

const NUMBERS_NATIVE = [
  ['1', '하나', 'hana'], ['2', '둘', 'dul'], ['3', '셋', 'set'],
  ['4', '넷', 'net'], ['5', '다섯', 'daseot'], ['6', '여섯', 'yeoseot'],
  ['7', '일곱', 'ilgop'], ['8', '여덟', 'yeodeol'], ['9', '아홉', 'ahop'],
  ['10', '열', 'yeol'],
];

const NUMBERS_SINO = [
  ['1', '일', 'il'], ['2', '이', 'i'], ['3', '삼', 'sam'],
  ['4', '사', 'sa'], ['5', '오', 'o'], ['6', '육', 'yuk'],
  ['7', '칠', 'chil'], ['8', '팔', 'pal'], ['9', '구', 'gu'],
  ['10', '십', 'sip'], ['100', '백', 'baek'], ['1000', '천', 'cheon'],
  ['10000', '만', 'man'],
];

const COUNTERS = [
  ['one person', '한 명', 'han myeong', 'native', 'people counter'],
  ['two people', '두 명', 'du myeong', 'native', 'people counter'],
  ['one (object)', '한 개', 'han gae', 'native', 'general counter'],
  ['three (objects)', '세 개', 'se gae', 'native', 'general counter'],
  ['one o\'clock', '한 시', 'han si', 'native', 'hour counter'],
  ['three o\'clock', '세 시', 'se si', 'native', 'hour counter'],
  ['ten minutes', '십 분', 'sip bun', 'sino', 'minute counter'],
  ['thirty minutes', '삼십 분', 'samsip bun', 'sino', 'minute counter'],
  ['twenty years old', '스무 살', 'seumu sal', 'native', 'age counter'],
  ['ten years old', '열 살', 'yeol sal', 'native', 'age counter'],
];

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
  ['to wait', '기다리다', '기다려요', '기다립니다'],
  ['to like', '좋아하다', '좋아해요', '좋아합니다'],
  ['to study', '공부하다', '공부해요', '공부합니다'],
];

// Past polite (-았/었어요). Forms are verified explicitly (not derived) to avoid
// vowel-harmony mistakes. Past tense was previously only present inside hard
// sentences — these are dedicated conjugation drills. [en, dictionary, past].
const VERBS_PAST = [
  ['to go', '가다', '갔어요'],
  ['to come', '오다', '왔어요'],
  ['to eat', '먹다', '먹었어요'],
  ['to drink', '마시다', '마셨어요'],
  ['to do', '하다', '했어요'],
  ['to see / watch', '보다', '봤어요'],
  ['to buy', '사다', '샀어요'],
  ['to give', '주다', '줬어요'],
  ['to read', '읽다', '읽었어요'],
  ['to learn', '배우다', '배웠어요'],
  ['to know', '알다', '알았어요'],
  ['to live', '살다', '살았어요'],
  ['to wait', '기다리다', '기다렸어요'],
  ['to like', '좋아하다', '좋아했어요'],
  ['to study', '공부하다', '공부했어요'],
];

// Tense discrimination: pick the right form for an English sentence. Trains
// recognition of present vs past vs future (-(으)ㄹ 거예요) — a core TOPIK-1 skill
// not previously drilled in isolation. All four options are real, verified forms.
const TENSE_MC = [
  { en: 'I went to school yesterday.', answer: '갔어요', distractors: ['가요', '갈 거예요', '가세요'], skill: 'past' },
  { en: 'I will eat tomorrow.', answer: '먹을 거예요', distractors: ['먹어요', '먹었어요', '먹으세요'], skill: 'future' },
  { en: 'I watched a movie.', answer: '봤어요', distractors: ['봐요', '볼 거예요', '보세요'], skill: 'past' },
  { en: 'I bought bread.', answer: '샀어요', distractors: ['사요', '살 거예요', '사세요'], skill: 'past' },
  { en: 'I will learn Korean.', answer: '배울 거예요', distractors: ['배워요', '배웠어요', '배우세요'], skill: 'future' },
  { en: 'I study every day.', answer: '공부해요', distractors: ['공부했어요', '공부할 거예요', '공부하세요'], skill: 'present' },
];

const PARTICLES = [
  { sentence: '저___ 학생입니다.', en: 'I am a student.', answer: '는', alts: [], skill: 'topic_marker' },
  { sentence: '오빠___ 멋있어요.', en: 'My older brother is cool.', answer: '는', alts: [], skill: 'topic_marker' },
  { sentence: '책___ 좋아요.', en: 'I like books.', answer: '이', alts: [], skill: 'subject_marker' },
  { sentence: '비___ 와요.', en: 'It rains.', answer: '가', alts: [], skill: 'subject_marker' },
  { sentence: '사과___ 먹어요.', en: 'I eat an apple.', answer: '를', alts: [], skill: 'object_marker' },
  { sentence: '물___ 마셔요.', en: 'I drink water.', answer: '을', alts: [], skill: 'object_marker' },
  { sentence: '학교___ 가요.', en: 'I go to school.', answer: '에', alts: [], skill: 'location' },
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
  { sentence: '동생___ 와요.', en: 'My younger sibling is coming.', answer: '이', alts: [], skill: 'subject_marker' },
  { sentence: '병원___ 가요.', en: 'I go to the hospital.', answer: '에', alts: [], skill: 'location' },
  { sentence: '식당___ 밥을 먹어요.', en: 'I eat at the restaurant.', answer: '에서', alts: [], skill: 'location' },
  { sentence: '저는 차___ 좋아해요.', en: 'I like tea.', answer: '를', alts: [], skill: 'object_marker' },
  // Extra reinforcement — these grammar skills were thin in the catalog.
  { sentence: '날씨___ 좋아요.', en: 'The weather is nice.', answer: '가', alts: [], skill: 'subject_marker' },
  { sentence: '저는 한국어___ 공부해요.', en: 'I study Korean.', answer: '를', alts: [], skill: 'object_marker' },
  { sentence: '주말___ 집에 있어요.', en: 'On the weekend I am at home.', answer: '에', alts: [], skill: 'location' },
  { sentence: '형___ 회사원이에요.', en: 'My older brother is an office worker.', answer: '은', alts: [], skill: 'topic_marker' },
  { sentence: '고양이___ 귀여워요.', en: 'The cat is cute.', answer: '가', alts: [], skill: 'subject_marker' },
  { sentence: '저는 영화___ 봐요.', en: 'I watch a movie.', answer: '를', alts: [], skill: 'object_marker' },
  { sentence: '카페___ 커피를 사요.', en: 'I buy coffee at the cafe.', answer: '에서', alts: [], skill: 'location' },
  { sentence: '제 친구___ 의사예요.', en: 'My friend is a doctor.', answer: '는', alts: [], skill: 'topic_marker' },
  { sentence: '아기___ 자요.', en: 'The baby is sleeping.', answer: '가', alts: [], skill: 'subject_marker' },
  { sentence: '학생들___ 도서관에 있어요.', en: 'The students are in the library.', answer: '은', alts: ['이'], skill: 'topic_marker' },
];

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
  ['excuse me / I have a question', '저기요', 'jeogiyo'],
  ['please give me…', '주세요', 'juseyo'],
  ['it\'s okay / no problem', '괜찮아요', 'gwaenchanayo'],
];

const COLORS = [
  ['red', '빨간색', 'ppalgansaek'],
  ['blue', '파란색', 'paransaek'],
  ['yellow', '노란색', 'noransaek'],
  ['green', '초록색', 'choroksaek'],
  ['white', '흰색', 'huinsaek'],
  ['black', '검은색', 'geomeunsaek'],
  ['orange', '주황색', 'juhwangsaek'],
  ['pink', '분홍색', 'bunhongsaek'],
];

// Word-order drills. Korean is verb-final and roles are marked by particles, so
// the reliably-WRONG options are the ones where the verb is not last. (Reordering
// nouns alone is often still grammatical, so we never use that as a distractor.)
const WORD_ORDER = [
  { en: 'I eat rice.', correct: '저는 밥을 먹어요', wrong: ['먹어요 저는 밥을', '저는 먹어요 밥을', '밥을 먹어요 저는'] },
  { en: 'I read a book at home.', correct: '저는 집에서 책을 읽어요', wrong: ['읽어요 저는 집에서 책을', '저는 읽어요 집에서 책을', '저는 집에서 읽어요 책을'] },
  { en: 'I meet a friend at the cafe.', correct: '저는 카페에서 친구를 만나요', wrong: ['만나요 저는 카페에서 친구를', '저는 만나요 카페에서 친구를', '저는 카페에서 만나요 친구를'] },
  { en: 'I study Korean at the library.', correct: '저는 도서관에서 한국어를 공부해요', wrong: ['공부해요 저는 도서관에서 한국어를', '저는 공부해요 도서관에서 한국어를', '저는 도서관에서 공부해요 한국어를'] },
  { en: 'I buy bread at the store.', correct: '저는 가게에서 빵을 사요', wrong: ['사요 저는 가게에서 빵을', '저는 사요 가게에서 빵을', '저는 가게에서 사요 빵을'] },
];

// Harder TOPIK-1/2 sentences: connectors, clauses, intentions. Give the catalog
// a difficulty ceiling above easy/medium. Skills use tracked grammar tags.
const HARD = [
  { module: 'patterns', en: 'I like coffee, but I don\'t drink it at night.', ko: '저는 커피를 좋아하지만 밤에는 안 마셔요', alts: [], skills: ['negation', 'object_marker', 'word_order'] },
  { module: 'patterns', en: 'I eat breakfast and then go to school.', ko: '아침을 먹고 학교에 가요', alts: [], skills: ['verb_conjugation', 'word_order'] },
  { module: 'patterns', en: 'Because it rained, I stayed home.', ko: '비가 와서 집에 있었어요', alts: [], skills: ['verb_conjugation', 'past'] },
  { module: 'patterns', en: 'I want to eat Korean food.', ko: '한국 음식을 먹고 싶어요', alts: ['한국 음식이 먹고 싶어요'], skills: ['verbs', 'word_order'] },
  { module: 'patterns', en: 'Although Korean is hard, it is fun.', ko: '한국어가 어렵지만 재미있어요', alts: [], skills: ['adjectives', 'subject_marker'] },
  { module: 'patterns', en: 'I drink coffee in the morning and tea in the evening.', ko: '아침에는 커피를 마시고 저녁에는 차를 마셔요', alts: [], skills: ['word_order', 'time'] },
  { module: 'patterns', en: 'Even though it is expensive, I will buy it.', ko: '비싸지만 살 거예요', alts: [], skills: ['adjectives', 'future'] },
  { module: 'patterns', en: 'I am studying Korean to work in Korea.', ko: '한국에서 일하려고 한국어를 공부해요', alts: ['한국에서 일하기 위해 한국어를 공부해요'], skills: ['verb_conjugation', 'word_order'] },
  { module: 'reading', en: 'When I have time, I read books.', ko: '시간이 있을 때 책을 읽어요', alts: [], skills: ['existence', 'word_order'] },
  { module: 'reading', en: 'I went to the restaurant, but there were no seats.', ko: '식당에 갔지만 자리가 없었어요', alts: ['식당에 갔는데 자리가 없었어요'], skills: ['past', 'existence'] },

  // --- Hard-tier expansion: connective endings, clauses, and intermediate
  // grammar at the TOPIK 1–2 boundary. Translate-to-Korean (no trailing
  // period, matching the rest of the catalog); alts capture acceptable
  // particle/register variants. Additive + idempotent via seed dedupe.
  { module: 'patterns', en: 'If you study hard, you will pass the exam.', ko: '열심히 공부하면 시험에 합격할 거예요', alts: [], skills: ['conditional', 'future'] },
  { module: 'patterns', en: 'I cannot go because I am busy.', ko: '바빠서 못 가요', alts: ['바빠서 갈 수 없어요'], skills: ['reason', 'negation'] },
  { module: 'patterns', en: 'Please wait a moment.', ko: '잠깐만 기다려 주세요', alts: ['잠시만 기다려 주세요'], skills: ['requests', 'honorifics'] },
  { module: 'patterns', en: 'I have to go to work tomorrow.', ko: '내일 회사에 가야 해요', alts: ['내일 회사에 가야 돼요'], skills: ['obligation', 'verb_conjugation'] },
  { module: 'patterns', en: 'I can speak a little Korean.', ko: '한국어를 조금 할 수 있어요', alts: [], skills: ['ability', 'verbs'] },
  { module: 'patterns', en: 'Before I sleep, I brush my teeth.', ko: '자기 전에 이를 닦아요', alts: [], skills: ['sequence', 'time'] },
  { module: 'patterns', en: 'After I eat, I drink coffee.', ko: '밥을 먹은 후에 커피를 마셔요', alts: [], skills: ['sequence', 'verb_conjugation'] },
  { module: 'patterns', en: 'I study while listening to music.', ko: '음악을 들으면서 공부해요', alts: [], skills: ['simultaneous', 'verb_conjugation'] },
  { module: 'patterns', en: 'Since I have no time today, let us meet tomorrow.', ko: '오늘은 시간이 없으니까 내일 만나요', alts: [], skills: ['reason', 'word_order'] },
  { module: 'patterns', en: 'Even if it is expensive, I want to buy it.', ko: '비싸도 사고 싶어요', alts: [], skills: ['concessive', 'verbs'] },
  { module: 'patterns', en: 'If you have no money, you cannot buy it.', ko: '돈이 없으면 살 수 없어요', alts: [], skills: ['conditional', 'ability'] },
  { module: 'patterns', en: 'I go to Korea to learn Korean.', ko: '한국어를 배우러 한국에 가요', alts: [], skills: ['purpose', 'word_order'] },
  { module: 'patterns', en: 'Do not worry, everything will be fine.', ko: '걱정하지 마세요, 다 괜찮을 거예요', alts: [], skills: ['prohibition', 'future'] },
  { module: 'patterns', en: 'You must not smoke here.', ko: '여기에서 담배를 피우면 안 돼요', alts: [], skills: ['prohibition', 'location'] },
  { module: 'patterns', en: 'May I open the window?', ko: '창문을 열어도 돼요?', alts: ['창문을 열어도 됩니까?'], skills: ['permission', 'questions'] },
  { module: 'patterns', en: 'I have never been to Korea.', ko: '한국에 가 본 적이 없어요', alts: [], skills: ['experience', 'negation'] },
  { module: 'patterns', en: 'Have you ever eaten Korean food?', ko: '한국 음식을 먹어 본 적이 있어요?', alts: [], skills: ['experience', 'questions'] },
  { module: 'patterns', en: 'These days I am trying to learn Korean.', ko: '요즘 한국어를 배우려고 해요', alts: [], skills: ['intention', 'verb_conjugation'] },
  { module: 'patterns', en: 'Please speak slowly.', ko: '천천히 말해 주세요', alts: [], skills: ['requests', 'honorifics'] },
  { module: 'patterns', en: 'I want to rest because I am tired.', ko: '피곤해서 쉬고 싶어요', alts: [], skills: ['reason', 'verbs'] },
  { module: 'patterns', en: 'If you go straight, there is a bank on the right.', ko: '쭉 가면 오른쪽에 은행이 있어요', alts: ['똑바로 가면 오른쪽에 은행이 있어요'], skills: ['conditional', 'location'] },
  { module: 'patterns', en: 'It is getting colder these days.', ko: '요즘 점점 추워져요', alts: [], skills: ['adjectives', 'change'] },
  { module: 'patterns', en: 'I think Korean food is delicious.', ko: '한국 음식이 맛있는 것 같아요', alts: [], skills: ['opinion', 'adjectives'] },
  { module: 'patterns', en: 'Can you help me?', ko: '좀 도와줄 수 있어요?', alts: ['도와주실 수 있어요?'], skills: ['ability', 'requests'] },
  { module: 'reading', en: 'My younger sister is taller than me.', ko: '여동생이 저보다 키가 더 커요', alts: [], skills: ['comparison', 'adjectives'] },
  { module: 'reading', en: 'This bag is more expensive than that one.', ko: '이 가방이 저것보다 더 비싸요', alts: [], skills: ['comparison', 'adjectives'] },
  { module: 'reading', en: 'Seoul is the city I like the most.', ko: '서울은 제가 제일 좋아하는 도시예요', alts: [], skills: ['relative_clause', 'preferences'] },
  { module: 'reading', en: 'The person reading a book is my friend.', ko: '책을 읽는 사람은 제 친구예요', alts: [], skills: ['relative_clause'] },
  { module: 'reading', en: 'The movie I watched yesterday was fun.', ko: '어제 본 영화가 재미있었어요', alts: [], skills: ['relative_clause', 'past'] },
  { module: 'reading', en: 'The food my mom makes is the most delicious.', ko: '엄마가 만드는 음식이 제일 맛있어요', alts: [], skills: ['relative_clause', 'adjectives'] },
  { module: 'reading', en: 'I am looking for a house to live in Seoul.', ko: '서울에서 살 집을 찾고 있어요', alts: [], skills: ['relative_clause', 'progressive'] },
  { module: 'reading', en: 'Because I was sick yesterday, I did not go to work.', ko: '어제 아파서 회사에 안 갔어요', alts: [], skills: ['reason', 'past'] },
  { module: 'reading', en: 'When I was young, I lived in Busan.', ko: '어렸을 때 부산에서 살았어요', alts: [], skills: ['time', 'past'] },
  { module: 'reading', en: 'I will call you after I arrive.', ko: '도착한 후에 전화할게요', alts: [], skills: ['sequence', 'future'] },
  { module: 'reading', en: 'Although I studied a lot, the exam was difficult.', ko: '많이 공부했지만 시험이 어려웠어요', alts: [], skills: ['concessive', 'past'] },
  { module: 'reading', en: 'The weather is nice today, so let us take a walk.', ko: '오늘 날씨가 좋으니까 산책해요', alts: [], skills: ['reason', 'weather'] },
  { module: 'reading', en: 'It has been two years since I started studying Korean.', ko: '한국어를 공부한 지 2년 됐어요', alts: [], skills: ['duration', 'past'] },
  { module: 'reading', en: 'When I have time, I want to travel.', ko: '시간이 있으면 여행하고 싶어요', alts: [], skills: ['conditional', 'verbs'] },
  { module: 'reading', en: 'I came to Korea three months ago.', ko: '저는 세 달 전에 한국에 왔어요', alts: ['저는 3개월 전에 한국에 왔어요'], skills: ['past', 'time'] },
  { module: 'reading', en: 'My house is near the subway station.', ko: '우리 집은 지하철역에서 가까워요', alts: ['저희 집은 지하철역에서 가까워요'], skills: ['location', 'adjectives'] },
];

// ---------- HANGUL ----------

const HANGUL_VOWELS = [
  ['ㅏ', 'a'], ['ㅓ', 'eo'], ['ㅗ', 'o'], ['ㅜ', 'u'],
  ['ㅡ', 'eu'], ['ㅣ', 'i'], ['ㅑ', 'ya'], ['ㅕ', 'yeo'],
  ['ㅛ', 'yo'], ['ㅠ', 'yu'], ['ㅐ', 'ae'], ['ㅔ', 'e'],
];

const HANGUL_CONSONANTS = [
  ['ㄱ', 'g/k'], ['ㄴ', 'n'], ['ㄷ', 'd/t'], ['ㄹ', 'r/l'],
  ['ㅁ', 'm'], ['ㅂ', 'b/p'], ['ㅅ', 's'], ['ㅇ', 'silent / ng'],
  ['ㅈ', 'j'], ['ㅊ', 'ch'], ['ㅋ', 'k'], ['ㅌ', 't'],
  ['ㅍ', 'p'], ['ㅎ', 'h'],
];

const HANGUL_SYLLABLES = [
  ['가', 'ga'], ['나', 'na'], ['다', 'da'], ['라', 'ra'],
  ['마', 'ma'], ['바', 'ba'], ['사', 'sa'], ['아', 'a'],
  ['자', 'ja'], ['하', 'ha'], ['고', 'go'], ['도', 'do'],
  ['로', 'ro'], ['모', 'mo'], ['보', 'bo'], ['소', 'so'],
];

// ---------- HELPERS ----------

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.map((o, idx) => ({ ...o, id: 'abcd'[idx] }));
}

function pickDistractors(allOptions, exclude, n) {
  const pool = allOptions.filter((x) => x !== exclude);
  const out = [];
  while (out.length < n && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

// ---------- GENERATORS ----------

function hangulModule() {
  const out = [];
  for (const [letter, sound] of HANGUL_VOWELS) {
    const distractors = pickDistractors(HANGUL_VOWELS.map((v) => v[1]), sound, 3);
    const options = shuffle([
      { id: 'a', text: sound },
      { id: 'b', text: distractors[0] },
      { id: 'c', text: distractors[1] },
      { id: 'd', text: distractors[2] },
    ]);
    out.push({
      module_slug: 'hangul',
      type: 'multiple_choice',
      difficulty: 'easy',
      prompt: `Vowel ${letter} — what sound does it make?`,
      options,
      correct_answer: options.find((o) => o.text === sound).id,
      accepted_answers: [sound],
      explanation: `${letter} = "${sound}".`,
      skill_tags: ['hangul', 'hangul_reading', 'vowels'],
      metadata: {},
      status: 'published',
    });
  }
  for (const [letter, sound] of HANGUL_CONSONANTS) {
    const distractors = pickDistractors(HANGUL_CONSONANTS.map((c) => c[1]), sound, 3);
    const options = shuffle([
      { id: 'a', text: sound },
      { id: 'b', text: distractors[0] },
      { id: 'c', text: distractors[1] },
      { id: 'd', text: distractors[2] },
    ]);
    out.push({
      module_slug: 'hangul',
      type: 'multiple_choice',
      difficulty: 'easy',
      prompt: `Consonant ${letter} — what sound does it make?`,
      options,
      correct_answer: options.find((o) => o.text === sound).id,
      accepted_answers: [sound],
      explanation: `${letter} = "${sound}".`,
      skill_tags: ['hangul', 'hangul_reading', 'consonants'],
      metadata: {},
      status: 'published',
    });
  }
  for (const [syl, rom] of HANGUL_SYLLABLES) {
    out.push({
      module_slug: 'hangul',
      type: 'translation',
      difficulty: 'easy',
      prompt: `Romanize this syllable: ${syl}`,
      correct_answer: rom,
      accepted_answers: [rom, rom.toLowerCase()],
      explanation: `${syl} = ${rom}.`,
      skill_tags: ['hangul', 'hangul_reading'],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  return out;
}

function greetingsModule() {
  const out = PHRASES.map(([en, ko, rom]) => ({
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
  // MC variation: choose the most appropriate greeting
  const mcCases = [
    {
      en: 'You meet your boss in the morning. What do you say?',
      correct: '안녕하세요',
      distractors: ['잘 지냈어?', '뭐해?', '안녕'],
    },
    {
      en: 'You\'re leaving a friend\'s house and they\'re staying. What do you say?',
      correct: '안녕히 계세요',
      distractors: ['안녕히 가세요', '안녕', '잘 가'],
    },
    {
      en: 'A waiter brings your food. Polite "thank you"?',
      correct: '감사합니다',
      distractors: ['미안합니다', '괜찮아요', '저기요'],
    },
    {
      en: 'You bumped into someone. What do you say?',
      correct: '죄송합니다',
      distractors: ['감사합니다', '안녕하세요', '네'],
    },
  ];
  for (const c of mcCases) {
    const options = shuffle([
      { id: 'a', text: c.correct },
      ...c.distractors.map((d, i) => ({ id: 'abcd'[i + 1], text: d })),
    ]);
    out.push({
      module_slug: 'greetings',
      type: 'multiple_choice',
      difficulty: 'medium',
      prompt: c.en,
      options,
      correct_answer: options.find((o) => o.text === c.correct).id,
      accepted_answers: [c.correct],
      explanation: `In context, ${c.correct} is the right register.`,
      skill_tags: ['greetings', 'phrases', 'register'],
      metadata: {},
      status: 'published',
    });
  }
  return out;
}

function numbersModule() {
  const out = [];
  for (const [num, ko, rom] of NUMBERS_NATIVE) {
    out.push({
      module_slug: 'numbers',
      type: 'translation',
      difficulty: 'easy',
      prompt: `Native Korean number: write "${num}" in Hangul (e.g., 하나).`,
      correct_answer: ko,
      accepted_answers: [ko],
      explanation: `${num} = ${ko} (${rom}). Native numbers count people/things.`,
      skill_tags: ['numbers', 'native_numbers'],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  for (const [num, ko, rom] of NUMBERS_SINO) {
    out.push({
      module_slug: 'numbers',
      type: 'translation',
      difficulty: 'easy',
      prompt: `Sino-Korean number: write "${num}" in Hangul (e.g., 일).`,
      correct_answer: ko,
      accepted_answers: [ko],
      explanation: `${num} = ${ko} (${rom}). Sino numbers are used for dates, money, minutes.`,
      skill_tags: ['numbers', 'sino_numbers'],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  for (const [en, ko, rom, system, ctx] of COUNTERS) {
    out.push({
      module_slug: 'numbers',
      type: 'translation',
      difficulty: 'medium',
      prompt: `Translate to Korean: "${en}"`,
      correct_answer: ko,
      accepted_answers: [ko],
      explanation: `${ko} (${rom}) — ${ctx}, uses ${system} numbers.`,
      skill_tags: ['numbers', `${system}_numbers`, 'counters'],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  // System-choice MC
  const sysCases = [
    { en: 'I am 25 years old. Which number system?', correct: 'native', explanation: 'Age uses native: 스물다섯 살.' },
    { en: 'It costs 3000 won. Which number system?', correct: 'sino', explanation: 'Money uses sino: 삼천 원.' },
    { en: '5:30 — five o\'clock thirty. Which numbers?', correct: 'mixed (native hour, sino minute)', explanation: 'Hour native (다섯 시), minute sino (삼십 분).' },
    { en: 'Phone number: 010-1234-5678. Which system?', correct: 'sino', explanation: 'Phone numbers use sino, digit by digit.' },
  ];
  for (const c of sysCases) {
    const all = ['native', 'sino', 'mixed (native hour, sino minute)', 'either is fine'];
    const distractors = all.filter((x) => x !== c.correct).slice(0, 3);
    const options = shuffle([
      { id: 'a', text: c.correct },
      ...distractors.map((d, i) => ({ id: 'abcd'[i + 1], text: d })),
    ]);
    out.push({
      module_slug: 'numbers',
      type: 'multiple_choice',
      difficulty: 'medium',
      prompt: c.en,
      options,
      correct_answer: options.find((o) => o.text === c.correct).id,
      accepted_answers: [c.correct],
      explanation: c.explanation,
      skill_tags: ['numbers', 'native_numbers', 'sino_numbers'],
      metadata: {},
      status: 'published',
    });
  }
  return out;
}

function particlesModule() {
  return PARTICLES.map(({ sentence, en, answer, alts, skill }) => ({
    module_slug: 'particles',
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

// Particle-contrast multiple choice. "Which particle?" is the #1 beginner error,
// but the catalog only trained it as fill_blank. This reuses the already-verified
// PARTICLES answers and turns each into a discrimination drill — restricted to the
// UNAMBIGUOUS skills (object 을/를, location 에/에서) and items with no accepted
// variants, so a distractor is never secretly also-correct. Distractors are
// particles from a different function (clearly wrong), plus the sibling location
// particle for the high-value 에/에서 contrast. Additive + idempotent (distinct
// prompt prefix from the fill_blank module, so seed dedupe won't collide).
function particleContrastModule() {
  const eligible = PARTICLES.filter(
    (p) => (p.skill === 'object_marker' || p.skill === 'location') && p.alts.length === 0
  );
  return eligible.map(({ sentence, en, answer, skill }) => {
    const distractors =
      skill === 'location'
        ? [answer === '에' ? '에서' : '에', '를', '가']
        : ['에', '에서', '가'];
    const options = shuffle([
      { id: 'a', text: answer },
      ...distractors.slice(0, 3).map((t, i) => ({ id: 'bcd'[i], text: t })),
    ]);
    const explanation =
      skill === 'location'
        ? `에 marks a destination or static location; 에서 marks where an action happens. Here it is ${answer}.`
        : `${answer} is the object particle (을 after a final consonant, 를 after a vowel). Here it is ${answer}.`;
    return {
      module_slug: 'particles',
      type: 'multiple_choice',
      difficulty: 'medium',
      prompt: `Choose the correct particle: ${sentence} ("${en}")`,
      options,
      correct_answer: options.find((o) => o.text === answer).id,
      accepted_answers: [answer],
      explanation,
      skill_tags: ['particles', 'particle_contrast', skill],
      metadata: {},
      status: 'published',
    };
  });
}

// Past-tense conjugation drills (fill_blank). New skill: 'past'.
function pastTenseModule() {
  return VERBS_PAST.map(([en, dict, past]) => ({
    module_slug: 'verbs-present',
    type: 'fill_blank',
    difficulty: 'medium',
    prompt: `Past polite (-았/었어요) form of ${dict} (${en})`,
    correct_answer: past,
    accepted_answers: [past],
    explanation: `${dict} → ${past} (past, polite).`,
    skill_tags: ['verbs', 'verb_conjugation', 'past'],
    metadata: {},
    status: 'published',
  }));
}

// Tense-discrimination multiple choice (present vs past vs future).
function tenseContrastModule() {
  return TENSE_MC.map(({ en, answer, distractors, skill }) => {
    const options = shuffle([
      { id: 'a', text: answer },
      ...distractors.slice(0, 3).map((t, i) => ({ id: 'bcd'[i], text: t })),
    ]);
    return {
      module_slug: 'verbs-present',
      type: 'multiple_choice',
      difficulty: 'medium',
      prompt: `Pick the correct verb form: "${en}"`,
      options,
      correct_answer: options.find((o) => o.text === answer).id,
      accepted_answers: [answer],
      explanation: `"${en}" → ${answer} (${skill}).`,
      // Keep to 3 tags: the selector adds a per-tag bonus, so a higher tag count
      // would over-serve these items relative to the rest of the catalog.
      skill_tags: ['verb_conjugation', 'tense', skill],
      metadata: {},
      status: 'published',
    };
  });
}

function verbsModule() {
  const out = [];
  for (const [en, dict, polite, formal] of VERBS) {
    out.push({
      module_slug: 'verbs-present',
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
      module_slug: 'verbs-present',
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
  for (let i = 0; i < 8; i++) {
    const [en, dict, polite, formal] = VERBS[i];
    const options = shuffle([
      { id: 'a', text: polite },
      { id: 'b', text: formal },
      { id: 'c', text: dict },
      { id: 'd', text: dict.replace(/.$/, '았다') },
    ]);
    out.push({
      module_slug: 'verbs-present',
      type: 'multiple_choice',
      difficulty: 'medium',
      prompt: `Which is the formal (-습니다) form of ${dict} ("${en}")?`,
      options,
      correct_answer: options.find((o) => o.text === formal).id,
      accepted_answers: [formal],
      explanation: `${dict} → ${formal} (formal-polite present).`,
      skill_tags: ['verbs', 'formality', 'honorifics'],
      metadata: {},
      status: 'published',
    });
  }
  return out;
}

function vocabDailyModule() {
  const out = [];
  // EN -> KO translation
  for (const [en, ko, rom, sub] of VOCAB) {
    out.push({
      module_slug: 'vocab-daily',
      type: 'translation',
      difficulty: 'easy',
      prompt: `Translate to Korean: "${en}"`,
      correct_answer: ko,
      accepted_answers: [ko],
      explanation: `${ko} (${rom}) = ${en}.`,
      skill_tags: ['vocabulary', sub],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  // KO -> EN reverse for first 16 high-frequency
  for (let i = 0; i < 16; i++) {
    const [en, ko, rom, sub] = VOCAB[i];
    out.push({
      module_slug: 'vocab-daily',
      type: 'translation',
      difficulty: 'easy',
      prompt: `What does "${ko}" mean in English?`,
      correct_answer: en,
      accepted_answers: [en, en.toLowerCase()],
      explanation: `${ko} (${rom}) = ${en}.`,
      skill_tags: ['vocabulary', 'reading', sub],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  // MC
  for (let i = 0; i < 16; i++) {
    const [en, ko, rom, sub] = VOCAB[i];
    const distractors = pickDistractors(VOCAB.map((v) => v[1]), ko, 3);
    const options = shuffle([
      { id: 'a', text: ko },
      ...distractors.map((d, k) => ({ id: 'abcd'[k + 1], text: d })),
    ]);
    out.push({
      module_slug: 'vocab-daily',
      type: 'multiple_choice',
      difficulty: 'easy',
      prompt: `Which Korean word means "${en}"?`,
      options,
      correct_answer: options.find((o) => o.text === ko).id,
      accepted_answers: [ko],
      explanation: `${ko} (${rom}) = ${en}.`,
      skill_tags: ['vocabulary', sub],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  // Colors
  for (const [en, ko, rom] of COLORS) {
    out.push({
      module_slug: 'vocab-daily',
      type: 'translation',
      difficulty: 'easy',
      prompt: `Translate to Korean: "${en}"`,
      correct_answer: ko,
      accepted_answers: [ko],
      explanation: `${ko} = ${en}.`,
      skill_tags: ['vocabulary', 'colors'],
      metadata: { romanization: rom },
      status: 'published',
    });
  }
  return out;
}

function patternsModule() {
  const sentences = [
    // Copula / identity
    { en: 'I am a student.', ko: '저는 학생이에요', alts: ['저는 학생입니다'], skills: ['copula', 'sentence'] },
    { en: 'I am Korean.', ko: '저는 한국 사람이에요', alts: ['저는 한국 사람입니다'], skills: ['copula', 'identity'] },
    { en: 'I am not a teacher.', ko: '저는 선생님이 아니에요', alts: ['저는 선생님이 아닙니다'], skills: ['copula', 'negation'] },
    { en: 'My name is Minsu.', ko: '제 이름은 민수예요', alts: ['제 이름은 민수입니다'], skills: ['copula', 'identity'] },
    { en: 'This is a book.', ko: '이것은 책이에요', alts: ['이것은 책입니다'], skills: ['copula', 'demonstrative'] },
    { en: 'That is not water.', ko: '그것은 물이 아니에요', alts: [], skills: ['copula', 'negation', 'demonstrative'] },
    { en: 'This is my friend.', ko: '이 사람은 제 친구예요', alts: [], skills: ['copula', 'demonstrative'] },
    // Negation 안 / 못
    { en: 'I do not eat meat.', ko: '저는 고기를 안 먹어요', alts: ['저는 고기를 먹지 않아요'], skills: ['negation', 'verbs'] },
    { en: 'I cannot go.', ko: '저는 못 가요', alts: ['저는 가지 못해요'], skills: ['negation', 'verbs'] },
    { en: 'I cannot speak Korean well.', ko: '한국어를 잘 못 해요', alts: ['한국어를 잘 못해요'], skills: ['negation', 'verbs'] },
    { en: 'I do not drink coffee.', ko: '저는 커피를 안 마셔요', alts: [], skills: ['negation', 'verbs'] },
    // Questions
    { en: 'Where is the bathroom?', ko: '화장실이 어디예요', alts: ['화장실이 어디에 있어요'], skills: ['questions', 'location'] },
    { en: 'What is this?', ko: '이것은 뭐예요', alts: ['이것이 뭐예요', '이게 뭐예요'], skills: ['questions', 'demonstrative'] },
    { en: 'How much is it?', ko: '얼마예요', alts: [], skills: ['questions', 'shopping'] },
    { en: 'What time is it?', ko: '몇 시예요', alts: [], skills: ['questions', 'time'] },
    { en: 'When does it start?', ko: '언제 시작해요', alts: [], skills: ['questions', 'time'] },
    { en: 'Who is that person?', ko: '저 사람은 누구예요', alts: ['저 사람이 누구예요'], skills: ['questions', 'demonstrative'] },
    { en: 'Why are you late?', ko: '왜 늦었어요', alts: [], skills: ['questions', 'common'] },
    // Existence 있다 / 없다
    { en: 'Do you have water?', ko: '물 있어요', alts: ['물이 있어요'], skills: ['questions', 'existence'] },
    { en: 'There is no time.', ko: '시간이 없어요', alts: [], skills: ['existence', 'time'] },
    { en: 'I have a Korean friend.', ko: '한국 친구가 있어요', alts: [], skills: ['existence'] },
    // Adjectives + intensifiers
    { en: 'It is delicious.', ko: '맛있어요', alts: [], skills: ['adjectives'] },
    { en: 'It is too expensive.', ko: '너무 비싸요', alts: [], skills: ['adjectives', 'shopping'] },
    { en: 'It is really cold today.', ko: '오늘 정말 추워요', alts: ['오늘은 정말 추워요'], skills: ['adjectives', 'weather'] },
    { en: 'It is a little hot.', ko: '조금 더워요', alts: [], skills: ['adjectives', 'weather'] },
    // Preferences
    { en: 'I like coffee.', ko: '저는 커피를 좋아해요', alts: [], skills: ['preferences', 'verbs'] },
    { en: 'I do not like spicy food.', ko: '저는 매운 음식을 안 좋아해요', alts: ['저는 매운 음식을 좋아하지 않아요'], skills: ['preferences', 'negation'] },
    // Common verbs
    { en: 'I do not know.', ko: '몰라요', alts: ['저는 몰라요'], skills: ['verbs', 'common'] },
    { en: 'I understand.', ko: '알겠어요', alts: ['이해했어요'], skills: ['verbs', 'common'] },
    // Requests
    { en: 'Please give me water.', ko: '물 주세요', alts: ['물을 주세요'], skills: ['requests', 'common'] },
    { en: 'Please wait a moment.', ko: '잠깐만요', alts: ['잠깐만 기다려 주세요'], skills: ['requests', 'common'] },
    { en: 'Please speak slowly.', ko: '천천히 말해 주세요', alts: [], skills: ['requests', 'common'] },
    { en: 'Please say it again.', ko: '다시 말해 주세요', alts: [], skills: ['requests', 'common'] },
    // SOV word order
    { en: 'I eat rice.', ko: '저는 밥을 먹어요', alts: [], skills: ['verbs', 'word_order'] },
    { en: 'I drink water.', ko: '저는 물을 마셔요', alts: [], skills: ['verbs', 'word_order'] },
    { en: 'I go to school.', ko: '저는 학교에 가요', alts: [], skills: ['verbs', 'particles'] },
    { en: 'I read a book.', ko: '저는 책을 읽어요', alts: [], skills: ['verbs', 'word_order'] },
    { en: 'I meet a friend.', ko: '저는 친구를 만나요', alts: [], skills: ['verbs', 'word_order'] },
    { en: 'I learn Korean.', ko: '저는 한국어를 배워요', alts: [], skills: ['verbs', 'vocabulary'] },
    { en: 'I live in Seoul.', ko: '저는 서울에 살아요', alts: [], skills: ['verbs', 'particles'] },
    { en: 'I study at the library.', ko: '저는 도서관에서 공부해요', alts: [], skills: ['verbs', 'particles'] },
    { en: 'I buy bread at the store.', ko: '저는 가게에서 빵을 사요', alts: [], skills: ['verbs', 'particles', 'word_order'] },
    { en: 'I drink coffee at the cafe.', ko: '저는 카페에서 커피를 마셔요', alts: [], skills: ['verbs', 'particles', 'word_order'] },
    { en: 'I read a book at home.', ko: '저는 집에서 책을 읽어요', alts: [], skills: ['verbs', 'particles', 'word_order'] },
    { en: 'I do my homework in the evening.', ko: '저는 저녁에 숙제를 해요', alts: [], skills: ['verbs', 'particles', 'time'] },
  ];
  return sentences.map(({ en, ko, alts, skills }) => ({
    module_slug: 'patterns',
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

function readingModule() {
  const items = [
    // Identity / introductions
    { ko: '저는 한국 사람이에요. 서울에 살아요.', en: 'I am Korean. I live in Seoul.', skills: ['reading', 'sentence'] },
    { ko: '제 이름은 민수예요.', en: 'My name is Minsu.', skills: ['reading', 'identity'] },
    { ko: '저는 회사원이에요.', en: 'I am an office worker.', skills: ['reading', 'identity'] },
    { ko: '저는 스물다섯 살이에요.', en: 'I am twenty-five years old.', skills: ['reading', 'identity', 'numbers'] },
    // Weather
    { ko: '오늘은 비가 와요. 우산이 필요해요.', en: 'It rains today. I need an umbrella.', skills: ['reading', 'weather'] },
    { ko: '오늘 날씨가 정말 좋아요.', en: 'The weather is really nice today.', skills: ['reading', 'weather'] },
    { ko: '겨울에는 눈이 와요.', en: 'It snows in winter.', skills: ['reading', 'weather'] },
    // Daily routines
    { ko: '커피 한 잔 주세요.', en: 'One cup of coffee, please.', skills: ['reading', 'requests'] },
    { ko: '몇 시예요?', en: 'What time is it?', skills: ['reading', 'questions', 'time'] },
    { ko: '도서관에서 공부해요.', en: 'I study at the library.', skills: ['reading', 'verbs'] },
    { ko: '저는 한국어를 배우고 있어요.', en: 'I am learning Korean.', skills: ['reading', 'progressive'] },
    { ko: '내일 친구를 만날 거예요.', en: 'I will meet a friend tomorrow.', skills: ['reading', 'future'] },
    { ko: '어제 영화를 봤어요.', en: 'I watched a movie yesterday.', skills: ['reading', 'past'] },
    { ko: '저는 매일 운동해요.', en: 'I exercise every day.', skills: ['reading', 'habit'] },
    { ko: '아침에 7시에 일어나요.', en: 'I wake up at 7 in the morning.', skills: ['reading', 'time', 'habit'] },
    { ko: '점심에 회사 사람들과 같이 먹어요.', en: 'I eat lunch with people from work.', skills: ['reading', 'time', 'habit'] },
    // Food / restaurant
    { ko: '이 식당은 정말 맛있어요.', en: 'This restaurant is really delicious.', skills: ['reading', 'adjectives'] },
    { ko: '한국 음식을 좋아해요.', en: 'I like Korean food.', skills: ['reading', 'preferences'] },
    { ko: '저는 매운 음식을 잘 못 먹어요.', en: 'I cannot eat spicy food well.', skills: ['reading', 'preferences', 'negation'] },
    { ko: '여기에서 제일 맛있는 게 뭐예요?', en: 'What is the most delicious thing here?', skills: ['reading', 'questions', 'adjectives'] },
    // Travel / direction
    { ko: '시청까지 어떻게 가요?', en: 'How do I get to City Hall?', skills: ['reading', 'questions', 'location'] },
    { ko: '지하철로 가면 빨라요.', en: 'It is fast if you go by subway.', skills: ['reading', 'transport'] },
    { ko: '저는 한국에 처음 왔어요.', en: 'I came to Korea for the first time.', skills: ['reading', 'past', 'travel'] },
    // Work / study
    { ko: '내일 회의가 있어요.', en: 'There is a meeting tomorrow.', skills: ['reading', 'work', 'existence'] },
    { ko: '저는 매일 한국어를 공부해요.', en: 'I study Korean every day.', skills: ['reading', 'habit'] },
    { ko: '한국어 시험이 다음 주에 있어요.', en: 'There is a Korean exam next week.', skills: ['reading', 'time', 'existence'] },
    // Mini paragraphs
    { ko: '저는 브라질 사람이에요. 한국에서 일하고 있어요.', en: 'I am Brazilian. I am working in Korea.', skills: ['reading', 'progressive', 'identity'] },
    { ko: '주말에는 친구들하고 영화를 봐요. 그리고 같이 저녁을 먹어요.', en: 'On weekends I watch movies with friends. And we eat dinner together.', skills: ['reading', 'paragraph', 'habit'] },
    { ko: '한국에 온 지 6개월 됐어요. 아직 한국어가 어려워요.', en: 'It\'s been 6 months since I came to Korea. Korean is still hard.', skills: ['reading', 'paragraph', 'duration'] },
  ];
  const out = [];
  for (const it of items) {
    out.push({
      module_slug: 'reading',
      type: 'translation',
      difficulty: 'medium',
      prompt: `Translate to English: "${it.ko}"`,
      correct_answer: it.en,
      accepted_answers: [it.en, it.en.toLowerCase()],
      explanation: `"${it.ko}" → "${it.en}".`,
      skill_tags: it.skills,
      metadata: {},
      status: 'published',
    });
    out.push({
      module_slug: 'reading',
      type: 'translation',
      difficulty: 'medium',
      prompt: `Translate to Korean: "${it.en}"`,
      correct_answer: it.ko,
      accepted_answers: [it.ko],
      explanation: `"${it.en}" → "${it.ko}".`,
      skill_tags: it.skills,
      metadata: {},
      status: 'published',
    });
  }
  return out;
}

function wordOrderModule() {
  return WORD_ORDER.map(({ en, correct, wrong }) => {
    const options = shuffle([
      { id: 'a', text: correct },
      ...wrong.slice(0, 3).map((w, i) => ({ id: 'abcd'[i + 1], text: w })),
    ]);
    return {
      module_slug: 'patterns',
      type: 'multiple_choice',
      difficulty: 'medium',
      prompt: `Pick the correctly ordered Korean sentence: "${en}"`,
      options,
      correct_answer: options.find((o) => o.text === correct).id,
      accepted_answers: [correct],
      explanation: `Korean is verb-final: ${correct}.`,
      skill_tags: ['word_order', 'sentence'],
      metadata: {},
      status: 'published',
    };
  });
}

function hardModule() {
  return HARD.map(({ module, en, ko, alts, skills }) => ({
    module_slug: module,
    type: 'translation',
    difficulty: 'hard',
    prompt: `Translate to Korean: "${en}"`,
    correct_answer: ko,
    accepted_answers: [ko, ...alts],
    explanation: `${ko}.`,
    skill_tags: skills,
    metadata: {},
    status: 'published',
  }));
}

// ---------- ENTRY POINT ----------

export function buildTopik1Content() {
  return [
    ...hangulModule(),
    ...greetingsModule(),
    ...numbersModule(),
    ...particlesModule(),
    ...particleContrastModule(),
    ...verbsModule(),
    ...pastTenseModule(),
    ...tenseContrastModule(),
    ...vocabDailyModule(),
    ...patternsModule(),
    ...wordOrderModule(),
    ...readingModule(),
    ...hardModule(),
    ...buildDepthContent(),
    ...buildDepth2Content(),
  ];
}
