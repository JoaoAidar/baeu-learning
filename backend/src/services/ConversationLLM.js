// LLM layer for the conversation simulator. Two calls:
//   personaReply()        — in-character Korean chat turn
//   evaluateConversation()— end-of-chat structured feedback (semantic+syntactic)
// Provider-agnostic OpenRouter chat-completions, same env contract as
// LLMGenerator (LLM_API_KEY/OPENROUTER_API_KEY, LLM_BASE_URL, LLM_MODEL).

import { chatCompletionsUrl } from '../util/llmUrl.js';

const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

function clampInt(raw, fallback, min, max) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

// Cost brakes. Conversations are multi-turn, so each LLM roundtrip is a separate
// call. These bound spend without being billing-grade (in-process, resets on
// restart — a personal safety brake, like LLMGenerator's daily tally).
const REPLY_MAX_TOKENS = clampInt(process.env.CHAT_REPLY_MAX_TOKENS, 300, 64, 2000);
const EVAL_MAX_TOKENS = clampInt(process.env.CHAT_EVAL_MAX_TOKENS, 2000, 256, 8000);
// Total LLM calls per UTC day across persona replies + evaluations. 0 disables.
const DAILY_CALL_CAP = clampInt(process.env.CHAT_DAILY_CALL_CAP, 400, 0, 100000);

const dailyTally = { day: null, count: 0 };
function utcDay() {
  return new Date().toISOString().slice(0, 10);
}
function reserveCall() {
  if (!DAILY_CALL_CAP) return;
  const today = utcDay();
  if (dailyTally.day !== today) {
    dailyTally.day = today;
    dailyTally.count = 0;
  }
  if (dailyTally.count + 1 > DAILY_CALL_CAP) {
    throw httpError(429, 'chat_daily_cap_reached');
  }
  dailyTally.count += 1;
}

async function callOpenRouter({ messages, maxTokens, temperature, json = false, fetchImpl }) {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw httpError(503, 'llm_not_configured');
  const url = chatCompletionsUrl();
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  reserveCall();

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (json) body.response_format = { type: 'json_object' };

  const res = await (fetchImpl || globalThis.fetch)(url, {
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
  return data?.choices?.[0]?.message?.content || '';
}

// One in-character chat turn. `history` is [{role:'persona'|'learner', content}]
// oldest-first, already including the persona's opening line.
export async function personaReply({ persona, history, fetchImpl } = {}) {
  if (!persona) throw httpError(400, 'persona_required');
  const messages = [
    { role: 'system', content: persona.system },
    // Map our roles onto chat roles: the persona is the assistant.
    ...history.map((m) => ({
      role: m.role === 'persona' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];
  const content = await callOpenRouter({
    messages,
    maxTokens: REPLY_MAX_TOKENS,
    temperature: 0.8,
    fetchImpl,
  });
  const reply = String(content).trim();
  if (!reply) throw httpError(502, 'llm_empty_response');
  return reply;
}

const EVAL_SYSTEM = `You are an expert Korean (한국어) tutor reviewing a short chat a beginner learner just had with a roleplay partner. Produce a structured evaluation of the LEARNER's Korean only (ignore the partner's messages except as context).

Return a SINGLE valid JSON object (no markdown, no prose) with EXACTLY this shape:
{
  "overall": { "summary": string, "level": string, "encouragement": string },
  "messages": [
    {
      "original": string,                 // the learner's message, verbatim
      "hasIssues": boolean,
      "corrected": string,                // the most natural Korean version (Hangul). If already good, repeat the original.
      "issues": [
        { "type": "particle"|"spelling"|"conjugation"|"word_order"|"word_choice"|"register"|"spacing"|"other",
          "explanation": string }         // SHORT explanation of the fix
      ],
      "naturalness": string               // one short note on how natural it sounded, or "" if perfect
    }
  ],
  "semantic": { "communicated": boolean, "notes": string },  // did the learner's meaning come across? did the register fit the scenario?
  "vocab": [ { "ko": string, "en": string } ],   // up to 5 useful words/expressions from this chat to review
  "phrases": [ { "ko": string, "en": string } ]  // up to 4 natural phrases the learner could have used
}

Guidelines:
- "corrected" and all Korean stay in Hangul.
- Be encouraging and concrete. Tag the SPECIFIC grammar point in each issue (e.g. "Use 을/를 for the object, not 이/가").
- One entry in "messages" for EACH learner message, in order. Skip the partner's messages.`;

// Build the evaluator request from the transcript. `locale` is the language for
// the human-readable explanations (summary/issues/notes) — Korean text stays
// Hangul regardless.
export async function evaluateConversation({ persona, history, locale = 'en', fetchImpl } = {}) {
  if (!persona) throw httpError(400, 'persona_required');
  const transcript = history
    .map((m) => `${m.role === 'persona' ? persona.name : 'LEARNER'}: ${m.content}`)
    .join('\n');
  const localeName = locale === 'pt' ? 'Portuguese' : 'English';
  const user = `Scenario register: ${persona.register}. Partner: ${persona.name}.
Write every human-readable explanation (summary, encouragement, issue explanations, naturalness, notes) in ${localeName}. Keep all Korean examples in Hangul.

Transcript:
${transcript}`;

  const content = await callOpenRouter({
    messages: [
      { role: 'system', content: EVAL_SYSTEM },
      { role: 'user', content: user },
    ],
    maxTokens: EVAL_MAX_TOKENS,
    temperature: 0.3,
    json: true,
    fetchImpl,
  });
  return parseFeedback(content);
}

export function parseFeedback(raw) {
  if (!raw) throw httpError(502, 'llm_empty_response');
  const cleaned = String(raw).replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) throw httpError(502, 'llm_invalid_json');
    parsed = JSON.parse(m[0]);
  }
  // Defensive defaults so the UI never crashes on a partial response.
  return {
    overall: {
      summary: parsed?.overall?.summary || '',
      level: parsed?.overall?.level || '',
      encouragement: parsed?.overall?.encouragement || '',
    },
    messages: Array.isArray(parsed?.messages) ? parsed.messages : [],
    semantic: {
      communicated: Boolean(parsed?.semantic?.communicated),
      notes: parsed?.semantic?.notes || '',
    },
    vocab: Array.isArray(parsed?.vocab) ? parsed.vocab.slice(0, 5) : [],
    phrases: Array.isArray(parsed?.phrases) ? parsed.phrases.slice(0, 4) : [],
  };
}

function httpError(status, code) {
  const e = new Error(code);
  e.status = status;
  e.code = code;
  return e;
}
