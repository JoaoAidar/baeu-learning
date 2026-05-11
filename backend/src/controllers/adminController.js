import * as Admin from '../services/AdminService.js';
import { getStore } from '../config/db.js';
import { classifyAnswer } from '../services/ErrorClassifier.js';

// Error propagation handled by global error handler in app.js.
// All thrown errors here/in services either use httpError(status, code) with
// .code set (LLMGenerator) or set .status with a short string message that's
// safe to surface for 4xx. 5xx without .code becomes 'internal_error'.

export const importExercises = async (req, res, next) => {
  try {
    res.json(
      await Admin.importExercises(req.body, { createdBy: req.userId || null })
    );
  } catch (err) {
    next(err);
  }
};

export const generateExercises = async (req, res, next) => {
  try {
    const {
      topic,
      count,
      difficulty,
      types,
      promptLocale,
      extra,
      autoPublish,
    } = req.body || {};
    res.json(
      await Admin.generateAndImport({
        topic,
        count,
        difficulty,
        types,
        promptLocale,
        extra,
        autoPublish,
        createdBy: req.userId || null,
      })
    );
  } catch (err) {
    next(err);
  }
};

export const listExercisesAdmin = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const rows = await Admin.listExercisesByStatus(status);
    res.json({ exercises: rows });
  } catch (err) {
    next(err);
  }
};

export const setExerciseStatus = async (req, res, next) => {
  try {
    res.json(
      await Admin.setExerciseStatus({ id: req.params.id, status: req.body?.status })
    );
  } catch (err) {
    next(err);
  }
};

export const recentAttempts = async (req, res, next) => {
  try {
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
    res.json({ attempts: enriched });
  } catch (err) {
    next(err);
  }
};

export async function listExercises(_req, res, next) {
  try {
    const rows = await getStore().listPublishedExercises();
    res.json({ exercises: rows });
  } catch (err) {
    next(err);
  }
}
