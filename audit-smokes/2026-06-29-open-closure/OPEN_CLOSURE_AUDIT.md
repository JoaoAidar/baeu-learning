# Baeu Open Closure Audit — 2026-06-29

Scope: close the stale "open" ledger after the repo audit, without touching
provider secrets or paid LLM generation.

## Current Proof

| Surface | Result | Evidence |
|---|---|---|
| Backend prod health | PASS — `200 {"ok":true,"store":"pg"}` | `curl https://baeu-backend-production.up.railway.app/api/v1/health` |
| Frontend prod | PASS — `200` | `curl https://baeu-learning.vercel.app/` |
| Backend tests | PASS — `128 passed` | `cd backend && npm test` |
| Frontend build | PASS | `cd frontend && npm run build` |
| Local Playwright | PASS — `20 passed`, `5 skipped` opt-in prod specs | `cd frontend && npm run e2e` |
| Prod learner smoke | PASS — signup, feedback, progress, relogin persistence, cleanup | `cd frontend && npm run e2e:prod-smoke -- --workers=1` |
| Prod IDOR smoke | PASS — User B cannot read or mutate User A practice session; both synthetic users cleaned up | `cd frontend && npm run e2e:prod-idor-smoke -- --workers=1` |
| Public deploy smoke | PASS — `/`, `/#/about`, `/#/progress`, and invalid hash route all returned `200` | `browser_service.py deploy-smoke` |
| Sponsor/About capture | PASS — screenshot captured | `about-sponsor-trust.png` |

## Closed Or Downgraded

- `IDOR live (2 accounts)` is now closed at the deployed boundary.
- Learner first-value remains production-proven today.
- The sponsor/About page exists and renders publicly; the remaining issue is
  no longer "missing trust surface", but "needs persona/sponsor validation".

## Still Open

| Priority | Item | Current blocker | Closure gate |
|---|---|---|---|
| P1 | Market-first-value / retention | No real learner or sponsor has validated daily return value or WTP. | Persona real or demo assistida reaches corrected card + persisted progress + next task and confirms next step. |
| P1 | Google OAuth | Provider credentials are manual/owner-held. The button is flag-gated, so this is not a broken public CTA. | Configure Google envs, redeploy, browser OAuth smoke. |
| P1 | Resend delivery | Code is wired, but real inbox delivery was not smoked here. | Configure/confirm provider key and sender, run password-reset inbox smoke. |
| P1 | Admin prod smoke | `E2E_ADMIN_TOKEN` was not present in this shell. | Run `npm run e2e:prod-admin-smoke` with sanctioned token. |
| P2 | Pedagogy/native review | Six newer grammar lessons are marked draft. | Native Korean review signs off or corrections are applied. |
| OK | Docs drift | `project-state.md`, `README.md`, `route-map.md`, and `DEPLOY.md` lagged the current proof. | Reconciled in this closure pass; keep future changes against this audit artifact. |

## Not Run

- `prod-chat-smoke`: intentionally skipped because it spends OpenRouter.
- Provider dashboard/env mutation: intentionally skipped; no secret hunting.
- Admin prod smoke: skipped because no `E2E_ADMIN_TOKEN` was available.
