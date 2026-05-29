import * as Practice from '../services/PracticeService.js';

// Error propagation handled by global error handler in app.js.

export const startSession = async (req, res, next) => {
  try {
    const moduleSlug = req.body?.moduleSlug || req.query?.moduleSlug || null;
    res.json(await Practice.startSession({ userId: req.userId, moduleSlug }));
  } catch (err) {
    next(err);
  }
};

export const nextQuestion = async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId;
    if (!sessionId) {
      const e = new Error('missing_sessionId'); e.status = 400; throw e;
    }
    const focus = req.query.focus === 'weak' ? 'weak' : null;
    res.json(await Practice.nextQuestion({ sessionId, userId: req.userId, focus }));
  } catch (err) {
    next(err);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, exerciseId, answer, responseMs } = req.body || {};
    if (!sessionId || !exerciseId) {
      const e = new Error('missing_fields'); e.status = 400; throw e;
    }
    res.json(await Practice.submitAnswer({ sessionId, userId: req.userId, exerciseId, answer, responseMs }));
  } catch (err) {
    next(err);
  }
};

export const sessionSummary = async (req, res, next) => {
  try {
    res.json(await Practice.sessionSummary({ sessionId: req.params.id, userId: req.userId }));
  } catch (err) {
    next(err);
  }
};
