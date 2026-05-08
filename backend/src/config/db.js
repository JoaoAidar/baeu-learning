import { memoryStore } from '../repositories/memoryStore.js';
import { createPgStore } from '../repositories/pgStore.js';

let activeStore = null;

export function getStore() {
  if (activeStore) return activeStore;
  const url = process.env.DATABASE_URL;
  if (url) {
    activeStore = createPgStore({ connectionString: url });
  } else {
    activeStore = memoryStore;
  }
  return activeStore;
}

export function resetStoreForTests(store) {
  activeStore = store;
}
