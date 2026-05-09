import { getStore } from '../config/db.js';

export async function listLessons({ moduleSlug = null } = {}) {
  const store = getStore();
  let moduleId = null;
  if (moduleSlug) {
    const m = await store.getModuleBySlug(moduleSlug);
    if (!m) return { lessons: [] };
    moduleId = m.id;
  }
  const rows = await store.listLessons({ moduleId });
  return {
    lessons: rows.map(publicLessonShape),
  };
}

export async function getLesson({ slug }) {
  const store = getStore();
  const row = await store.getLessonBySlug(slug);
  if (!row) {
    const e = new Error('lesson_not_found'); e.status = 404; throw e;
  }
  return { lesson: { ...publicLessonShape(row), body_md: row.body_md } };
}

export async function findLessonForErrorTag(errorTag) {
  if (!errorTag) return null;
  const store = getStore();
  const row = await store.findLessonForErrorTag(errorTag);
  return row ? publicLessonShape(row) : null;
}

function publicLessonShape(l) {
  return {
    id: l.id,
    slug: l.slug,
    module_id: l.module_id,
    title: l.title,
    summary: l.summary,
    related_error_tags: l.related_error_tags || [],
    related_skill_tags: l.related_skill_tags || [],
    order_index: l.order_index,
  };
}
