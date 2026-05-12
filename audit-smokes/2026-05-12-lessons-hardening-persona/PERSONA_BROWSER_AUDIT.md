# Persona Browser Audit: Baeu Lessons + Hardening

Run: 2026-05-12
Target: `https://baeu-learning.vercel.app`
Backend: `https://baeu-backend-production.up.railway.app`

## Verdict

- Browser readiness: READY for controlled learner validation.
- Confidence: high for the tested learner journey; medium for buyer/demo trust.
- Authenticated validation: completed with a fresh synthetic account, then deleted.
- One-line reason: production now proves signup, seeded lesson discovery, lesson reading, practice feedback, progress persistence, not-found recovery, and mobile relogin without console errors or failed browser responses.

## Evidence Inventory

- Programmatic smoke: `frontend npm run e2e` -> 16 passed, 1 prod smoke skipped locally.
- Production smoke: `frontend npm run e2e:prod-smoke` -> 1 passed after fresh deploy.
- Backend unit/API tests: `backend npm test` -> 77 passed.
- Frontend build: `frontend npm run build` -> passed.
- Backend health/header proof: `GET /api/v1/health` -> 200 with `store:"pg"` and CSP/Helmet headers.
- Production lesson API proof:
  - `greetings` -> 3 lessons.
  - `vocab-daily` -> 3 lessons.
  - `reading` -> 3 lessons.
- Persona evidence JSON: `audit-smokes/2026-05-12-lessons-hardening-persona/persona-evidence.json`.
- Screenshots:
  - `01-desktop-entry.png`
  - `02-about-buyer-trust.png`
  - `03-after-signup-home.png`
  - `04-greetings-module-with-lessons.png`
  - `05-greeting-lesson.png`
  - `06-practice-feedback.png`
  - `07-progress-after-practice.png`
  - `08-not-found-recovery.png`
  - `09-mobile-progress-relogin.png`
  - `10-mobile-logged-out.png`

## Claim And Route Inventory

| Claim | Routes/States Expected | Observed Evidence | Gate | Not Observed / Blocker |
|---|---|---|---|---|
| Public entry explains product | `/` desktop | Entry shows Korean practice promise, module preview, auth panel. | Pass | None. |
| Buyer trust surface exists | `#/about` | About page captured. | Partial | Still not a complete pricing/pilot/proof surface. |
| Self-serve signup | `/` signup form | Fresh synthetic account created and entered app. | Pass | No email verification flow, by product choice. |
| New seeded lessons visible | `#/module/greetings` | Page shows Grammar lessons plus new greetings lessons. | Pass | Only greetings was browser-checked; API checked all 3 target modules. |
| Lesson reader works | `#/lesson/greeting-register-map` | Markdown lesson rendered. | Pass | Deep pedagogy quality not scored beyond smoke. |
| First value | `#/module/hangul` -> practice | Question answered and feedback card shown. | Pass | None. |
| Progress | `#/progress` | `stat-total` shows Total 1 after practice. | Pass | None. |
| Route recovery | invalid hash route | Not-found recovery UI shown. | Pass | HTTP remains SPA 200 by design. |
| Mobile session continuity | Pixel 5 login -> progress -> logout | Mobile progress after relogin and logged-out state captured. | Pass | None. |
| Provider auth/email | Google / Resend | Not tested in browser. | Not observed | Env vars still missing until Joao configures providers. |

## Visual And Functional Sweep

| Route/State | Viewport | Functional Result | Visual/UX Result | Evidence | Severity | Closure Gate |
|---|---|---|---|---|---|---|
| Public entry | Desktop | Loads and exposes signup/login. | Clear product promise and module preview. | `01-desktop-entry.png` | OK | Keep first-viewport promise visible. |
| About | Desktop | Route loads. | Trust copy exists but remains light for a paying/buyer demo. | `02-about-buyer-trust.png` | P2 | Add pilot/pricing/proof/caveat block when moving beyond controlled validation. |
| Signup/home | Desktop | Fresh account enters authenticated app. | Home scans cleanly. | `03-after-signup-home.png` | OK | Keep signup smoke green. |
| Greetings module | Desktop | Seeded lessons visible. | Lesson list is clear and compact. | `04-greetings-module-with-lessons.png` | OK | Keep at least 3 lessons in buyer-relevant modules. |
| Lesson reader | Desktop | Markdown lesson opens. | Content is readable. | `05-greeting-lesson.png` | OK | Add deeper content QA later. |
| Practice feedback | Desktop | Start -> answer -> feedback works. | Feedback card is legible. | `06-practice-feedback.png` | OK | Keep `e2e:prod-smoke` green. |
| Progress | Desktop | Attempt count persists. | Progress stats are clear. | `07-progress-after-practice.png` | OK | Keep `stat-total` selector stable. |
| Not found | Desktop | Invalid route shows recovery UI. | Clear and non-scary. | `08-not-found-recovery.png` | OK | Preserve route recovery in e2e. |
| Progress relogin | Pixel 5 | Login with same account shows persisted progress. | Mobile layout remains readable. | `09-mobile-progress-relogin.png` | OK | Repeat after header/nav changes. |
| Logout | Pixel 5 | Logout button works without force-click. | Logged-out landing remains usable. | `10-mobile-logged-out.png` | OK | Keep mobile logout in smoke coverage. |

