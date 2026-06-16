// Bridge conversation feedback into the existing diagnostics. When a chat is
// evaluated, each learner message becomes a practice_attempt (correct = no
// issues) so conversation mistakes flow into the same Progress/Results signals
// as drills: error-tag counts, accuracy, active days, and per-skill mastery.
//
// The evaluator reports an issue `type`; we map it onto the established
// error-tag taxonomy (so labels and lesson recommendations keep working) and,
// where a concrete trackable skill exists, onto a mastery skill.

import { getStore } from '../config/db.js';
import { recordAttempt as recordMasteryAttempt } from './MasteryService.js';

// issue.type -> { errorTag (always), skill (only when concrete & trackable) }
const ISSUE_MAP = {
  particle: { errorTag: 'particle', skill: null },
  conjugation: { errorTag: 'verb_conjugation', skill: 'verb_conjugation' },
  word_order: { errorTag: 'word_order', skill: 'word_order' },
  word_choice: { errorTag: 'vocabulary', skill: null },
  register: { errorTag: 'honorific_formality', skill: 'formality' },
  spelling: { errorTag: 'spelling', skill: 'hangul' },
  spacing: { errorTag: 'spacing', skill: null },
  other: { errorTag: 'syntax', skill: null },
};

function mapIssue(type) {
  return ISSUE_MAP[type] || ISSUE_MAP.other;
}

// Record one attempt per learner message. Best-effort by design — the caller
// wraps this so a diagnostics hiccup never blocks returning feedback.
export async function recordConversationDiagnostics({ userId, personaSlug, feedback }) {
  const messages = Array.isArray(feedback?.messages) ? feedback.messages : [];
  if (!messages.length) return { recorded: 0 };

  const store = getStore();
  const session = await store.createSession({
    user_id: userId,
    mode: `conversation:${personaSlug || 'chat'}`,
  });

  let recorded = 0;
  let withIssues = 0;
  for (const m of messages) {
    const issues = Array.isArray(m.issues) ? m.issues : [];
    const correct = !m.hasIssues || issues.length === 0;
    const errorTags = correct ? [] : unique(issues.map((i) => mapIssue(i.type).errorTag));
    const skillTags = correct ? [] : unique(issues.map((i) => mapIssue(i.type).skill).filter(Boolean));

    await store.insertAttempt({
      session_id: session.id,
      user_id: userId,
      exercise_id: null,
      answer: String(m.original ?? ''),
      correct,
      response_ms: null,
      error_tags: errorTags,
      skill_tags: skillTags,
      exercise_type: 'conversation',
    });
    await store.incrementSession(session.id, { correct });

    // Mastery moves only on a miss with a concrete skill (we can't credit a
    // clean message to a specific skill the evaluator didn't name).
    if (!correct && skillTags.length) {
      await recordMasteryAttempt({ userId, skillTags, correct: false });
    }
    recorded += 1;
    if (!correct) withIssues += 1;
  }
  return { recorded, withIssues, sessionId: session.id };
}

function unique(arr) {
  return [...new Set(arr)];
}

export const _internals = { ISSUE_MAP, mapIssue };
