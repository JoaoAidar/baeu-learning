import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set. Set it (Neon connection string) and retry.');
    process.exit(1);
  }
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');

  const client = new Client({
    connectionString: url,
    ssl: url.includes('sslmode=') ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log('migrations applied');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
