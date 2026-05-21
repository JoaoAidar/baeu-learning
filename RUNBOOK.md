# Baeu Operator Runbook

Step-by-step for the manual provider actions that close the remaining P1s. Run each as needed, in any order.

---

## 1. Google OAuth ("Continue with Google" button)

Frontend already renders the button. Backend gates Google on both `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` being set — both unset right now.

1. **Create OAuth client** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Project: any (create a "Baeu Learning" project if you don't have one).
   - APIs & Services → Credentials → **Create Credentials → OAuth client ID** → **Web application**.
   - **Authorized JavaScript origins** (one):
     ```
     https://baeu-learning.vercel.app
     http://localhost:5173
     ```
   - **Authorized redirect URIs** (two):
     ```
     https://baeu-backend-production.up.railway.app/api/auth/callback/google
     http://localhost:3001/api/auth/callback/google
     ```
   - Save. Copy the **Client ID** + **Client secret**.

2. **Set Railway env vars** (from the repo root or `backend/`):
   ```sh
   railway variables \
     --set "GOOGLE_CLIENT_ID=<paste client id>" \
     --set "GOOGLE_CLIENT_SECRET=<paste client secret>"
   ```

3. **Redeploy backend**:
   ```sh
   cd backend && railway up --service baeu-backend --ci
   ```

4. **Smoke**: open `https://baeu-learning.vercel.app/`, click "Continue with Google", complete consent → you land back on the practice screen, signed in.

### Optional: OAuth consent screen

If your OAuth client is in "Testing" mode (Google's default), only test-list users can sign in. To unlock for everyone, go to OAuth consent screen → publish (User type "External"). Google will require basic branding (app name, logo, privacy policy URL). For an early-access free product the test mode is fine.

---

## 2. Railway GitHub source link (closed)

`baeu-backend` is already linked to `JoaoAidar/baeu-learning`, branch `main`,
root directory `backend`. Pushes to `main` autodeploy the backend; use manual
`railway up --service baeu-backend --ci` only as a fallback.

**Verify**:

```sh
python3 ~/.agents/tools/service-wrappers/railway_service.py status \
  --cwd /Users/joaoadair/Documents/AI/Baeu_Learning --format json
```

Expected after this repo change is deployed: project `baeu-learning`, service
`baeu-backend`, latest deployment `SUCCESS`, domain
`baeu-backend-production.up.railway.app`, and start command `npm start`.

---

## 3. Resend (transactional email for password reset)

Code is already shipped. Without `RESEND_API_KEY` set, the password-reset URL only logs to Railway stdout — the flow works but no email is sent.

1. **Sign up at [resend.com](https://resend.com)** (free tier: 3,000 emails/month, no credit card).
2. Dashboard → **API Keys** → **Create API Key** → name "Baeu prod", scope "Sending access only". Copy.
3. **Set Railway env var**:
   ```sh
   railway variables --set "RESEND_API_KEY=re_..."
   ```
4. **Redeploy**:
   ```sh
   cd backend && railway up --service baeu-backend --ci
   ```
5. **Smoke**: on the live site, click "Forgot password?", enter a real email you own, submit. Check inbox/spam. The link routes to `https://baeu-learning.vercel.app/#/reset-password?token=...`.

### Sender identity

Default sender is `Baeu <onboarding@resend.dev>` — Resend's universal test sender. Works without DNS, but lands in many spam folders. To use a custom sender:

1. Resend dashboard → **Domains** → **Add Domain** → enter the domain you own (e.g. `baeu.app`).
2. Add the SPF/DKIM/MX records Resend gives you (Cloudflare/Namecheap UI). Verify.
3. Once verified, set on Railway:
   ```sh
   railway variables --set "EMAIL_FROM=Baeu <noreply@baeu.app>"
   ```
4. Redeploy backend.

Deliverability jumps significantly once on a verified custom domain.

---

## 4. Content seed for empty modules (UPDATED 2026-05-19)

**Status:** Closed in code for 8/8 modules with ≥3 lessons each. The new lessons for `hangul`, `numbers`, and `verbs-present` (added 2026-05-19) are drafted from public TOPIK-I material and carry an explicit `> _Draft from public TOPIK-I material — needs native review._` banner at the top of each body so learners can see the maturity level.

**Open follow-up:** Native Korean teacher review of the six 2026-05-19 lessons (`hangul-batchim`, `hangul-double-and-tense`, `numbers-counters-everyday`, `numbers-money-and-prices`, `verbs-past-and-future`, `verbs-irregular-easy-five`). Until reviewed, do not promote any of them in marketing/buyer collateral.

Generation paths if you ever want to expand again:

- **Author by hand**: append to `backend/src/db/grammarLessons.js`. Schema: `slug`, `module_slug`, `title`, `summary`, `body_md`, `related_error_tags`, `related_skill_tags`, `order_index`. Run `npm run seed` to upsert.
- **LLM-generate via admin endpoint**: `POST /api/v1/admin/exercises/generate` covers exercise generation (not lessons). Lesson generation remains a manual step on purpose — lessons drive trust more than throughput.

---

## 5. Performance instrumentation (added 2026-05-19)

Every request is timed by `backend/src/middleware/perf.js` and recorded in an in-memory ring (default 1000 samples). Slow requests (≥500ms) log `[baeu][perf] slow ...`. Slow Postgres queries (≥200ms) log `[baeu][pg] slow ...`.

Tunables (env vars, all optional):

| Var | Default | Purpose |
|---|---:|---|
| `PERF_RING_SIZE` | 1000 | Samples kept in memory for `/api/v1/admin/metrics`. |
| `PERF_SLOW_REQ_MS` | 500 | Threshold for slow-request log. |
| `PERF_SLOW_QUERY_MS` | 200 | Threshold for slow-query log. |
| `PERF_LOG_ALL` | unset | Set to `1` to log every request (noisy; debug only). |

Inspect metrics:

```sh
curl -s -H "x-admin-token: $ADMIN_TOKEN" \
  "https://baeu-backend-production.up.railway.app/api/v1/admin/metrics?sinceMin=60" | jq
```

The admin UI surfaces the same data under **Admin → Analytics → Backend performance**.

### OpenTelemetry export (opt-in)

`backend/src/instrumentation.js` bootstraps OTEL traces, metrics, and logs when
`OTEL_EXPORTER_OTLP_ENDPOINT` is set. Railway runs `npm start`, which preloads
that file before `src/server.js`, so auto-instrumentations can patch HTTP,
Express, and Postgres early enough.

To enable Grafana Cloud Tempo export:

```sh
railway variables \
  --set "OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-<region>.grafana.net/otlp" \
  --set "OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64(user:token)>" \
  --set "OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf" \
  --set "OTEL_SERVICE_NAME=baeu-backend"

git push origin main
```

Verify in Grafana Cloud Tempo by filtering `service.name=baeu-backend`.

---

## 6. Analytics surfaces (added 2026-05-19)

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/v1/analytics/results?days=N` | session | Learner-facing deep analytics: daily activity, response-time trend, toughest items, mastery distribution. UI: `#/results`. |
| `GET /api/v1/admin/analytics?days=N` | admin | Cohort rollup: per-module accuracy, calibration follow-ups (too-hard / too-easy), active learners. UI: Admin → Analytics. |
| `GET /api/v1/admin/metrics?sinceMin=N` | admin | Backend performance snapshot (p50/p95/p99 by route). UI: same Analytics tab. |

---

## Quick reference: env var matrix

| Var | Where | Required | Effect |
|---|---|---:|---|
| `BETTER_AUTH_SECRET` | Railway | ✅ | JWT/session signing. Already set. |
| `BETTER_AUTH_URL` | Railway | ✅ | Better Auth's base URL. Already set. |
| `CORS_ORIGIN` | Railway | ✅ | Comma-separated allowed origins. Already set. |
| `DATABASE_URL` | Railway | ✅ | Neon connection string. Already set. |
| `ADMIN_TOKEN` | Railway | ✅ | Operator x-admin-token. Already set. |
| `GOOGLE_CLIENT_ID` | Railway | — | Enables "Continue with Google". Empty = button toasts an error. |
| `GOOGLE_CLIENT_SECRET` | Railway | — | Pair of the above. |
| `RESEND_API_KEY` | Railway | — | Empty = password-reset URL only logged to stdout, no email sent. |
| `EMAIL_FROM` | Railway | — | Override the default `Baeu <onboarding@resend.dev>` sender. Use after verifying a custom domain on Resend. |
| `VITE_API_BASE_URL` | Vercel | ✅ | Backend canonical URL. Already set in `frontend/.env.example`. |

---

## Health-check one-liners

```sh
# Backend liveness
curl -s https://baeu-backend-production.up.railway.app/api/v1/health

# Better Auth handler mounted
curl -s -o /dev/null -w "%{http_code}\n" https://baeu-backend-production.up.railway.app/api/auth/ok

# Sign-up smoke (creates a synthetic learner; cleanup below)
EMAIL="audit-$(date +%s)@test.local"
curl -s -X POST -H "Origin: https://baeu-learning.vercel.app" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"audit1234\",\"name\":\"Smoke\"}" \
  -c /tmp/c.txt -o /dev/null \
  https://baeu-backend-production.up.railway.app/api/auth/sign-up/email
curl -s -b /tmp/c.txt -X POST -H "Origin: https://baeu-learning.vercel.app" \
  -H "Content-Type: application/json" -d '{}' \
  https://baeu-backend-production.up.railway.app/api/auth/delete-user
rm -f /tmp/c.txt

# Synthetic-account cleanup (deletes audit-%@test.local with cascade)
cd backend && DATABASE_URL=$(railway variables --json | python3 -c \
  "import sys,json; print(json.load(sys.stdin)['DATABASE_URL'])") \
  npm run cleanup:test-users -- --apply
```
