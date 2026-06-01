# Production Learner Smoke - 2026-05-25

Run time: 2026-05-25 09:36 BRT.

## Canonical Targets

| Target | Result | Evidence |
|---|---|---|
| Frontend `https://baeu-learning.vercel.app/` | HTTP 200, title `Baeu — Korean Practice` | `frontend.headers`, `frontend.html` |
| Backend `https://baeu-backend-production.up.railway.app/api/v1/health` | HTTP 200, body `{"ok":true,"store":"pg"}` | `backend-health.headers`, `backend-health.json` |

## Playwright Smoke

Command:

```sh
cd /Users/joaoadair/Documents/AI/Baeu_Learning/frontend
npm run e2e:prod-smoke -- --workers=1
```

Result: PASS, `1 passed (39.3s)`.

Validated production learner path:

| Step | Status |
|---|---|
| Fresh synthetic signup | PASS |
| Module practice reached | PASS |
| One real practice answer submitted | PASS |
| Feedback card visible after answer | PASS |
| Progress total reached `1` | PASS |
| Logout/login with same learner | PASS |
| Progress total still `1` after relogin | PASS |
| Synthetic account cleanup | PASS, deleted |

Canonical saved synthetic account: `audit-1779712447588@test.local`.

Cleanup/reuse note: see `SYNTHETIC_ACCOUNT_CLEANUP.md`.

## Still Blocked / Out Of Scope

| Item | Status |
|---|---|
| Admin/content production smoke | Not run in this learner-only smoke. |
| Google OAuth and Resend delivery | Still provider/env gated; not validated here. |
| Buyer/demo trust surface | Not validated here. |
| Admin LLM generation budget/cap | Still open; not exercised. |
| Provider deploy truth beyond HTTP liveness | Not expanded here; this run used canonical live URLs plus Playwright flow proof. |
