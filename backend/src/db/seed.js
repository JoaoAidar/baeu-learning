import 'dotenv/config';
import { getStore } from '../config/db.js';
import { buildTopik1Content } from './topik1Content.js';

export function buildSampleExercises() {
  return buildTopik1Content();
}

// Kept for tests that imported the old constant. Stable subset.
export const SAMPLE_EXERCISES = buildSampleExercises().slice(0, 6);

export async function runSeedIfEmpty() {
  const store = getStore();
  const existing = await store.listPublishedExercises();
  if (existing.length) return existing;
  return store.insertExercises(buildSampleExercises());
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
