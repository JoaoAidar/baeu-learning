import * as Practice from '../services/PracticeService.js';

const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'internal_error' });
  }
};

export const startSession = handle(async (req) => {
  const moduleSlug = req.body?.moduleSlug || req.query?.moduleSlug || null;
  return Practice.startSession({ userId: req.userId, moduleSlug });
});

export const nextQuestion = handle(async (req) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    const e = new Error('missing_sessionId'); e.status = 400; throw e;
  }
  const focus = req.query.focus === 'weak' ? 'weak' : null;
  return Practice.nextQuestion({ sessionId, focus });
});

export const submitAnswer = handle(async (req) => {
  const { sessionId, exerciseId, answer, responseMs } = req.body || {};
  if (!sessionId || !exerciseId) {
    const e = new Error('missing_fields'); e.status = 400; throw e;
  }
  return Practice.submitAnswer({ sessionId, exerciseId, answer, responseMs });
});

export const sessionSummary = handle(async (req) => {
  return Practice.sessionSummary({ sessionId: req.params.id });
});
