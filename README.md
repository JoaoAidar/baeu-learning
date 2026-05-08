# Baeu Learning — Korean Practice Engine MVP

Duolingo-style practice engine.
- **Endless Mode** — infinite questions, checkpoint every 10
- **Error Intelligence** — deterministic classifier tags wrong answers (vocab, particle, word order, conjugation, formality, hangul, romanization)
- **Admin Import** — bulk JSON exercise import

## Stack

- **Frontend**: Vite + React → Vercel
- **Backend**: Express (Node 20+) → Railway
- **DB**: Neon (Postgres) via `pg`
- **Auth**: email + password, scrypt hash, JWT (Bearer)

## Layout

```
backend/
  src/
    app.js, server.js
    config/db.js                # picks pg vs in-memory by DATABASE_URL
    db/{schema.sql, migrate.js, seed.js}
    repositories/{memoryStore, pgStore}.js
    services/{AuthService, ErrorClassifier, ExerciseSelector, PracticeService, AdminService}.js
    middleware/auth.js          # requireUser (JWT), requireAdmin (token or admin role)
    routes/{auth, practice, admin, exercises}.js
    controllers/*
  tests/{auth, errorClassifier, practice}.test.js
frontend/
  src/{App.jsx, api.js, pages/{Auth,EndlessPractice}.jsx}
```

## Quickstart (local, no DB)

```bash
# backend
cd backend
cp .env.example .env
# edit .env: set JWT_SECRET to anything 16+ chars
npm install
npm run dev          # http://localhost:3001 (in-memory, auto-seeded)

# frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The frontend Vite dev server proxies `/api` to `http://localhost:3001`.

## With Neon

1. Create a Neon project, copy the connection string (must include `sslmode=require`).
2. `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/baeu?sslmode=require
   JWT_SECRET=<32+ random bytes>
   ADMIN_TOKEN=<long random>
   ```
3. `npm run migrate` (applies `src/db/schema.sql`, idempotent).
4. `npm run seed`   (inserts sample exercises if the table is empty).
5. `npm run dev`.

## Deploy targets (planning, not deployed yet)

- **Vercel (frontend)**: build = `npm run build` from `frontend/`, output `dist/`. Env: `VITE_API_BASE_URL=https://<railway-app>.up.railway.app`.
- **Railway (backend)**: root = `backend/`, start = `npm start`. Env: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_TOKEN`, `CORS_ORIGIN=https://<vercel-app>.vercel.app`, `PORT` (Railway sets it).
- **Neon**: same `DATABASE_URL` injected into Railway.
- Health check: `GET /api/v1/health`.
- Graceful shutdown wired (SIGTERM/SIGINT) for Railway redeploys.

## API

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/auth/signup` | none |
| POST | `/api/v1/auth/login` | none |
| GET  | `/api/v1/auth/me` | Bearer |
| POST | `/api/v1/practice/sessions` | Bearer |
| GET  | `/api/v1/practice/next?sessionId=…` | Bearer |
| POST | `/api/v1/practice/answer` | Bearer |
| GET  | `/api/v1/practice/sessions/:id/summary` | Bearer |
| GET  | `/api/v1/exercises` | none |
| GET  | `/api/v1/progress/overview` | Bearer (totals, last 7d, streak days, error tag counts) |
| GET  | `/api/v1/progress/skills` | Bearer (per-skill level/streak/accuracy/dueAt) |
| GET  | `/api/v1/admin/attempts/recent?wrongOnly=true` | admin (logged tags + dry-run reclassify, drift flag) |
| POST | `/api/v1/admin/exercises/import` | `x-admin-token` *or* JWT with `role=admin` |
| POST | `/api/v1/admin/exercises/generate` | admin (calls LLM, validates, drafts by default) |
| GET  | `/api/v1/admin/exercises?status=draft` | admin |
| PATCH | `/api/v1/admin/exercises/:id/status` | admin (publish / archive) |
| GET  | `/api/v1/health` | none |

## Tests

```bash
cd backend
JWT_SECRET=test-secret-must-be-long-enough npm test
```

Currently **45/45** passing across auth, classifier, selector, practice, admin import, LLM generator, seed validation, mastery/SRS, and progress.

## Mastery / SRS

Each correct answer raises a `(user, skill)` row's `level` (0..5) and pushes `next_review_at` further into the future. Wrong answers drop the level and reset the streak. The selector mixes three signals — recent errors, mastery dueness, variety — so practice naturally focuses on weak/due skills without the user choosing.

Intervals: 0=now · 1=10min · 2=1h · 3=1d · 4=3d · 5=7d.

Skill tags that are descriptors (e.g. `vocabulary`, `phrases`, `time`) are ignored for mastery — only concrete skills like `topic_marker`, `verb_conjugation`, `formality`, `native_numbers` are tracked.

## Progress dashboard

`#/progress` (logged in): streak, totals, accuracy 7d, due-skills count, per-skill bars (level + accuracy), error-tag breakdown.

## Calibration view (admin)

`#/admin` → **Calibration** tab. Lists recent wrong attempts with the original logged tags vs a fresh re-classification done on the spot. Drift is flagged in yellow — that's how you spot when the classifier rules need tuning against real learner answers.

## Admin UI

Visit `http://localhost:5173/#/admin`. Paste your `ADMIN_TOKEN` once (saved to localStorage). Three panels:
- **Generate via LLM** — topic + count + difficulty, optional auto-publish.
- **Import JSON** — paste an array of exercises.
- **Exercises list** — filter by `draft` / `published` / `archived`, publish/archive inline.

## Content (seed)

`backend/src/db/topik1Content.js` builds **165** TOPIK 1 exercises across 30 skills (vocabulary, particles, verbs, numbers, greetings, colors, sentence translation, …) from a small set of source tables. Run `npm run seed` after `npm run migrate` to load them into Neon.
