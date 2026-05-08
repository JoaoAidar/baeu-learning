import * as Admin from '../services/AdminService.js';
import { getStore } from '../config/db.js';
import { classifyAnswer } from '../services/ErrorClassifier.js';

const wrap = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'internal_error' });
  }
};

export const importExercises = wrap((req) =>
  Admin.importExercises(req.body, { createdBy: req.userId || null })
);

export const generateExercises = wrap(async (req) => {
  const {
    topic,
    count,
    difficulty,
    types,
    promptLocale,
    extra,
    autoPublish,
  } = req.body || {};
  return Admin.generateAndImport({
    topic,
    count,
    difficulty,
    types,
    promptLocale,
    extra,
    autoPublish,
    createdBy: req.userId || null,
  });
});

export const listExercisesAdmin = wrap(async (req) => {
  const status = req.query.status || null;
  const rows = await Admin.listExercisesByStatus(status);
  return { exercises: rows };
});

export const setExerciseStatus = wrap((req) =>
  Admin.setExerciseStatus({ id: req.params.id, status: req.body?.status })
);

export const recentAttempts = wrap(async (req) => {
  const store = getStore();
  const wrongOnly = req.query.wrongOnly !== 'false';
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const attempts = await store.listRecentAttemptsAdmin({ wrongOnly, limit });
  // Enrich with exercise context + dry-run reclassification (so admin can spot drift)
  const enriched = await Promise.all(
    attempts.map(async (a) => {
      const exercise = await store.getExercise(a.exercise_id);
      let reclassified = null;
      if (exercise) {
        const r = classifyAnswer(exercise, a.answer);
        reclassified = {
          correct: r.correct,
          errorTags: r.errorTags,
          expected: r.expected,
        };
      }
      const driftedTags =
        reclassified &&
        JSON.stringify([...(a.error_tags || [])].sort()) !==
          JSON.stringify([...reclassified.errorTags].sort());
      return {
        id: a.id,
        created_at: a.created_at,
        user_id: a.user_id,
        answer: a.answer,
        correct: a.correct,
        error_tags: a.error_tags || [],
        skill_tags: a.skill_tags || [],
        exercise: exercise && {
          id: exercise.id,
          type: exercise.type,
          prompt: exercise.prompt,
          correct_answer: exercise.correct_answer,
          accepted_answers: exercise.accepted_answers,
          skill_tags: exercise.skill_tags,
        },
        reclassified,
        drifted_tags: driftedTags || false,
      };
    })
  );
  return { attempts: enriched };
});

export async function listExercises(_req, res) {
  try {
    const rows = await getStore().listPublishedExercises();
    res.json({ exercises: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'internal_error' });
  }
}
