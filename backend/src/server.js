import 'dotenv/config';
import { createApp } from './app.js';
import { getStore } from './config/db.js';
import { runSeedIfEmpty } from './db/seed.js';

const port = Number(process.env.PORT) || 3001;

// Production env-var validation. Fail-closed: refuse to boot if any of the
// auth-critical knobs are missing. Dev/test stay permissive so contributors
// can spin the server up without configuring everything.
if (process.env.NODE_ENV === 'production') {
  const required = ['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(
      `[baeu] FATAL: missing required env vars in production: ${missing.join(', ')}.`
    );
    process.exit(1);
  }
  // Google OAuth is optional; warn if only one half is set (config typo).
  const gid = process.env.GOOGLE_CLIENT_ID;
  const gsec = process.env.GOOGLE_CLIENT_SECRET;
  if ((gid && !gsec) || (!gid && gsec)) {
    console.error(
      '[baeu] FATAL: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET must be set together.'
    );
    process.exit(1);
  }
}

const app = createApp();
const store = getStore();

// Refuse to boot in production with the in-memory fallback store.
if (process.env.NODE_ENV === 'production' && store.__mode === 'memory') {
  console.error(
    '[baeu] FATAL: refusing to start in production with in-memory store. ' +
      'Set DATABASE_URL to a Postgres instance.'
  );
  process.exit(1);
}

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
