// Polyfill globalThis.crypto for environments where Web Crypto isn't exposed
// as a global (older Node, certain runtime configs). Better Auth's id generator
// calls `crypto.getRandomValues`, which throws ReferenceError without this.
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import { betterAuth } from 'better-auth';
import pg from 'pg';

const { Pool } = pg;

const isProd = process.env.NODE_ENV === 'production';

// Lazily-built singleton so the module can be imported in tests/scripts
// without requiring DATABASE_URL to be set at import time.
let _auth = null;

function buildPool() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const hasSslMode = url.includes('sslmode=');
  return new Pool({
    connectionString: url,
    ssl: hasSslMode ? undefined : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

function buildAuth() {
  const trustedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const socialProviders =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined;

  const config = {
    // When DATABASE_URL is absent (in-memory dev/tests), Better Auth falls back
    // to an internal memory adapter. Production cannot reach this branch because
    // server.js refuses to boot with __mode='memory'.
    ...(buildPool() ? { database: buildPool() } : {}),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url }) => {
        // TODO: wire to Resend/Postmark/SES when an email service is chosen.
        // Logging only — safe for dev. Production callers must set up email.
        console.log(`[auth] password reset for ${user.email}: ${url}`);
      },
    },
    ...(socialProviders ? { socialProviders } : {}),
    user: { deleteUser: { enabled: true } },
    ...(isProd
      ? {
          advanced: {
            defaultCookieAttributes: {
              sameSite: 'none',
              secure: true,
              httpOnly: true,
            },
          },
        }
      : {}),
  };

  return betterAuth(config);
}

export function getAuth() {
  if (!_auth) _auth = buildAuth();
  return _auth;
}

// Backward-compat named export used as `import { auth } from '../auth.js'`.
// Resolved lazily via a Proxy so tests that import the module before env
// is set still work.
export const auth = new Proxy(
  {},
  {
    get(_t, prop) {
      const instance = getAuth();
      const v = instance[prop];
      return typeof v === 'function' ? v.bind(instance) : v;
    },
  }
);
