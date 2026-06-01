// ⚠️ DESTRUCTIVE full reset. Drops the legacy/practice tables (DELETING ALL
// PRACTICE HISTORY) then re-applies schema.sql to recreate everything empty.
//
// Guarded twice: requires CONFIRM_DESTRUCTIVE_RESET=1 AND is never invoked by
// deploy (which runs `npm start`). For normal schema changes use the safe,
// idempotent `npm run migrate`.
//
//   DATABASE_URL=... CONFIRM_DESTRUCTIVE_RESET=1 npm run migrate:reset
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { buildPgSslConfig } from './ssl.js';

const { Client } = pg;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set. Set it (Neon connection string) and retry.');
    process.exit(1);
  }
  if (process.env.CONFIRM_DESTRUCTIVE_RESET !== '1') {
    console.error(
      'Refusing to run: this DROPS all practice history.\n' +
        'If you really mean it, set CONFIRM_DESTRUCTIVE_RESET=1 and re-run.\n' +
        'For normal schema changes use `npm run migrate` (safe/idempotent).'
    );
    process.exit(1);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const resetSql = await fs.readFile(path.join(__dirname, 'reset-legacy.sql'), 'utf8');
  const schemaSql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');

  const client = new Client({
    connectionString: url,
    ssl: buildPgSslConfig(url, { requireInProduction: true, label: 'reset migration db' }),
  });
  await client.connect();
  try {
    await client.query(resetSql);
    console.log('destructive reset applied (legacy + practice tables dropped)');
    await client.query(schemaSql);
    console.log('schema re-applied (empty tables recreated)');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
