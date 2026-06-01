// Additive, NON-destructive migration for the per-item SRS table.
//
// IMPORTANT: do NOT run `npm run migrate` (schema.sql) against a database that
// has real practice data — it drops/recreates the practice tables. This script
// only creates user_exercise_srs and its index, so it is safe to run on prod.
//
//   DATABASE_URL=... npm run migrate:srs
import 'dotenv/config';
import pg from 'pg';
import { buildPgSslConfig } from './ssl.js';

const { Client } = pg;

const DDL = `
create table if not exists user_exercise_srs (
  user_id text not null references "user"(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  ease real not null default 2.5,
  interval_days real not null default 0,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  due_at timestamptz not null default now(),
  last_grade integer,
  last_reviewed_at timestamptz default now(),
  primary key (user_id, exercise_id)
);
create index if not exists user_exercise_srs_due_idx
  on user_exercise_srs(user_id, due_at);
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set. Set it (Neon connection string) and retry.');
    process.exit(1);
  }
  const client = new Client({
    connectionString: url,
    ssl: buildPgSslConfig(url, { requireInProduction: true, label: 'srs migration db' }),
  });
  await client.connect();
  try {
    await client.query(DDL);
    console.log('srs migration applied (user_exercise_srs ready)');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
