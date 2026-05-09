import * as Lessons from '../services/LessonsService.js';

const wrap = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'internal_error' }); }
};

export const list = wrap((req) => Lessons.listLessons({ moduleSlug: req.query.module || null }));
export const get  = wrap((req) => Lessons.getLesson({ slug: req.params.slug }));
