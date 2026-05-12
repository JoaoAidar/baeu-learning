# Baeu Field Smoke Report - 2026-05-12

## Verdict

Readiness: LIMITED READY for controlled desktop field validation; WATCH / NOT CLEAN for mobile field validation.

The learner core works in production on desktop: signup, module practice, answer feedback, progress, logout/login, persisted progress, and cleanup all passed against `https://baeu-learning.vercel.app` and canonical backend `https://baeu-backend-production.up.railway.app`.

Mobile reached first value and progress, but the header layout blocked the `Log out` click in Playwright because the account nav container intercepted pointer events. Treat mobile auth/session recovery as unproven before field usage on phones.

## Evidence

| Surface | Result | Evidence |
|---|---|---|
| Backend tests | PASS: 72/72 | `audit-smokes/2026-05-12-field/backend-test.log` |
| Frontend build | PASS | `audit-smokes/2026-05-12-field/frontend-build.log` |
| Local Playwright | PASS: 16 passed, 1 prod-only test skipped | `audit-smokes/2026-05-12-field/frontend-e2e-local-rerun.log` |
| HTTP probes | PASS canonical web/API; stale backend alias still 404 | `audit-smokes/2026-05-12-field/http-probes.log` |
| Vercel | READY, production alias points to deployment created 2026-05-11 17:26 BRT; 0 log events in last hour | `audit-smokes/2026-05-12-field/vercel-inspect.json`, `vercel-logs-1h.json` |
| Railway | SUCCESS backend deploy, `/api/v1/health`, sleep enabled, low 24h usage | `audit-smokes/2026-05-12-field/railway-status.json`, `railway-metrics-24h.json` |
| Official prod smoke | FAIL as smoke harness drift: production bundle lacks `stat-total`, while screenshot shows Total=1 | `audit-smokes/2026-05-12-field/frontend-e2e-prod-smoke-rerun.log`, `playwright-prod-artifacts/.../test-failed-1.png` |
| Ad hoc desktop browser journey | PASS including logout/login and persisted progress; cleanup ok | `audit-smokes/2026-05-12-field/prod-browser-journey-visible-final.log` |
| Ad hoc mobile browser journey | PARTIAL: first value/progress pass; logout click blocked by header layout; cleanup ok | `audit-smokes/2026-05-12-field/prod-browser-journey-visible-final.log`, `prod-browser-mobile-failed-final.png` |

## Critical Findings

| Severity | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Production deploy is behind the local smoke selectors: live bundle has no `stat-total`, but local repo does. | `prod-asset-check.log`; `frontend/src/pages/Progress.jsx` has `data-testid`. | Redeploy current frontend, rerun `npm run e2e:prod-smoke`, expect 1 passed. |
| P1 | Mobile header/session controls are not field-clean. Logout is visible but Playwright cannot click it because the account nav wrapper intercepts pointer events. | `prod-browser-mobile-failed-final.png`; final browser log. | On Pixel/mobile viewport, signup -> progress -> logout -> login -> progress persisted passes without force-click. |
| P1 | Railway CLI OAuth is stale for `railway variables`, even though wrapper/API status and logs work. | `cleanup-field-users.log`; wrapper auth-check ok. | Run `railway login` when variable-level CLI access is needed. |
| Watch | Railway backend logs include pg SSL mode warning. | `railway-logs-1h.json`. | Decide whether to move Neon URL to `sslmode=verify-full` or explicitly accept current behavior before pg major upgrade. |
| Watch | Stale backend alias still returns Railway 404. | `http-probes.log`. | Keep all docs/probes on `baeu-backend-production.up.railway.app`; never use `baeu-learning-api-production`. |

## What Works

- Backend core logic, auth middleware, practice, lessons, progress, rate limits, seed integrity, and LLM parser tests passed.
- Local browser suite covers admin, auth, lessons, practice, checkpoint, unknown route recovery.
- Production desktop field journey is real, DB-backed, and cleanup succeeded.
- Canonical frontend and backend are live; backend cold start returned health in about 0.6s during this run.
- No console errors, failed requests, or >=400 browser responses were captured in the ad hoc desktop/mobile journeys.

## Field Gate

For field today: use desktop/laptop for the full flow if possible. On mobile, first-value practice is usable, but do not depend on logout/relogin/session recovery until the header layout is fixed and redeployed.
