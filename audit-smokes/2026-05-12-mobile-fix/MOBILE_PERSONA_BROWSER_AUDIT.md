# Persona Browser Audit: Baeu Mobile - 2026-05-12

## Verdict

- Browser readiness: READY for the tested mobile learner journey.
- Confidence: high for signup -> first practice -> feedback -> progress -> logout -> login -> persisted progress on Pixel 5.
- Authenticated validation: completed with synthetic account, then cleaned up.
- One-line reason: the mobile header fix removed the logout click blocker and the production journey now passes end to end with no console errors, failed requests, or >=400 browser responses.

## Evidence Inventory

- Local build: `audit-smokes/2026-05-12-mobile-fix/frontend-build.log`
- Local Playwright: `audit-smokes/2026-05-12-mobile-fix/frontend-e2e-local.log`
- Local Pixel 5 journey: `audit-smokes/2026-05-12-mobile-fix/local-mobile-journey.log`
- Production deploy: `audit-smokes/2026-05-12-mobile-fix/vercel-deploy-prod.log`
- Production deploy list: `audit-smokes/2026-05-12-mobile-fix/vercel-deployments-after-deploy.json`
- Production smoke: `audit-smokes/2026-05-12-mobile-fix/frontend-e2e-prod-smoke.log`
- Mobile persona run: `audit-smokes/2026-05-12-mobile-fix/persona-mobile-prod-audit.log`
- Screenshots: `persona-mobile-01-entry.png` through `persona-mobile-08-progress-after-relogin.png`

## Claim And Route Inventory

| Claim | Routes/States Expected | Observed Evidence | Gate | Not Observed / Blocker |
|---|---|---|---|---|
| Mobile entry | `/` public landing on Pixel 5 | Entry screenshot and visible product promise captured. | Public page loads without console/network errors. | None. |
| Self-serve signup | Sign up without manual email/OTP | Synthetic account landed in authenticated app. | New learner can enter app today. | Email verification not required in this flow. |
| First value | Module -> practice -> question -> feedback | Question and feedback screenshots captured. | Learner gets feedback after first answer. | Deeper pedagogy quality still outside this focused run. |
| Progress | `#/progress` shows Total 1 | Progress before relogin screenshot and `stat-total` assertion. | Attempt is visible in progress. | None. |
| Mobile session recovery | logout -> login -> persisted progress | Logout succeeded; relogin succeeded; progress Total 1 persisted. | Pixel/mobile journey passes without force-click. | None. |

## Visual And Functional Sweep

| Route/State | Viewport | Functional Result | Visual/UX Result | Evidence | Severity | Closure Gate |
|---|---|---|---|---|---|---|
| Header authenticated | Pixel 5 | `logout-btn` clickable after fix. | Header wraps instead of compressing Log out into an unclickable edge target. | `persona-mobile-06/07`, prod audit log. | OK | Keep mobile logout in smoke coverage. |
| Practice flow | Pixel 5 | Module CTA, Start, answer, feedback all worked. | Cards remain readable on phone. | `persona-mobile-03/04/05`. | OK | Maintain first-value screenshots in future audits. |
| Progress | Pixel 5 | Total 1 before and after relogin. | Progress cards scan cleanly. | `persona-mobile-06/08`. | OK | Assert `stat-total` in prod smoke. |

## Persona Matrix

| Persona | Target Client / Stakeholder | Trigger | Journey | Result | Score 0-10 | Main Trust Break | Evidence | Gate |
|---|---|---|---|---|---:|---|---|---|
| First-time TOPIK 1 learner on phone | Self-directed Korean learner / user | Field test on mobile today | Signup -> module -> practice -> feedback -> progress -> logout/login -> progress | Passed | 9 | No blocker in tested journey; broader content trust not audited here. | `persona-mobile-prod-audit.log` | Keep same flow green in prod smoke. |

## Critical Browser Findings

| Severity | Finding | Persona(s) | Evidence | Why It Matters | Suggested Fix |
|---|---|---|---|---|---|
| Resolved P1 | Mobile logout click blocker fixed and deployed. | Mobile learner | Prior failed screenshot in `2026-05-12-field`; passing run in this folder. | Field users can recover sessions on phones. | Keep `logout-btn` selector and responsive header wrapping. |
| Watch | This focused audit did not re-score buyer/pedagogy credibility. | Buyer/domain expert | Not in mobile-fix scope. | Passing first-value flow does not prove buyer-demo readiness. | Run broader persona audit later if field feedback points to trust/scope questions. |

## Auth And Data Boundary

- Account/test data status: synthetic account `persona-mobile-1778602194180@test.local` created and deleted.
- Test credential source or signup attempt: fresh production signup.
- Cleanup/reuse note: cleanup returned `{"success":true,"message":"User deleted"}`.
- Production-vs-local differences: local Pixel 5 and production Pixel 5 both passed after the fix.
- Sensitive evidence intentionally not collected: no cookies, localStorage, auth tokens, provider tokens, or secrets stored.

## Ship/Demo Gates

- Production deploy remains `READY`.
- `npm run e2e:prod-smoke` passes after deploy.
- Pixel/mobile persona journey passes without force-click.
- Console errors, failed requests, and >=400 browser responses remain empty for the tested flow.
