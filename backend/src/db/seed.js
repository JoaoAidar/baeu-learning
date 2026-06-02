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

// Resolve generated content to insertable rows, skipping any prompt already in
// `seenPrompts` and any prompt repeated within the batch (a few overlap between
// the patterns/reading generators). Mutates `seenPrompts`.
function resolveItems(slugToId, seenPrompts) {
  const items = [];
  for (const it of buildTopik1Content()) {
    if (seenPrompts.has(it.prompt)) continue;
    seenPrompts.add(it.prompt);
    items.push({
      ...it,
      module_id: it.module_slug ? slugToId.get(it.module_slug) || null : null,
    });
  }
  return items;
}

export async function runSeedIfEmpty() {
  const store = getStore();
  const slugToId = await ensureModules(store);
  await ensureLessons(store, slugToId);

  const existing = await store.listPublishedExercises();
  if (existing.length) return existing;

  const items = resolveItems(slugToId, new Set());
  return store.insertExercises(items);
}

// Additive, idempotent seed: inserts only generated exercises whose prompt is
// not already in the store. Lets the code stay the content source of truth and
// push new exercises to an already-populated prod DB WITHOUT wiping anything.
export async function seedNewExercises() {
  const store = getStore();
  const slugToId = await ensureModules(store);
  await ensureLessons(store, slugToId);

  const seenPrompts = new Set(await store.listExercisePrompts());
  const items = resolveItems(slugToId, seenPrompts);
  if (!items.length) return [];
  return store.insertExercises(items);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const additive = process.argv.includes('--new');
  const run = additive ? seedNewExercises : runSeedIfEmpty;
  run()
    .then((rows) => {
      const verb = additive ? 'added' : 'seeded';
      console.log(`${verb} ${rows.length} exercises (store=${getStore().__mode})`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