## Persona Matrix

| Persona | Target Client / Stakeholder | Trigger | Journey | Result | Score 0-10 | Main Trust Break | Evidence | Gate |
|---|---|---|---|---|---:|---|---|---|
| First-time TOPIK 1 learner | Self-directed learner | Wants a quick practice loop | Signup -> module -> lesson -> practice -> feedback -> progress -> mobile relogin | Passed | 9 | Provider OAuth/email not configured, but not needed for core password flow. | Screenshots 01, 03-10 | Keep prod smoke green. |
| Parent/sponsor/buyer | Buyer/sponsor | Decides whether this is credible enough to show/pay for | Entry -> About -> lesson/content surface | Partial | 7 | About lacks concrete pilot terms, pricing, content authority, and proof. | Screenshots 01, 02, 04, 05 | Add buyer/demo trust block. |
| Adversarial QA | Failure hunter | Looks for false greens and hidden broken states | Console/network sweep, invalid route, mobile relogin, seeded content check | Passed for tested scope | 8 | Google/Resend provider flows still unobserved because env missing. | Evidence JSON, screenshots 08-10 | Configure providers or mark explicitly out of scope. |

## Critical Browser Findings

| Severity | Finding | Persona(s) | Evidence | Why It Matters | Suggested Fix |
|---|---|---|---|---|---|
| OK | Production learner path is green after deploy. | Learner, QA | `npm run e2e:prod-smoke`; screenshots 03, 06, 07, 09 | Confirms deployed bundle and DB state, not just local tests. | Keep as required release gate. |
| OK | Previously empty modules now have visible/content API coverage. | Buyer, domain expert | API counts + screenshots 04, 05 | Content credibility gap is materially reduced. | Extend content QA, not urgent code. |
| P2 | Buyer trust surface remains light. | Buyer/sponsor | screenshot 02 | App works, but buyer still lacks pricing/pilot/proof/context. | Add a compact pilot/trust section to About. |
| Watch | Google OAuth and real email delivery remain provider-gated. | Learner, support | env matrix in `RUNBOOK.md`; not observed in browser | Password flow works; provider paths should not be claimed ready. | Configure `GOOGLE_*` and `RESEND_API_KEY`, then smoke. |

## False Green Paths

- Do not treat local Playwright alone as proof; production smoke initially failed before redeploy.
- Do not treat lesson seed code alone as proof; production API was checked for 3 target modules.
- Do not claim Google OAuth or email delivery ready from UI presence; provider env vars remain missing.
- Do not claim buyer-ready paid demo yet; About is present but still thin.

## Auth And Data Boundary

- Synthetic account: `audit-persona-...@test.local`.
- Account lifecycle: created through production signup; deleted through Better Auth `delete-user`.
- Cleanup result: 200 `{"success":true,"message":"User deleted"}`.
- Sensitive evidence intentionally not collected: cookies, localStorage, auth tokens, provider secrets, hidden browser state.

## P0/P1/P2 Backlog

- P0: none from this run.
- P1: none for the tested learner journey.
- P2: add buyer/demo trust block with pilot/pricing/proof/caveats.
- P2: configure and smoke Resend delivery.
- P2: configure and smoke Google OAuth, or hide/label it until provider-ready.
- Watch: consider `sslmode=verify-full` later to silence upcoming pg/connection-string semantic warning.

## Ship/Demo Gates

- Before learner field validation: backend tests, frontend build/e2e, prod smoke, and mobile relogin smoke green.
- Before buyer demo: add concrete buyer trust section and rerun persona buyer path.
- Before claiming provider completeness: Resend and Google env configured, redeployed, and browser-smoked.
