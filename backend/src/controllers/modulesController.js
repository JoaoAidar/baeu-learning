import { getStore } from '../config/db.js';
import { getMasteryMap } from '../services/MasteryService.js'; // fallback path only

// Error propagation handled by global error handler in app.js.

export const list = async (req, res, next) => {
 try {
  const store = getStore();
  const modules =
    typeof store.listModulesWithPublishedCounts === 'function'
      ? await store.listModulesWithPublishedCounts()
      : await store.listModules();
  const counts =
    typeof store.listModulesWithPublishedCounts === 'function'
      ? Object.fromEntries(modules.map((m) => [m.id, m.exercise_count || 0]))
      : await store.countPublishedByModule();

  // If authenticated, also include per-module mastery summary.
  // Count distinct mastered skills that overlap each module's exercise skill_tags.
  let practicedByModule = null;
  if (req.userId) {
    practicedByModule = {};
    if (typeof store.countMasteredSkillsInModule === 'function') {
      await Promise.all(
        modules.map(async (m) => {
          practicedByModule[m.id] = await store.countMasteredSkillsInModule(req.userId, m.id);
        })
      );
    } else {
      // safety fallback: total tracked skills (legacy behavior)
      const masteryMap = await getMasteryMap(req.userId);
      for (const m of modules) practicedByModule[m.id] = masteryMap.size;
    }
  }

  res.json({
    modules: modules.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      description: m.description,
      icon: m.icon,
      order_index: m.order_index,
      exercise_count: counts[m.id] || 0,
      practiced: practicedByModule ? practicedByModule[m.id] || 0 : null,
    })),
    total_published: Object.values(counts).reduce((a, b) => a + b, 0),
  });
 } catch (err) { next(err); }
};

export const get = async (req, res, next) => {
  try {
    const store = getStore();
    const mod = await store.getModuleBySlug(req.params.slug);
    if (!mod) { const e = new Error('module_not_found'); e.status = 404; throw e; }
    const exercises = await store.listPublishedExercises({ moduleId: mod.id });
    res.json({
      module: { ...mod, exercise_count: exercises.length },
      sample_skill_tags: aggregateSkills(exercises).slice(0, 12),
    });
  } catch (err) { next(err); }
};

function aggregateSkills(exs) {
  const counts = new Map();
  for (const e of exs) for (const t of e.skill_tags || []) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([skill, n]) => ({ skill, count: n }));
}
