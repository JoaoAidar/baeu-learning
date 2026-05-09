// Grammar mini-lessons. Each one targets a specific error_tag from the classifier
// so that we can auto-recommend it when a learner trips on the same thing repeatedly.
// Markdown bodies are kept tight: rule, table when useful, examples, common mistake.

export const LESSONS = [
  {
    slug: 'topic-vs-subject',
    module_slug: 'particles',
    title: 'Topic vs Subject (은/는 vs 이/가)',
    summary: 'When to use 은/는 (the topic) vs 이/가 (the subject) — the most common confusion in Korean.',
    related_error_tags: ['particle'],
    related_skill_tags: ['topic_marker', 'subject_marker', 'particles'],
    order_index: 10,
    body_md: `## The rule in one line

**은/는** marks the *topic* — what you're talking about.
**이/가** marks the *subject* — what's doing or being something specifically.

## When the choice is each

| Situation | Marker | Example |
|---|---|---|
| Introducing yourself / general statement | 은/는 | 저**는** 학생이에요. *I am a student.* |
| Comparing or contrasting | 은/는 | 사과**는** 좋아하지만 바나나**는** 안 좋아해요. *I like apples but not bananas.* |
| Answering "who/what is doing X?" | 이/가 | 누가 왔어요? — 친구**가** 왔어요. *A friend came.* |
| Describing a state newly observed | 이/가 | 비**가** 와요. *It's raining.* |

## Form

- After a **vowel**: 는 / 가 → 저**는**, 친구**가**
- After a **consonant**: 은 / 이 → 책**은**, 학생**이**

## Common mistake

> 저**가** 학생이에요.   ← unnatural

You should use 저**는** when you're declaring who you are. Native speakers reserve 저가/내가 for when they're specifically the answer to "who?".

## Quick test

Which one fits?

- 오늘___ 비가 와요. *(today, it rains)*
- 내 친구___ 멋있어요. *(my friend is cool)*

Answers: **은**, **는** — both are general statements, so topic markers.
`,
  },

  {
    slug: 'object-marker',
    module_slug: 'particles',
    title: 'Object marker (을/를)',
    summary: 'Marks what the verb is acting on. Skipping it sounds childish; using the wrong form is the giveaway.',
    related_error_tags: ['particle'],
    related_skill_tags: ['object_marker', 'particles'],
    order_index: 20,
    body_md: `## The rule

**을/를** marks the **direct object** — the thing the verb is acting on.

- After a **consonant**: 을 → 밥**을** 먹어요. *I eat rice.*
- After a **vowel**: 를 → 사과**를** 먹어요. *I eat an apple.*

## Why it matters

Korean is SOV (subject-object-verb). The object marker is what tells the listener "this is what's being acted on", regardless of word order.

## Examples

| Sentence | Object |
|---|---|
| 저는 책**을** 읽어요. | 책 (book) |
| 저는 물**을** 마셔요. | 물 (water) |
| 저는 친구**를** 만나요. | 친구 (friend) |
| 한국어**를** 배워요. | 한국어 (Korean language) |

## When you can drop it (informally)

In casual speech, native speakers often drop 을/를 if context is clear:

> 밥 먹었어? *Did you eat?* — perfectly natural.

But in writing or formal speech, **always include it.**

## Common mistake

Picking the wrong allomorph. Use 을 after a consonant batchim, 를 after a vowel:

- 사과**를** ✓ (vowel ending)
- 사과**을** ✗
- 책**을** ✓ (consonant ending)
- 책**를** ✗
`,
  },

  {
    slug: 'location-particles',
    module_slug: 'particles',
    title: 'Location: 에 vs 에서',
    summary: '에 marks destination or static location; 에서 marks where an action happens.',
    related_error_tags: ['particle'],
    related_skill_tags: ['location', 'particles'],
    order_index: 30,
    body_md: `## The rule

- **에** = "to" or "at" (a destination, or a static existence point)
- **에서** = "at" or "from" (where an action takes place; or origin)

## Compare

| Sentence | Particle | Why |
|---|---|---|
| 학교**에** 가요. *I go to school.* | 에 | destination |
| 도서관**에서** 공부해요. *I study at the library.* | 에서 | action happens there |
| 서울**에** 살아요. *I live in Seoul.* | 에 | static existence |
| 카페**에서** 친구를 만나요. *I meet a friend at a cafe.* | 에서 | action verb (만나요) |
| 한국**에서** 왔어요. *I came from Korea.* | 에서 | origin |

## The trick

Ask: **is something happening there, or is something just located/going there?**

- "Living" 살다 is a state, not an action → **에**
- "Studying / meeting / eating" are actions → **에서**

## Common mistake

> 도서관**에** 공부해요. ✗

You're studying *at* the library, an action — should be 도서관**에서**.

> 학교**에서** 가요. ✗

Going *to* school is destination, not action-location — should be 학교**에**.
`,
  },

  {
    slug: 'polite-vs-formal',
    module_slug: 'verbs-present',
    title: 'Polite (-아/어요) vs Formal (-습니다)',
    summary: 'Both are polite, but they signal different registers. Mixing them up reads as untrained.',
    related_error_tags: ['honorific_formality'],
    related_skill_tags: ['formality', 'polite', 'honorifics', 'verb_conjugation'],
    order_index: 40,
    body_md: `## Two registers, both polite

| Ending | Register | Where you hear it |
|---|---|---|
| -**아/어요** | polite-casual | most everyday speech |
| -**ㅂ니다 / 습니다** | formal-polite | news anchors, presentations, military, customer service |

Both are *polite*. Both are appropriate for strangers and superiors. But they have a different feel.

## How to form

For 가다 (to go):

- Dictionary: 가다
- Polite -요: 가**요**
- Formal -ㅂ니다: 갑**니다**

For 먹다 (to eat):

- Dictionary: 먹다
- Polite -요: 먹**어요**
- Formal -습니다: 먹**습니다**

Rule of thumb: vowel-ending stem → -ㅂ니다; consonant-ending stem → -습니다.

## When to pick which

- **At work, in a meeting, on the phone with a stranger**: 합니다체 (-습니다) feels professional.
- **Friends-of-friends, shopkeepers, casual restaurant**: 해요체 (-요) is the default.
- **Mixing in one sentence**: don't. Pick one register and stick to it across the whole utterance.

## Common mistake

> 안녕하세요. 저는 학생**입니다**. 한국어를 **배워요**.

Mixed register: formal copula + polite verb. Sounds odd. Pick a lane:

- All polite: "저는 학생이에요. 한국어를 배워요."
- All formal: "저는 학생입니다. 한국어를 배웁니다."
`,
  },

  {
    slug: 'negation-an-vs-mot',
    module_slug: 'patterns',
    title: 'Negation: 안 vs 못',
    summary: '안 = "I don\'t / I won\'t". 못 = "I can\'t / I\'m not able to". Different meaning, same position.',
    related_error_tags: ['unknown', 'verb_conjugation'],
    related_skill_tags: ['negation', 'verbs'],
    order_index: 50,
    body_md: `## The two negations

| Particle | Meaning | Example |
|---|---|---|
| **안** | "don't / won't" — voluntary | 저는 술을 **안** 마셔요. *I don't drink alcohol.* |
| **못** | "can't / am not able to" — inability | 저는 매운 음식을 **못** 먹어요. *I can't eat spicy food.* |

Both go directly **before the verb**.

## Examples side by side

- 안 가요. *I'm not going.* (chose not to)
- 못 가요. *I can't go.* (something prevents me)
- 안 해요. *I don't do it.*
- 못 해요. *I can't do it.*

## Long-form alternatives

There's also a "back-form":

- -**지 않다** = same as 안
- -**지 못하다** = same as 못

> 가**지 않아요** = 안 가요
> 가**지 못해요** = 못 가요

The back-form sounds slightly more formal/written. Spoken Korean prefers the short form.

## Common mistake

Putting 안/못 in the wrong place — they go right before the verb, not the object:

- 저는 **안** 고기**를** 먹어요. ✗
- 저는 고기**를 안** 먹어요. ✓
`,
  },

  {
    slug: 'native-vs-sino-numbers',
    module_slug: 'numbers',
    title: 'Native vs Sino-Korean numbers',
    summary: 'Korean has two number systems. Mixing them up sounds like a tourist. Here\'s the split.',
    related_error_tags: ['unknown'],
    related_skill_tags: ['numbers', 'native_numbers', 'sino_numbers'],
    order_index: 60,
    body_md: `## Two systems, two uses

| System | Numbers (1-10) | What it counts |
|---|---|---|
| **Native** | 하나, 둘, 셋, 넷, 다섯, 여섯, 일곱, 여덟, 아홉, 열 | people, age, hours, things in general (1-99) |
| **Sino-Korean** | 일, 이, 삼, 사, 오, 육, 칠, 팔, 구, 십 | money, dates, minutes, phone numbers, math, anything 100+ |

## Quick reference

| Context | Use | Example |
|---|---|---|
| "Five people" | native | 다섯 명 |
| "Five o'clock" | native | 다섯 시 |
| "Twenty years old" | native | 스무 살 |
| "Five minutes" | sino | 오 분 |
| "May 5th" | sino | 오월 오일 |
| "5,000 won" | sino | 오천 원 |
| "Phone: 010-1234-5678" | sino | 공일공 일이삼사 오륙칠팔 |

## The classic mixed case: time

> "It's 3:15."   세 시 십오 분.

- 3 (hours) → native: **세**
- 15 (minutes) → sino: **십오**

## Common mistake

Using Sino for hours: 삼 시 sounds wrong to native ears. Stick to native for the hour, sino for the minute.

Same for age: it's **스물다섯 살** (native), not 이십오 살.
`,
  },

  {
    slug: 'word-order-sov',
    module_slug: 'patterns',
    title: 'Word order (Subject-Object-Verb)',
    summary: 'Korean verbs come last. Adjectives, time, and place fall before the verb in flexible order.',
    related_error_tags: ['word_order'],
    related_skill_tags: ['word_order', 'sentence'],
    order_index: 70,
    body_md: `## The rule

Korean is **SOV**. The verb is the last meaningful word in a sentence (auxiliaries can come after).

> [Subject + 은/는] + [Object + 을/를] + [Verb].
> 저는 사과를 먹어요. *I eat an apple.*

## Flexible middle

Particles do the heavy lifting, so the middle of the sentence is flexible. These all mean roughly the same:

- 저는 도서관에서 책을 읽어요.
- 저는 책을 도서관에서 읽어요.
- 도서관에서 저는 책을 읽어요.

What you can NOT do is put the verb anywhere but last.

## Time / place ordering

When you have multiple modifiers, the natural order is:

> [time] + [place] + [object] + [verb]

> 저는 어제 카페에서 친구를 만났어요. *Yesterday I met a friend at a cafe.*

## Common mistake

Putting the verb in the middle, like English:

- 저는 먹어요 사과를. ✗
- 저는 사과를 먹어요. ✓

Or skipping particles and getting ambiguous:

- 친구 사과 먹어요. (Who's eating? Whose apple?)
- 친구가 사과를 먹어요. ✓ (clear: friend eats apple)
`,
  },

  {
    slug: 'hangul-basics',
    module_slug: 'hangul',
    title: 'Reading Hangul: vowels, consonants, syllable blocks',
    summary: 'Hangul looks dense but it\'s phonetic and quick to learn. Here\'s the reading model.',
    related_error_tags: ['hangul_reading', 'romanization_dependency'],
    related_skill_tags: ['hangul', 'hangul_reading'],
    order_index: 80,
    body_md: `## Hangul is phonetic

Each block represents **one syllable**. Inside a block, each part represents a **single sound**.

## The basic vowels

| Letter | Sound (English) |
|---|---|
| ㅏ | "a" as in *father* |
| ㅓ | "eo" — like "uh" |
| ㅗ | "o" |
| ㅜ | "u" |
| ㅡ | "eu" — short, like the "e" in *taken* |
| ㅣ | "i" |

Add a stroke to get the y-version:
ㅑ ya, ㅕ yeo, ㅛ yo, ㅠ yu.

## The basic consonants

| Letter | Sound |
|---|---|
| ㄱ | g/k |
| ㄴ | n |
| ㄷ | d/t |
| ㄹ | r/l (between the two) |
| ㅁ | m |
| ㅂ | b/p |
| ㅅ | s |
| ㅇ | silent at start, "ng" at end |
| ㅈ | j |
| ㅎ | h |

## How blocks work

A syllable block has 2 or 3 parts:

> [initial consonant] + [vowel]
> [initial consonant] + [vowel] + [final consonant (받침)]

Example: 한 = ㅎ + ㅏ + ㄴ → "han"

The vowel position depends on its shape: vertical vowels (ㅏ ㅣ) go to the right, horizontal vowels (ㅗ ㅡ) go below.

## The trap: depending on romanization

If you keep reading "annyeonghaseyo" instead of 안녕하세요, you're not building reading speed. **Every time you see Hangul, force yourself to read it**, even if slower at first. Two weeks of this and romanization becomes annoying.
`,
  },

  {
    slug: 'copula-ieyo',
    module_slug: 'patterns',
    title: 'The copula 이에요 / 예요',
    summary: '"To be (something)" — the simplest sentence pattern, with one quirk: the form depends on the noun ending.',
    related_error_tags: ['unknown'],
    related_skill_tags: ['copula', 'sentence', 'identity'],
    order_index: 90,
    body_md: `## The copula

Korean's "to be (X)" — equating two things — is **이다** in dictionary form.

In polite speech, it shows up as:

- **이에요** after a consonant: 학생**이에요**. *(I) am a student.*
- **예요** after a vowel: 친구**예요**. *(They're) my friend.*

In formal speech: **입니다** (no allomorph).

## Examples

| Korean | English |
|---|---|
| 저는 한국 사람**이에요**. | I'm Korean. |
| 이것은 책**이에요**. | This is a book. |
| 제 친구**예요**. | (This) is my friend. |
| 저는 학생**입니다**. | I am a student. (formal) |

## The negative

The negative copula is **아니에요** (or **아닙니다** formal). It pairs with **이/가** (subject), not 을/를:

> 저는 학생**이 아니에요**. *I'm not a student.*
> 그것은 물**이 아니에요**. *That is not water.*

Note: subject marker is 이 because 학생/물 end in consonants. Use 가 after a vowel.

## Common mistake

Treating 이에요 like a verb you conjugate. It's not — it just attaches to the noun. The pattern is:

> [Topic + 은/는] + [Identity-noun] + 이에요/예요.

Not "Topic 은/는 verb-conjugate-thing".
`,
  },
];
