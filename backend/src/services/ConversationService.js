// Conversation simulator service. Orchestrates persona chat turns and the
// end-of-chat evaluation. Ownership is enforced the same way as practice
// sessions (assertOwner -> 403), so one user can never read or drive another's
// conversation.

import { getStore } from '../config/db.js';
import { PERSONAS, getPersona, publicPersona } from '../db/personas.js';
import { personaReply, evaluateConversation } from './ConversationLLM.js';
import { recordConversationDiagnostics } from './ConversationDiagnostics.js';

// Max total messages (persona + learner) per conversation. Bounds LLM spend and
// keeps the end-of-chat evaluation focused. Env-overridable.
const MAX_MESSAGES = clampInt(process.env.CHAT_MAX_MESSAGES, 40, 6, 200);

export function listPersonas() {
  return PERSONAS.map(publicPersona);
}

export async function start({ userId, personaSlug }) {
  const persona = getPersona(personaSlug);
  if (!persona) throw httpError(404, 'persona_not_found');

  const store = getStore();
  const conversation = await store.createConversation({
    user_id: userId,
    persona_slug: persona.slug,
  });
  // Seed the chat with the persona's opening line.
  const opening = await store.addConversationMessage({
    conversation_id: conversation.id,
    role: 'persona',
    content: persona.opening,
  });

  return {
    conversationId: conversation.id,
    persona: publicPersona(persona),
    messages: [publicMessage(opening)],
  };
}

export async function reply({ userId, conversationId, text, fetchImpl }) {
  const clean = String(text ?? '').trim();
  if (!clean) throw httpError(400, 'empty_message');

  const store = getStore();
  const conversation = await store.getConversation(conversationId);
  if (!conversation) throw httpError(404, 'conversation_not_found');
  assertOwner(conversation, userId);
  if (conversation.status !== 'active') throw httpError(409, 'conversation_ended');

  const persona = getPersona(conversation.persona_slug);
  if (!persona) throw httpError(404, 'persona_not_found');

  const history = await store.listConversationMessages(conversationId);
  if (history.length >= MAX_MESSAGES) throw httpError(409, 'conversation_full');

  const learnerMsg = await store.addConversationMessage({
    conversation_id: conversationId,
    role: 'learner',
    content: clean,
  });

  // Ask the persona to respond given the full history (including this message).
  const replyText = await personaReply({
    persona,
    history: [...history, learnerMsg],
    fetchImpl,
  });
  const personaMsg = await store.addConversationMessage({
    conversation_id: conversationId,
    role: 'persona',
    content: replyText,
  });

  const count = history.length + 2;
  return {
    message: publicMessage(personaMsg),
    learner: publicMessage(learnerMsg),
    messageCount: count,
    full: count >= MAX_MESSAGES,
  };
}

export async function end({ userId, conversationId, fetchImpl }) {
  const store = getStore();
  const conversation = await store.getConversation(conversationId);
  if (!conversation) throw httpError(404, 'conversation_not_found');
  assertOwner(conversation, userId);

  // Idempotent: a re-ended conversation returns the stored feedback.
  if (conversation.status === 'ended' && conversation.feedback) {
    return { feedback: normalizeFeedback(conversation.feedback), alreadyEnded: true };
  }

  const persona = getPersona(conversation.persona_slug);
  if (!persona) throw httpError(404, 'persona_not_found');

  const history = await store.listConversationMessages(conversationId);
  const learnerTurns = history.filter((m) => m.role === 'learner').length;
  if (learnerTurns === 0) throw httpError(400, 'nothing_to_evaluate');

  const feedback = await evaluateConversation({ persona, history, locale: 'en', fetchImpl });
  await store.endConversation(conversationId, feedback);

  // Feed the chat's mistakes into the shared diagnostics so conversation shows
  // up in Progress/Results alongside drills. Best-effort: never block feedback.
  let diagnostics = null;
  try {
    diagnostics = await recordConversationDiagnostics({
      userId,
      personaSlug: conversation.persona_slug,
      feedback,
    });
  } catch (err) {
    diagnostics = { recorded: 0, error: err?.code || 'diagnostics_failed' };
  }

  return { feedback, diagnostics, alreadyEnded: false };
}

export async function get({ userId, conversationId }) {
  const store = getStore();
  const conversation = await store.getConversation(conversationId);
  if (!conversation) throw httpError(404, 'conversation_not_found');
  assertOwner(conversation, userId);
  const messages = await store.listConversationMessages(conversationId);
  return {
    conversationId,
    persona: publicPersona(getPersona(conversation.persona_slug)),
    status: conversation.status,
    messages: messages.map(publicMessage),
    feedback: conversation.feedback ? normalizeFeedback(conversation.feedback) : null,
  };
}

function publicMessage(m) {
  return { id: m.id, role: m.role, content: m.content, createdAt: m.created_at };
}

// pg returns jsonb already parsed; memory store holds the object. Guard anyway.
function normalizeFeedback(f) {
  if (typeof f === 'string') {
    try { return JSON.parse(f); } catch { return null; }
  }
  return f;
}

function assertOwner(conversation, userId) {
  if (userId == null) return;
  if (String(conversation.user_id) !== String(userId)) {
    throw httpError(403, 'conversation_forbidden');
  }
}

function clampInt(raw, fallback, min, max) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function httpError(status, code) {
  const e = new Error(code);
  e.status = status;
  e.code = code;
  return e;
}
