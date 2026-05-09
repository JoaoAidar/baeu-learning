import { getStore } from '../config/db.js';
import { getMasteryMap } from '../services/MasteryService.js';

const wrap = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'internal_error' }); }
};

export const list = wrap(async (req) => {
  const store = getStore();
  const [modules, counts] = await Promise.all([
    store.listModules(),
    store.countPublishedByModule(),
  ]);

  // If authenticated, also include per-module mastery summary
  let masteryMap = null;
  if (req.userId) {
    masteryMap = await getMasteryMap(req.userId);
  }

  return {
    modules: modules.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      description: m.description,
      icon: m.icon,
      order_index: m.order_index,
      exercise_count: counts[m.id] || 0,
      // mastery hint: how many tracked skills the user has touched in this module's space
      // (cheap heuristic — full mastery view lives on /progress)
      practiced: masteryMap ? sumPracticedInModule(masteryMap, m) : null,
    })),
    total_published: Object.values(counts).reduce((a, b) => a + b, 0),
  };
});

export const get = wrap(async (req) => {
  const store = getStore();
  const mod = await store.getModuleBySlug(req.params.slug);
  if (!mod) { const e = new Error('module_not_found'); e.status = 404; throw e; }
  const exercises = await store.listPublishedExercises({ moduleId: mod.id });
  return {
    module: { ...mod, exercise_count: exercises.length },
    sample_skill_tags: aggregateSkills(exercises).slice(0, 12),
  };
});

function sumPracticedInModule(masteryMap, mod) {
  // Without a join we can't know exactly which mastery rows belong to which module.
  // Return total tracked skills as a coarse signal — UI just shows "in progress" if > 0.
  return masteryMap.size;
}

function aggregateSkills(exs) {
  const counts = new Map();
  for (const e of exs) for (const t of e.skill_tags || []) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([skill, n]) => ({ skill, count: n }));
}
