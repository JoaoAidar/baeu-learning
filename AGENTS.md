# AGENTS.md — Baeu-Learning

## Read First

- `project-state.md` — runtime truth, gates, env names, next actions (start here).
- `gaps-live.md` — CONSOLIDADO (open gaps + grep-index); full history in
  `gaps-archive-2026-06-07.md`. Append dated entries, never delete archive.
- `route-map.md` — frontend hash routes + backend API map with verified states.
- `personas/` — João-learner (primária), tutor B2B (hipotética), linguista cética (adversária).
- `README.md` — stack, DB schema, endpoints, test users (PT-BR).
- `DEPLOY.md` — Neon + Railway + Vercel deploy steps and env var names.
- `RUNBOOK.md` — manual provider/ops steps.
- This repo is on the user's real Mac at `/Users/joaoadair/Documents/AI/Baeu_Learning`.
  Edit only inside this path.

## What This Project Is

Korean-learning web app (TOPIK 1). Learner first-value path:
**signup/login -> practice question -> answer feedback -> progress update.**

**Status estratégico (decisão 2026-06-06-1214): LIFESTYLE/PASSION PROJECT.**
No B2C GTM. ICE 7.7 lifestyle / 4.7 B2C. Best code in the fleet; the SRS engine
(`backend/src/services/SrsService.js`, SM-2) is an extraction candidate as an
internal lib. Canonical prod: web `https://baeu-learning.vercel.app` (SPA,
hash routes), API `https://baeu-backend-production.up.railway.app/api/v1/*`
(health: `/api/v1/health` — NOT `/api/health`, that's 404).

Known gotchas: Google button renders but OAuth is dead in prod (`GOOGLE_*` envs
missing — `sign-in/social` returns 404); `<html lang="en">` on a Korean app;
no meta/OG; two parallel token systems (`styles/designSystem.js` + `theme.js`).

- **Backend** (`backend/`): Node + Express (ESM), Postgres via `pg` on Neon,
  `better-auth` for auth, OpenTelemetry instrumentation, Resend email,
  `LLMGenerator` (OpenRouter) for admin content generation. Routes:
  `auth/me`, `lessons`, `modules`, `exercises`, `practice`, `progress`,
  `analytics`, `admin`. Core learner logic: `services/PracticeService.js`,
  `ExerciseSelector.js`, `ProgressService.js`, `MasteryService.js`.
- **Frontend** (`frontend/`): React 18 + Vite, Tailwind, Playwright e2e.
  Pages: `Auth`, `Home`, `Module`, `Lesson`, `EndlessPractice`, `Results`,
  `Progress`, `Admin`, `About`. Build reads `VITE_API_BASE_URL`.

## Guardrails

- **Secret boundaries — never read, print, or paste:** `.env` / `.env.*`
  (root, `backend/`, `frontend/`), any auth/token/secret/cookie file,
  `JWT_SECRET`, `ADMIN_TOKEN`, `DATABASE_URL` (Neon string), `LLM_API_KEY`
  (OpenRouter), Resend keys, Vercel/Railway provider config. Use env-var
  *names* in docs, never values.
- **Production canonical backend is `baeu-backend`** at
  `https://baeu-backend-production.up.railway.app`. The old
  `baeu-learning-api` alias is STALE — do not use it in docs, smokes, or
  client config. Frontend prod build must point `VITE_API_BASE_URL` at the
  canonical backend.
- Repo is frequently **dirty**; deployed code may lag local. Never assume the
  live build matches working tree — verify before claiming a fix is live.
- Admin LLM generation costs money (OpenRouter). Do not exercise generation at
  scale without a verified cap/key-limit.
- Synthetic test accounts created in prod smokes MUST be cleaned up
  (`backend/src/db/cleanup-test-users.js` / smoke cleanup notes).

## Safe Commands

Backend (`cd backend`):
- `npm install`
- `npm run dev` — local server with OTel + watch
- `npm test` — `node --test` suite
- `npm run migrate` / `npm run seed` — needs `DATABASE_URL` (do not echo it)
- `npm run cleanup:test-users` — remove synthetic learners

Frontend (`cd frontend`):
- `npm install` / `npm run dev` / `npm run build`
- `npm run e2e` — local Playwright
- `npm run e2e:prod-smoke` — prod learner smoke against canonical web
- `npm run e2e:prod-admin-smoke` — needs `E2E_ADMIN_TOKEN`

Read-only health: `curl https://baeu-backend-production.up.railway.app/api/v1/health`

## Where To Work

- Learner first-value (the P1 gate): `backend/src/services/PracticeService.js`,
  `controllers/practiceController.js`, `routes/practice.js`,
  `ProgressService.js`; frontend `pages/EndlessPractice.jsx`, `Auth.jsx`,
  `Progress.jsx`; e2e `frontend/e2e/prod-smoke.spec.js`.
- Auth: `backend/src/auth.js`, frontend `pages/Auth.jsx`.
- Admin/content/LLM: `services/AdminService.js`, `LLMGenerator.js`,
  `routes/admin.js`, frontend `pages/Admin.jsx`.

## Definition Of Done

- Backend `npm test` green; touched frontend e2e green.
- If backend changed: pushed to `main` (Railway autodeploys `baeu-backend`) OR
  explicit `railway up --service baeu-backend --ci` with health/header proof.
- Learner first-value path re-proven on production (signup/login -> practice
  question -> answer feedback -> progress update) with synthetic-account
  cleanup — not inferred from web/api liveness.
- No secrets committed; stale `baeu-learning-api` alias not reintroduced.
- `gaps-live.md` updated with a dated entry citing evidence path.
