# Deploy

## 1. Neon (database)

1. Create a Neon project. Default branch is fine.
2. Copy the **pooled** connection string — it looks like:
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. From your laptop, with the same string in `backend/.env`:
   ```bash
   cd backend
   npm install
   DATABASE_URL='<your-string>' npm run migrate
   DATABASE_URL='<your-string>' npm run seed
   ```
   That creates all tables and loads ~165 TOPIK 1 exercises.

## 2. Railway (backend)

`baeu-backend` is linked to `JoaoAidar/baeu-learning` on branch `main`, root
directory `backend`, so normal backend pushes autodeploy. Manual deploys with
`railway up --service baeu-backend --ci` still work as an emergency fallback.

1. New project → Deploy from GitHub. Pick this repo.
2. Set the **Root Directory** to `backend/` in service settings.
3. Environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<the same Neon pooled string>
   BETTER_AUTH_SECRET=<32+ random bytes — `openssl rand -hex 32`>
   BETTER_AUTH_URL=https://baeu-backend-production.up.railway.app
   ADMIN_TOKEN=<long random>
   CORS_ORIGIN=<your Vercel URL, set after Vercel deploy>
   LLM_API_KEY=<openrouter key, optional but admin generation needs it>
   LLM_MODEL=anthropic/claude-3.5-sonnet
   ```
4. Railway sets `PORT` automatically. The `railway.toml` declares
   `startCommand="npm start"`, `healthcheckPath=/api/v1/health`, and graceful
   shutdown is wired (SIGTERM).
5. Canonical production backend URL:
   `https://baeu-backend-production.up.railway.app`.
   Deprecated Railway aliases should not be used as production proof.

## 3. Vercel (frontend)

1. New project → Import this repo.
2. **Root Directory**: `frontend/`. Vercel detects Vite via `vercel.json`.
3. Environment variable:
   ```
   VITE_API_BASE_URL=https://baeu-backend-production.up.railway.app
   ```
4. Deploy. Copy the Vercel URL.

Current Vercel project note: if the project root directory is left at the repo
root, the root `vercel.json` delegates install/build to `frontend/` and serves
`frontend/dist`. The preferred provider setting remains **Root Directory:
`frontend/`**, but the root config keeps Git deployments from failing when that
setting drifts.

## 4. Close the loop

Set `CORS_ORIGIN` in Railway to the Vercel URL (no trailing slash). Redeploy
the Railway service so the change takes effect.

## Smoke test

```bash
curl https://baeu-backend-production.up.railway.app/api/v1/health
# → {"ok":true,"store":"pg"}
```

Then on the Vercel URL: sign up, do 10 questions, hit a checkpoint, open
`/#/progress` to see your skill mastery, open `/#/admin` and unlock with the
admin token to manage content.

## Costs (rough, free tier as of 2025)

- **Neon**: free tier covers 0.5 GB + light traffic. Plenty for MVP.
- **Railway**: enable sleep for this backend unless there is a concrete
  always-on requirement. The API has no webhook/worker loop today, so
  `sleepApplication=true` is the lower-cost default posture.
- **Vercel**: hobby tier is free for personal projects.
- **OpenRouter / LLM**: only billed when admin generates exercises — pennies
  per batch with Claude 3.5 Sonnet.

Total: ~$5/mo until you have real traffic.

## Hardening before growing

- [x] Move auth sessions to httpOnly cookie via Better Auth.
- [ ] Add Sentry / similar on backend (Railway captures stdout but no error grouping).
- [ ] Move rate-limit buckets to Redis if Railway scales beyond 1 instance.
- [x] Add forgot-password/reset-password flow. Resend is wired; production email delivery still requires `RESEND_API_KEY`.
- [x] Link Railway `baeu-backend` to GitHub so backend deploys are no longer manual.
- [x] Hide/label Google sign-in until configured. The button is flag-gated by `VITE_GOOGLE_SIGN_IN_ENABLED`.
- [ ] Set Google OAuth credentials and run the targeted browser smoke if Google login becomes a real requirement.
- [ ] Prove observability in Grafana/OTEL, or explicitly mark Baeu as not instrumented.
