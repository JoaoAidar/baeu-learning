// LLM-backed exercise generator. Provider-agnostic; defaults to OpenRouter.
// Output is run through AdminService.validateExercise before insertion.

const DEFAULT_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

const VALID_TYPES = ['multiple_choice', 'translation', 'fill_blank'];

// Cost guardrails. The generator is admin-only and rate-limited at the route,
// but a runaway loop or a fat `count` could still rack up OpenRouter spend.
// These bound a single request and the total per UTC day.
const MAX_PER_REQUEST = clampInt(process.env.LLM_MAX_PER_REQUEST, 50, 1, 100);
const MAX_TOKENS = clampInt(process.env.LLM_MAX_TOKENS, 4000, 256, 32000);
// Items generated per UTC day across the process. 0 disables the cap.
const DAILY_CAP = clampInt(process.env.LLM_DAILY_CAP, 200, 0, 100000);

// In-process daily tally. Single-instance backend (Railway, sleep=true), so a
// memory counter is enough; it resets on restart, which is acceptable for a
// personal safety brake rather than a billing-grade quota.
const dailyTally = { day: null, count: 0 };

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function reserveDailyBudget(n) {
  if (!DAILY_CAP) return;
  const today = utcDay();
  if (dailyTally.day !== today) {
    dailyTally.day = today;
    dailyTally.count = 0;
  }
  if (dailyTally.count + n > DAILY_CAP) {
    throw httpError(429, 'llm_daily_cap_reached');
  }
  dailyTally.count += n;
}

function clampInt(raw, fallback, min, max) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

const SYSTEM_PROMPT = `You are an expert Korean (한국어) tutor. You produce drill exercises for Korean learners (TOPIK 1 / beginner level by default).
You always answer with a SINGLE valid JSON array. No prose, no markdown fences.
Each item must follow this schema exactly:

{
  "type": "multiple_choice" | "translation" | "fill_blank",
  "difficulty": "easy" | "medium" | "hard",
  "prompt": string (the question shown to the learner, in the requested prompt_locale),
  "prompt_locale": "en" | "pt" | "ko",
  "options": [{"id":"a","text":"..."}, ...]   // only for multiple_choice; 4 options
  "correct_answer": string,                   // for multiple_choice: option id (a/b/c/d). For others: the canonical answer.
  "accepted_answers": [string, ...],          // additional valid forms (for translation/fill_blank). Include the canonical too.
  "explanation": string,                      // 1-2 sentences, in prompt_locale.
  "skill_tags": [string, ...],                // e.g. ["greetings","particles","verbs","numbers","food","family"]
  "metadata": { "romanization": string? }     // optional helpers
}

Rules:
- Use proper Hangul. Do not romanize the answer (you may include romanization in metadata).
- For multiple_choice, all 4 options must be plausible distractors in Korean.
- For translation, "correct_answer" is the canonical Korean form; "accepted_answers" should include common acceptable variants (informal/formal where reasonable).
- skill_tags must be lowercase snake_case.
- Never wrap the JSON in markdown. Output ONLY the JSON array.`;

function buildUserPrompt({ topic, count, difficulty, types, promptLocale, extra }) {
  const constraints = [
    `Generate exactly ${count} exercises.`,
    topic ? `Topic / theme: ${topic}.` : 'Mixed beginner topics.',
    `Difficulty: ${difficulty}.`,
    `Allowed types: ${types.join(', ')}.`,
    `prompt_locale = "${promptLocale}".`,
  ];
  if (extra) constraints.push(`Extra constraints: ${extra}`);
  return constraints.join('\n');
}

export async function generateExercises({
  topic = '',
  count = 10,
  difficulty = 'easy',
  types = ['multiple_choice', 'translation'],
  promptLocale = 'en',
  extra = '',
  fetchImpl = globalThis.fetch,
} = {}) {
  const safeTypes = types.filter((t) => VALID_TYPES.includes(t));
  if (!safeTypes.length) {
    throw httpError(400, 'no_valid_types');
  }
  const apiKey = process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw httpError(503, 'llm_not_configured');

  const url = process.env.LLM_BASE_URL || DEFAULT_BASE;
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;
  const max = Math.min(Math.max(Number(count) || 10, 1), MAX_PER_REQUEST);

  // Reserve budget before spending. Counts against the cap even if the request
  // later fails, so a retry loop can't bypass the brake.
  reserveDailyBudget(max);

  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildUserPrompt({
          topic,
          count: max,
          difficulty,
          types: safeTypes,
          promptLocale,
          extra,
        }),
      },
    ],
    temperature: 0.6,
    max_tokens: MAX_TOKENS,
    response_format: { type: 'json_object' },
  };

  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://baeu.local',
      'X-Title': 'Baeu Learning',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw httpError(502, `llm_error: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return parseExercisesFromLLM(content);
}

export function parseExercisesFromLLM(raw) {
  if (!raw) throw httpError(502, 'llm_empty_response');
  const cleaned = stripFences(raw).trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Sometimes models return { exercises: [...] }
    const m = cleaned.match(/\[[\s\S]*\]/);
    if (!m) throw httpError(502, 'llm_invalid_json');
    parsed = JSON.parse(m[0]);
  }
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.exercises)) return parsed.exercises;
  if (Array.isArray(parsed?.items)) return parsed.items;
  throw httpError(502, 'llm_unexpected_shape');
}

function stripFences(s) {
  return s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
}

function httpError(status, code) {
  const e = new Error(code);
  e.status = status;
  // Mark code explicitly so the global error handler in app.js surfaces it
  // even on 5xx statuses (otherwise 5xx becomes a generic 'internal_error').
  e.code = code;
  return e;
}
