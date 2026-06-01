# Baeu Env Var Browser Pass - 2026-05-20

Scope: resolve/check Baeu production env vars using the safe provider order, then Safari where browser evidence is useful. No secret values were printed or copied into this artifact.

## Targets

- Frontend: Vercel project `joaoaidars-projects/baeu-learning`
- Backend: Railway project `baeu-learning`, service `baeu-backend`, environment `production`
- Canonical API: `https://baeu-backend-production.up.railway.app`
- Canonical web: `https://baeu-learning.vercel.app`

## What Was Verified

| Surface | Result |
|---|---|
| Vercel auth | PASS via `vercel_service.py auth-check`; CLI user `joaoaidar`, API user check 200. |
| Vercel production deploy | READY. Alias `https://baeu-learning.vercel.app` points to latest production deploy inspected by CLI. |
| Vercel env names | Production has `VITE_API_BASE_URL` and legacy `VITE_API_URL`; Safari confirmed both visible in Settings -> Environment Variables. |
| Frontend runtime | `https://baeu-learning.vercel.app/` returned 200 and current asset contains the canonical backend URL. |
| Railway browser access | PASS in Safari. Opened `baeu-backend` Variables page for project `b8a71097-a023-496f-9764-94b91ef49786`, service `abf4f7f2-68a9-4b3a-acd1-ae0d4fd6fcf0`, environment `576fc98f-46f0-4747-9f97-ae8bb71527a9`. |
| Railway runtime health | PASS via HTTP: `/api/v1/health` returned `{"ok":true,"store":"pg"}` with HTTP 200. |
| Grafana auth | PASS via wrapper; Tempo query path works. |
| OpenRouter auth | PASS via wrapper; API/key/model checks succeeded. |

## Railway Variables Seen In Safari

Safari showed 25 service variables present on `baeu-backend`, including:

- `ADMIN_TOKEN`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `EMAIL_FROM`
- `JWT_EXPIRES_IN`
- `JWT_SECRET`
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `LLM_MODEL`
- `NODE_ENV`
- `OPENROUTER_API_KEY`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`
- `OTEL_EXPORTER_OTLP_PROTOCOL`
- `OTEL_RESOURCE_ATTRIBUTES`
- `OTEL_SERVICE_NAME`
- `PERF_LOG_ALL`
- `PERF_RING_SIZE`
- `PERF_SLOW_QUERY_MS`
- `PERF_SLOW_REQ_MS`
- `PORT`
- `RATE_LIMIT_LLM_MAX`

This closes the previous "set 4 OTEL_* envs in Railway" browser check: the variables are present in the provider UI.

## Still Not Resolved

| Missing / blocked item | Why it was not completed | Next action |
|---|---|---|
| `RESEND_API_KEY` in Railway | Not visible in the Safari variables list. I did not read/copy secret values from local `.env` into the browser. | Add `RESEND_API_KEY` from the Resend provider or approved secret source, then trigger/redeploy `baeu-backend` and run a password-reset delivery smoke. |
| `GOOGLE_CLIENT_ID` in Railway | Not visible in the Safari variables list. | Create/confirm the Baeu Google OAuth app and add the client id. |
| `GOOGLE_CLIENT_SECRET` in Railway | Not visible in the Safari variables list. | Add the matching Google OAuth client secret. Backend will fail closed if only one Google var is set. |
| Railway wrapper/CLI variable writes | `railway_service.py auth-check` hit provider rate limit: HTTP 429, retry after roughly 474 seconds. | Retry wrapper/API after the Railway rate-limit window clears; do not hunt tokens or bypass through hidden auth state. |
| Tempo trace proof for Baeu | Grafana Tempo still listed `gestor-financeiro-bot` only, even after Baeu health was hit. | After confirming the backend redeployed with OTEL envs, generate traffic and rerun `grafana_service.py --format json tempo-services --limit 50`; expect `baeu-backend`. |

## Notes

- Vercel has both `VITE_API_BASE_URL` and `VITE_API_URL` in production. The current deployed bundle uses the canonical backend URL, so this is not a live break today. It is still cleanup debt because `VITE_API_URL` belongs to older frontend code paths.
- `backend/package.json` starts with `node --import=./src/instrumentation.js src/server.js`, while `server.js` also imports `./otel.js`. If Tempo remains empty after a fresh backend deploy, inspect duplicate/competing OTel bootstrap before changing provider envs again.
