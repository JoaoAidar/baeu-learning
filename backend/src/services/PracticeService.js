import { getStore } from '../config/db.js';
import { classifyAnswer } from './ErrorClassifier.js';
import { selectNext } from './ExerciseSelector.js';
import { recordAttempt as recordMasteryAttempt, getMasteryMap } from './MasteryService.js';
import { findLessonForErrorTag } from './LessonsService.js';

// Auto-recommend a lesson when the same error_tag fires this many times in
// the last RECENT_WINDOW attempts of the current session. Tuned conservatively
// so we don't push lessons on every mistake.
const LESSON_TRIGGER_THRESHOLD = 3;
const RECENT_WINDOW = 10;

const CHECKPOINT_EVERY = 10;

export async function startSession({ userId, moduleSlug = null }) {
  const store = getStore();
  let moduleId = null;
  if (moduleSlug) {
    const mod = await store.getModuleBySlug(moduleSlug);
    if (!mod) throw httpError(404, 'module_not_found');
    moduleId = mod.id;
  }
  const session = await store.createSession({
    user_id: userId,
    mode: moduleSlug ? `endless:${moduleSlug}` : 'endless',
  });
  // Attach module_id for selector use
  return { ...session, module_id: moduleId, module_slug: moduleSlug };
}

export async function nextQuestion({ sessionId, focus = null }) {
  const store = getStore();
  const session = await store.getSession(sessionId);
  if (!session) throw httpError(404, 'session_not_found');

  // Parse module slug from session.mode (e.g. "endless:greetings")
  let moduleId = null;
  if (session.mode && session.mode.startsWith('endless:')) {
    const slug = session.mode.slice('endless:'.length);
    const mod = await store.getModuleBySlug(slug);
    if (mod) moduleId = mod.id;
  }

  const [exercises, sessionAttempts, recentAttempts, masteryMap] = await Promise.all([
    store.listPublishedExercises({ moduleId }),
    store.listAttemptsForSession(sessionId),
    store.listAttemptsForUser(session.user_id, { limit: 100 }),
    getMasteryMap(session.user_id),
  ]);
  if (!exercises.length) {
    throw httpError(409, moduleId ? 'no_exercises_in_module' : 'no_published_exercises');
  }
  const ex = selectNext({ exercises, recentAttempts, sessionAttempts, masteryMap, focus });
  return publicExerciseShape(ex);
}

