import 'dotenv/config';
import { getStore } from '../config/db.js';
import { buildTopik1Content } from './topik1Content.js';
import { MODULES } from './modules.js';
import { LESSONS } from './grammarLessons.js';

export function buildSampleExercises() {
  return buildTopik1Content();
}

// Stable mixed subset for unit tests — guarantees at least one of each type.
export const SAMPLE_EXERCISES = (() => {
  const all = buildTopik1Content();
  const picked = [];
  const want = ['multiple_choice', 'translation', 'fill_blank'];
  for (const t of want) {
    const ex = all.find((x) => x.type === t);
    if (ex) picked.push(ex);
  }
  for (const ex of all) {
    if (picked.length >= 6) break;
    if (!picked.includes(ex)) picked.push(ex);
  }
  return picked;
})();

async function ensureModules(store) {
  const slugToId = new Map();
  for (const m of MODULES) {
    const row = await store.upsertModule(m);
    slugToId.set(row.slug, row.id);
  }
  return slugToId;
}

async function ensureLessons(store, slugToModuleId) {
  for (const l of LESSONS) {
    await store.upsertLesson({
      ...l,
      module_id: l.module_slug ? slugToModuleId.get(l.module_slug) || null : null,
    });
  }
}

export async function runSeedIfEmpty() {
  const store = getStore();
  const slugToId = await ensureModules(store);
  await ensureLessons(store, slugToId);

  const existing = await store.listPublishedExercises();
  if (existing.length) return existing;

  const items = buildTopik1Content().map((it) => ({
    ...it,
    module_id: it.module_slug ? slugToId.get(it.module_slug) || null : null,
  }));
  return store.insertExercises(items);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeedIfEmpty()
    .then((rows) => {
      console.log(`seeded ${rows.length} exercises (store=${getStore().__mode})`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
