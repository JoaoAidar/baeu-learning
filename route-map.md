# Route Map — Baeu Learning (2026-06-29-2154)

Frontend: Vite SPA with a small hash-router in `frontend/src/App.jsx`
(`parseHash`). Routes are `#/...` on `https://baeu-learning.vercel.app`.

Latest proof: `audit-smokes/2026-06-29-open-closure/OPEN_CLOSURE_AUDIT.md`.

## Frontend Hash Routes

| Route | Page / component | Auth | Current state |
|---|---|---|---|
| `#/` | `Home.jsx` when signed in; `Auth.jsx` when signed out | public/gated | Prod learner smoke passed. Public landing has demo SRS deck, not the older single hardcoded MC. |
| `#/practice` | `EndlessPractice.jsx` | session | Prod smoke passed signup -> feedback -> progress -> relogin persistence -> cleanup. |
| `#/chat` | `Chat.jsx` | session | Local/unit coverage exists; prod chat smoke is opt-in and spends OpenRouter. |
| `#/module/:slug` | `Module.jsx` | session | Local e2e passed. |
| `#/lesson/:slug` | `Lesson.jsx` | session | Local e2e passed. |
| `#/progress` | `Progress.jsx` | session | Prod deploy-smoke returned 200; learner smoke verifies persisted progress. |
| `#/results` | `Results.jsx` | session | Local e2e coverage; lifecycle prod smoke is opt-in. |
| `#/about` | `About.jsx` | public | Public deploy-smoke returned 200; sponsor/trust screenshot captured. |
| `#/account` | `AccountSettings.jsx` | session | Account/delete flow covered by lifecycle prod smoke when run. |
| `#/reset-password` | `ResetPassword` in `App.jsx` | public email link | Code path exists; real inbox delivery depends on Resend provider smoke. |
| `#/admin` | `Admin.jsx` | admin token | Local admin e2e passed; prod admin smoke requires `E2E_ADMIN_TOKEN`. |
| unknown hash route | `NotFound` | public | Local e2e passed; public invalid hash route returned 200 as SPA shell, with app-level recovery. |

## Backend

Canonical base: `https://baeu-backend-production.up.railway.app`

### Better Auth

Mounted at `/api/auth/*` before `express.json()`.

| Route group | State |
|---|---|
| email/password signup and login | Prod learner smoke passed. |
| sign out / session | Prod learner smoke passed relogin persistence. |
| forget/reset password | Code wired; real email delivery requires Resend inbox smoke. |
| delete user | Used by prod smoke cleanup. |
| Google social login | Provider/env gated; button is flag-gated unless enabled. |

### Versioned API

Base `/api/v1` in `backend/src/app.js`.

| Route | State |
|---|---|
| `GET /api/v1/health` | 200 `{"ok":true,"store":"pg"}` on 2026-06-29. |
| `/api/v1/practice` | Prod learner smoke passed; prod IDOR smoke passed with two users. |
| `/api/v1/progress` | Prod learner smoke verified persisted progress. |
| `/api/v1/modules` | Local e2e and public app usage pass. |
| `/api/v1/lessons` | Local e2e passed. |
| `/api/v1/exercises` | Used by app/admin surfaces. |
| `/api/v1/analytics/results` | Local/backend tests cover analytics shape. |
| `/api/v1/chat` | Backend tests cover conversation, IDOR, idempotent ending, diagnostics. Prod smoke is opt-in because it spends LLM. |
| `/api/v1/admin/*` | Requires `ADMIN_TOKEN`; local e2e passed, prod smoke awaits sanctioned `E2E_ADMIN_TOKEN`. |
| `/api/health` | 404 by design; do not use. |

## Open Proof Gaps

- Market-first-value/retention: needs real learner or sponsor validation, not
  just synthetic smoke.
- Provider flows: Google OAuth and Resend delivery require owner-held config and
  targeted smokes.
- Admin production smoke: spec exists, token absent in the 2026-06-29 shell.
- Pedagogy/native review: six newer grammar lessons remain draft-gated.
