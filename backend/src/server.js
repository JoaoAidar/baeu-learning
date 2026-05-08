import 'dotenv/config';
import { createApp } from './app.js';
import { getStore } from './config/db.js';
import { runSeedIfEmpty } from './db/seed.js';

const port = Number(process.env.PORT) || 3001;
const app = createApp();
const store = getStore();

if (store.__mode === 'memory') {
  await runSeedIfEmpty();
  console.log('[baeu] in-memory store seeded');
}

const server = app.listen(port, () => {
  console.log(`[baeu] listening on :${port} (store=${store.__mode})`);
});

const shutdown = async (signal) => {
  console.log(`[baeu] ${signal} received, shutting down`);
  server.close(() => process.exit(0));
  if (store.end) await store.end().catch(() => {});
  setTimeout(() => process.exit(1), 5000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
