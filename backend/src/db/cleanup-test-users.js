import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const DEFAULT_PATTERN = 'audit-%@test.local';

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
      'cleanup-test-users — delete synthetic learner accounts from the Better Auth user table.',
      '',
      'Usage:',
      '  DATABASE_URL=... node src/db/cleanup-test-users.js [--pattern=...] [--apply]',
      '',
      'Defaults to dry-run with pattern "audit-%@test.local".',
      'Practice sessions/attempts/mastery and Better Auth session/account rows',
      'cascade automatically (ON DELETE CASCADE).',
      '',
      'Examples:',
      '  node src/db/cleanup-test-users.js',
      '  node src/db/cleanup-test-users.js --pattern=audit-%@test.local',
      '  node src/db/cleanup-test-users.js --pattern=audit-%@test.local --apply',
    ].join('\n')
  );
}

// Fail-closed pattern guard. Must:
//   1. start with literal "audit-"
//   2. contain "@test.local"
//   3. not be a bare "%" or otherwise wildcard-dominated
// Test scenarios that must REFUSE (return false):
//   - "%"                                  (bare wildcard)
//   - "%@test.local"                       (no audit- prefix)
//   - "admin%@test.local"                  (no audit- prefix)
//   - "audit-%"                            (no @test.local domain)
//   - "audit-%@example.com"                (wrong domain)
// Scenarios that must ACCEPT (return true):
//   - "audit-%@test.local"
//   - "audit-2025-%@test.local"
export function isPatternAllowed(pattern) {
  if (typeof pattern !== 'string') return false;
  if (pattern === '%' || pattern === '') return false;
  if (!pattern.startsWith('audit-')) return false;
  if (!pattern.includes('@test.local')) return false;
  return true;
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
  if (!isPatternAllowed(args.pattern)) {
    console.error(
      `Refusing pattern "${args.pattern}" — must contain "@test.local" AND start with "audit-".`
    );
    process.exit(2);
  }

  const client = new Client({
    connectionString: url,
    ssl: url.includes('sslmode=') ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    // Better Auth's user table: text id, `name` instead of `display_name`,
    // and `createdAt` (camelCase, quoted). Role lives in user_role.
    const { rows } = await client.query(
      `select u.id,
              u.email,
              u."createdAt" as created_at,
              coalesce(r.role, 'user') as role
         from "user" u
         left join user_role r on r.user_id = u.id
        where u.email ilike $1
        order by u."createdAt" asc`,
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
      const created = r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at);
      console.log(`  ${maskEmail(r.email)}  created=${created}`);
    }

    if (!args.apply) {
      console.log('\nDry-run only. Pass --apply to delete.');
      return;
    }

    const ids = rows.map((r) => r.id);
    const res = await client.query(`delete from "user" where id = any($1::text[])`, [ids]);
    console.log(`\nDeleted ${res.rowCount} user(s) and cascaded their practice + auth data.`);
  } finally {
    await client.end();
  }
}

// Only run the CLI when this file is executed directly, not when imported by tests.
const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  import.meta.url === `file://${process.argv[1]}`;

if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
