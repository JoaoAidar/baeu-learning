import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const DEFAULT_PATTERN = '%@test.local';

function parseArgs(argv) {
  const args = { pattern: DEFAULT_PATTERN, apply: false };
  for (const a of argv.slice(2)) {
    if (a === '--apply') args.apply = true;
    else if (a.startsWith('--pattern=')) args.pattern = a.slice('--pattern='.length);
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.log(
    [
      'cleanup-test-users — delete synthetic learner accounts from the users table.',
      '',
      'Usage:',
      '  DATABASE_URL=... node src/db/cleanup-test-users.js [--pattern=...] [--apply]',
      '',
      'Defaults to dry-run with pattern "%@test.local".',
      'Practice sessions/attempts/mastery cascade automatically (ON DELETE CASCADE).',
      '',
      'Examples:',
      '  node src/db/cleanup-test-users.js',
      '  node src/db/cleanup-test-users.js --pattern=audit-%@test.local',
      '  node src/db/cleanup-test-users.js --pattern=audit-%@test.local --apply',
    ].join('\n')
  );
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const head = local.slice(0, 3);
  return `${head}${'*'.repeat(Math.max(1, local.length - 3))}@${domain}`;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return usage();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set.');
    process.exit(1);
  }
  if (!args.pattern.includes('@test.local') && !args.pattern.includes('audit-')) {
    console.error(
      `Refusing pattern "${args.pattern}" — must match @test.local or start with audit-.`
    );
    process.exit(2);
  }

  const client = new Client({
    connectionString: url,
    ssl: url.includes('sslmode=') ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const { rows } = await client.query(
      `select id, email, created_at, role
         from users
        where email ilike $1
        order by created_at asc`,
      [args.pattern]
    );

    if (rows.length === 0) {
      console.log(`No users match pattern "${args.pattern}".`);
      return;
    }

    const nonUserRoles = rows.filter((r) => r.role !== 'user');
    if (nonUserRoles.length > 0) {
      console.error(
        `Refusing: ${nonUserRoles.length} matching row(s) have role != 'user'. Aborting.`
      );
      process.exit(3);
    }

    console.log(`Matched ${rows.length} synthetic account(s) for pattern "${args.pattern}":`);
    for (const r of rows) {
      console.log(`  ${maskEmail(r.email)}  created=${r.created_at.toISOString()}`);
    }

    if (!args.apply) {
      console.log('\nDry-run only. Pass --apply to delete.');
      return;
    }

    const ids = rows.map((r) => r.id);
    const res = await client.query(`delete from users where id = any($1::uuid[])`, [ids]);
    console.log(`\nDeleted ${res.rowCount} user(s) and cascaded their practice data.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
