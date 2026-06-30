# Baeu Learning

Korean-learning web app for TOPIK 1 practice. The learner first-value path is:

```txt
signup/login -> practice question -> answer feedback -> progress update
```

Strategic status: lifestyle/passion project, not a broad B2C GTM bet. The
current commercial gate is retention/WTP proof for a real learner or small
cohort, not more landing-page polish.

## Production

- Frontend: `https://baeu-learning.vercel.app`
- Backend: `https://baeu-backend-production.up.railway.app`
- Health: `GET https://baeu-backend-production.up.railway.app/api/v1/health`
- Deprecated backend aliases such as `baeu-learning-api` are stale and should
  not be used as proof.

Latest open-closure audit: `audit-smokes/2026-06-29-open-closure/OPEN_CLOSURE_AUDIT.md`.

## Stack

- Backend: Node.js + Express ESM, Better Auth, PostgreSQL via `pg`, Helmet,
  OpenTelemetry instrumentation, Resend email service, OpenRouter-backed admin
  content generation.
- Frontend: React 18 + Vite, Tailwind, hash-router, Playwright e2e.
- Database: Neon Postgres in production; in-memory store for many local tests.

## Main Paths

```txt
backend/src/app.js                 Express app, routes, health, error handler
backend/src/auth.js                Better Auth config
backend/src/services/PracticeService.js
backend/src/services/SrsService.js
backend/src/services/ExerciseSelector.js
backend/src/services/ProgressService.js
backend/src/db/schema.sql
backend/src/db/topik1Content.js
backend/src/db/grammarLessons.js
frontend/src/App.jsx               hash router and shell
frontend/src/pages/Auth.jsx
frontend/src/pages/EndlessPractice.jsx
frontend/src/pages/Progress.jsx
frontend/src/pages/Results.jsx
frontend/src/pages/Admin.jsx
frontend/e2e/
```

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

For local frontend development, Vite can proxy to the local backend when
`VITE_API_BASE_URL` is empty. For production builds, set:

```txt
VITE_API_BASE_URL=https://baeu-backend-production.up.railway.app
```

## API Map

Better Auth is mounted outside the versioned API:

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `POST /api/auth/forget-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/delete-user`

Versioned app API:

- `GET /api/v1/health`
- `POST /api/v1/practice/sessions`
- `GET /api/v1/practice/next`
- `POST /api/v1/practice/answer`
- `GET /api/v1/practice/sessions/:id/summary`
- `GET /api/v1/progress/overview`
- `GET /api/v1/progress/skills`
- `GET /api/v1/modules`
- `GET /api/v1/lessons`
- `GET /api/v1/exercises`
- `GET /api/v1/analytics/results`
- `GET|POST|PATCH /api/v1/admin/*` with `ADMIN_TOKEN`
- `GET|POST /api/v1/chat/*`

## Tests And Smokes

Backend:

```bash
cd backend
npm test
npm run migrate
npm run seed
npm run cleanup:test-users
```

Frontend:

```bash
cd frontend
npm run build
npm run e2e
npm run e2e:prod-smoke
npm run e2e:prod-idor-smoke
```

Provider or cost-bearing smokes are opt-in:

- `npm run e2e:prod-admin-smoke` requires `E2E_ADMIN_TOKEN`.
- `npm run e2e:prod-chat-smoke` spends OpenRouter.
- Google OAuth and password-reset delivery require provider configuration.

## Current Open Gates

- Market-first-value/retention: prove a real learner or sponsor values the
  daily loop enough to keep using or take a next step.
- Google OAuth: provider credentials/manual Google Cloud setup.
- Resend delivery: real inbox smoke after provider config.
- Admin production smoke: requires sanctioned `E2E_ADMIN_TOKEN`.
- Pedagogy/native review: newer Korean grammar lessons are still draft until
  reviewed.

See `project-state.md`, `gaps-live.md`, `DEPLOY.md`, and `RUNBOOK.md` before
changing deploy/provider behavior.
