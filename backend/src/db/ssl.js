export function buildPgSslConfig(connectionString, { requireInProduction = false, label = 'postgres' } = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  const hasSslMode =
    typeof connectionString === 'string' && /(?:[?&])sslmode=/.test(connectionString);

  if (isProd && requireInProduction && !hasSslMode) {
    throw new Error(
      `${label}: DATABASE_URL must include sslmode=require (or stricter) in production.`
    );
  }

  return hasSslMode ? undefined : { rejectUnauthorized: false };
}
