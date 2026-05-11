import * as Lessons from '../services/LessonsService.js';

// Error propagation handled by global error handler in app.js.
export const list = async (req, res, next) => {
  try {
    res.json(await Lessons.listLessons({ moduleSlug: req.query.module || null }));
  } catch (err) {
    next(err);
  }
};

export const get = async (req, res, next) => {
  try {
    res.json(await Lessons.getLesson({ slug: req.params.slug }));
  } catch (err) {
    next(err);
  }
};
