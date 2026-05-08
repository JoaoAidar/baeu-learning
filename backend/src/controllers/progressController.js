import * as Progress from '../services/ProgressService.js';

const wrap = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'internal_error' });
  }
};

export const overview = wrap((req) => Progress.overview({ userId: req.userId }));
export const skills = wrap((req) => Progress.skills({ userId: req.userId }));