export async function submitAnswer({ sessionId, exerciseId, answer, responseMs }) {
  const store = getStore();
  const session = await store.getSession(sessionId);
  if (!session) throw httpError(404, 'session_not_found');
  const exercise = await store.getExercise(exerciseId);
  if (!exercise) throw httpError(404, 'exercise_not_found');

  const { correct, errorTags, skillTags, expected } = classifyAnswer(exercise, answer);

  let attempt;
  try {
    attempt = await store.insertAttempt({
      session_id: sessionId,
      user_id: session.user_id,
      exercise_id: exerciseId,
      answer: String(answer ?? ''),
      correct,
      response_ms: Number.isFinite(responseMs) ? responseMs : null,
      error_tags: errorTags,
      skill_tags: skillTags,
    });
  } catch (err) {
    // Postgres unique_violation OR memory-store synthetic duplicate marker.
    // The partial unique index on (session_id, exercise_id, response_ms)
    // catches double-tap submits within milliseconds; surface as 409 so the
    // client sees a clean code instead of a 500.
    if (err && (err.code === '23505' || err.code === 'duplicate_submit')) {
      throw httpError(409, 'duplicate_submit');
    }
    throw err;
  }

  const updated = await store.incrementSession(sessionId, { correct });

  await recordMasteryAttempt({
    userId: session.user_id,
    skillTags,
    correct,
  });

  const reachedCheckpoint =
    updated.total_attempts > 0 && updated.total_attempts % CHECKPOINT_EVERY === 0;

  let checkpoint = null;
  if (reachedCheckpoint) {
    const recent = await store.listAttemptsForSession(sessionId);
    const lastTen = recent.slice(-CHECKPOINT_EVERY);
    checkpoint = summarizeWindow(lastTen);
  }

  // Auto-recommend a grammar lesson if the learner just hit the threshold
  // for any error_tag in the recent session window. We only fire on a wrong
  // answer and only if the tag has reached the threshold *exactly now* —
  // otherwise we'd nag every wrong answer afterwards.
  let recommendedLesson = null;
  if (!correct && errorTags.length) {
    const sessionAttempts = await store.listAttemptsForSession(sessionId);
    const window = sessionAttempts.slice(-RECENT_WINDOW);
    const tagCounts = {};
    for (const a of window) {
      for (const t of a.error_tags || []) tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
    // Only emit when the *current* error contributed to crossing the threshold
    // (avoid spamming on follow-up wrong answers tagged the same).
    const triggeringTag = errorTags.find(
      (t) => tagCounts[t] === LESSON_TRIGGER_THRESHOLD
    );
    if (triggeringTag) {
      recommendedLesson = await findLessonForErrorTag(triggeringTag);
      if (recommendedLesson) {
        recommendedLesson = {
          ...recommendedLesson,
          reason: `${tagCounts[triggeringTag]} recent misses tagged "${triggeringTag}".`,
          triggering_tag: triggeringTag,
        };
      }
    }
  }

  return {
    attemptId: attempt.id,
    correct,
    expectedAnswer: expected,
    explanation: exercise.explanation || '',
    errorTags,
    skillTags,
    sessionScore: {
      total: updated.total_attempts,
      correct: updated.correct_attempts,
      accuracy: updated.total_attempts
        ? updated.correct_attempts / updated.total_attempts
        : 0,
    },
    checkpoint,
    recommendedLesson,
  };
}

export async function sessionSummary({ sessionId }) {
  const store = getStore();
  const session = await store.getSession(sessionId);
  if (!session) throw httpError(404, 'session_not_found');
  const attempts = await store.listAttemptsForSession(sessionId);

  const errorTagCounts = countTags(attempts, 'error_tags', { onlyWrong: true });
  const skillCounts = countTags(attempts, 'skill_tags');
  const weakSkills = topWeakSkills(attempts);

  return {
    sessionId,
    userId: session.user_id,
    total: session.total_attempts,
    correct: session.correct_attempts,
    accuracy: session.total_attempts
      ? session.correct_attempts / session.total_attempts
      : 0,
    errorTagCounts,
    skillCounts,
    recommendations: buildRecommendations(errorTagCounts, weakSkills),
  };
}

function summarizeWindow(attempts) {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  return {
    windowSize: total,
    correct,
    accuracy: total ? correct / total : 0,
    errorTagCounts: countTags(attempts, 'error_tags', { onlyWrong: true }),
    weakSkills: topWeakSkills(attempts),
  };
}

function countTags(attempts, field, { onlyWrong = false } = {}) {
  const out = {};
  for (const a of attempts) {
    if (onlyWrong && a.correct) continue;
    for (const t of a[field] || []) {
      out[t] = (out[t] || 0) + 1;
    }
  }
  return out;
}

function topWeakSkills(attempts) {
  const counts = {};
  for (const a of attempts) {
    if (a.correct) continue;
    for (const s of a.skill_tags || []) counts[s] = (counts[s] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill, count]) => ({ skill, count }));
}

function buildRecommendations(errorTagCounts, weakSkills) {
  const recs = [];
  const top = Object.entries(errorTagCounts).sort((a, b) => b[1] - a[1])[0];
  if (top) recs.push(`Focus on ${humanTag(top[0])} (${top[1]} miss${top[1] > 1 ? 'es' : ''}).`);
  for (const ws of weakSkills) {
    recs.push(`Review the "${ws.skill}" skill — ${ws.count} miss${ws.count > 1 ? 'es' : ''}.`);
  }
  if (!recs.length) recs.push('Strong session. Try harder difficulty next round.');
  return recs;
}

const TAG_LABELS = {
  vocabulary: 'vocabulary',
  particle: 'particles (은/는, 이/가, 을/를)',
  word_order: 'word order',
  verb_conjugation: 'verb conjugation',
  honorific_formality: 'formality / honorifics',
  hangul_reading: 'reading Hangul',
  spacing: 'spacing',
  romanization_dependency: 'writing in Hangul (avoid romanization)',
  unknown: 'this question type',
};

function humanTag(t) {
  return TAG_LABELS[t] || t;
}

function publicExerciseShape(ex) {
  return {
    id: ex.id,
    type: ex.type,
    difficulty: ex.difficulty,
    prompt: ex.prompt,
    options: ex.options || [],
    skill_tags: ex.skill_tags || [],
    metadata: ex.metadata || {},
  };
}

function httpError(status, code) {
  const e = new Error(code);
  e.status = status;
  return e;
}
