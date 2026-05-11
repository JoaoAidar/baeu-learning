import * as Progress from '../services/ProgressService.js';

// Error propagation is handled by the global error handler in app.js.
// Controllers just resolve service calls; throws bubble up via next(err).
export const overview = async (req, res, next) => {
  try {
    res.json(await Progress.overview({ userId: req.userId }));
  } catch (err) {
    next(err);
  }
};

export const skills = async (req, res, next) => {
  try {
    res.json(await Progress.skills({ userId: req.userId }));
  } catch (err) {
    next(err);
  }
};
