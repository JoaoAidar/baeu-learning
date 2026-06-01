# Baeu Learning Persona Audit - 2026-05-24

Scope: whole-project persona audit for `/Users/joaoadair/Documents/AI/Baeu_Learning`.
Mode: mostly read-only, with one sanctioned-style production learner smoke run that created and deleted a synthetic user.

## Verdict

Baeu is **LIMITED READY for learner validation**, not yet clean for buyer/admin demo.

The core learner path is alive today: production frontend and backend respond, and the production smoke proved signup -> practice -> feedback -> progress -> logout/login -> persisted progress -> cleanup. The biggest remaining trust gaps are not basic liveness; they are session ownership hardening, provider-backed auth/email claims, weak-network recovery, and admin/buyer proof.

## Agents

- Agent 1: first-time desktop learner.
- Agent 2: mobile learner / weak-network persona.
- Agent 3: returning learner / account persistence.
- Agent 4: operator/admin/trust persona.

## Fresh Evidence

- Frontend: `https://baeu-learning.vercel.app/` returned HTTP 200 and served the current SPA shell.
- Backend: `https://baeu-backend-production.up.railway.app/api/v1/health` returned `{"ok":true,"store":"pg"}` with HTTP 200.
- Production learner smoke: `cd frontend && npm run test:e2e:audit` passed, creating `audit-1779588978465@test.local`, proving progress persistence after relogin, and deleting the synthetic learner.
- Backend tests: `cd backend && npm test` passed 82/82.
- Frontend build: `cd frontend && npm run build` passed.
- Full local Playwright e2e: `cd frontend && npm run e2e` failed 8 tests: 7 admin UI unlock tests and 1 global practice signup test. Ten tests passed and two prod-gated tests were skipped.

## P0

None observed.

## P1 Findings

### 1. Practice session ownership is not enforced deeply enough

`practiceController.js` accepts `sessionId` and the service path loads the practice session by id, but the audited path did not show a cross-check that the loaded session belongs to the current `req.userId`. A leaked or guessed session UUID should not let one authenticated user read or submit against another user's session.

Closure gate: pass `req.userId` through `nextQuestion`, `submitAnswer`, and `sessionSummary`; reject when `session.user_id !== userId`; add cross-user backend tests.

### 2. Weak-network/API failure can collapse into toast-only or blank states

`Module`, `Lesson`, `Progress`, and `Results` rely on transient toasts for API failures and can render null or near-empty screens after the toast disappears. Practice also surfaces backend errors through toast rather than an anchored retry state in the exercise card.

Closure gate: persistent inline error and retry states for module, lesson, progress, results, and practice API failures; add mobile/API-failure regression checks.

### 3. Visible Google/password-reset flows are not provider-proven

The UI exposes "Continue with Google" and "Forgot password?", but repo runbook/env evidence says Google OAuth and Resend delivery remain provider-gated unless envs are configured. Password reset may log the URL instead of delivering email when `RESEND_API_KEY` is absent.

Closure gate: configure Google OAuth and Resend, redeploy, then browser-smoke both; or hide/label those CTAs before buyer demo.

### 4. Admin/content governance is implemented but not demo-proven

Unauthenticated admin endpoints returned 401, which is good. But admin unlock/import/generate/publish/analytics were not production-proven with a real admin token. The local full e2e run also failed every admin UI unlock test in this run, so admin demo confidence is not green.

Closure gate: run `npm run e2e:prod-admin-smoke` with sanctioned `E2E_ADMIN_TOKEN`, prove import -> list -> publish/archive -> analytics, and investigate why local admin unlock tests stalled.

## P2 Findings

- Buyer trust is honest but still thin: About has scope, pricing, privacy/support language, but lacks formal privacy/terms, named support/contact path, sample sponsor report, and pilot terms.
- Some mobile tap targets are below thumb-comfort size, especially small text buttons/links.
- Lesson markdown tables/code blocks may overflow on mobile without explicit overflow wrappers.
- Results "toughest exercises" is not very actionable if it shows ids instead of prompt/concept/recovery action.
- Native Korean review remains open for draft lessons; do not market those as expert-reviewed.
- Production smoke cleanup is non-fatal in the test, so failed cleanup could leave synthetic accounts silently.

## What Is Ready

- Public shell and About route load.
- Backend canonical health is green.
- Core password learner journey is production-proven today via synthetic account smoke.
- Mobile happy-path evidence exists from prior artifacts and the current mobile read-only pass found no basic public-route breakage.
- Backend unit/API test suite is green.
- Frontend build is green.
- Backend observability is materially better than prior reports; Tempo has shown `baeu-backend` traces in agent evidence.

## Not Observed / Not Claimed Ready

- Google OAuth completion.
- Real reset email delivery to inbox.
- Admin production content workflow with real admin token.
- True offline/PWA behavior.
- Backend-down UX in a real browser session.
- Native Korean teacher sign-off.
- Buyer/sponsor reporting workflow.

## Next Gates

1. Fix session ownership enforcement in practice APIs.
2. Add durable inline API-failure/retry states, especially mobile.
3. Decide Google/Resend: configure and smoke, or hide/label.
4. Repair/prove admin smoke.
5. Add sponsor trust surface before buyer demo.
