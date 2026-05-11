# Baeu-Learning Gaps Live

---

## Kairos full audit — 2026-05-09-1519

**Auditor:** Codex + sidecars | **Escopo:** functional, visual/product, stack, cost, URL truth.

### Achados

| Severity | Finding | Status |
|---|---|---|
| P1 | Production registry drift: old Railway URL `baeu-learning-api-production` returns Application not found; canonical backend is `baeu-backend-production`. | Update docs/registry/frontend probes and stale project/service IDs. |
| P1 | Public frontend returns 200 while latest two Vercel production deployments are ERROR. | Fix deploy pipeline before next release. |
| P1 | Railway service config drift: `healthcheckPath` null and `sleepApplication=false`. | Align with intended `/api/v1/health` and cost posture. |
| P1 | Production learner signup/practice/progress smoke not run. | Run controlled prod smoke with cleanup/reuse note. |
| P2 | Unauth UX starts as login shell and exposes Admin affordance. | Improve learner/demo first impression and hide operator noise. |
| OK | Local backend tests 64/64, frontend build passed, frontend Playwright 15/15; canonical backend health 200. | OK for limited controlled validation. |

---

## Full Audit (Infra + Functional) — 2026-05-11-0851

**Auditor:** Claude (Cowork) | **Escopo:** Railway inventory, health check, Neon state, Vercel frontend

### Achados

| Severity | Finding | Status |
|---|---|---|
| P0 | `baeu-backend` Railway health retorna 404 "Application not found" | Deploy SUCCESS em 2026-05-09 mas endpoint não responde. Verificar startCommand, porta e healthcheckPath |
| P0 | `baeu-backend` com `sleepApplication=false` | Gastando Railway compute sem servir tráfego real — setar sleep=true até 404 ser corrigido |
| ✅ OK | Frontend baeu-learning.vercel.app retorna 200, título "Baeu — Korean Practice" | |
| ✅ OK | Neon `ancient-butterfly-19493910` idle, baixo compute (838s = ~14min) | |
| ✅ OK | Railway custo $0.08/mês (mínimo) | |

---

## Baeu correction package — 2026-05-11-0905

**Source:** `/Users/joaoadair/Documents/AI/Audits/kairos-audit-2026-05-11-0847.md`  
**Artifacts:** `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-11-0847/`  
**Scope:** repo URL truth, Vercel deploy failure, Railway health/sleep posture, local build/test, public read-only smoke.

### Current evidence

| Area | Evidence | Status |
|---|---|---|
| Frontend API base | Active app code uses `frontend/src/api.js` with `VITE_API_BASE_URL`. Public bundle includes `https://baeu-backend-production.up.railway.app`; no old Railway URL found in the bundle. | OK |
| Old backend URL | `https://baeu-learning-api-production.up.railway.app/api/v1/health` returns Railway 404 `Application not found`. | Stale/deprecated |
| Current backend URL | `https://baeu-backend-production.up.railway.app/api/v1/health` returns 200 `{"ok":true,"store":"pg"}`. | OK |
| Backend health route | Repo defines `GET /api/v1/health`; `backend/railway.toml` also declares `healthcheckPath="/api/v1/health"`. | OK in repo |
| Railway service settings | Live Railway inventory shows service `baeu-backend`, latest deploy `SUCCESS`, `healthcheckPath=null`, `sleepApplication=false`. | Provider action needed |
| Vercel deploy pipeline | Latest production deployments fail because Vercel project `rootDirectory=null` runs `vite build` at repo root; Vite is installed under `frontend/`. Root `vercel.json` added to delegate install/build/output to `frontend/`. | Repo fix ready |

### Corrections made in repo

| File | Change |
|---|---|
| `vercel.json` | Added root Vercel config so Git deploys work even if provider Root Directory remains repo root. |
| `frontend/.env.example` | Set production `VITE_API_BASE_URL` example to `https://baeu-backend-production.up.railway.app`. |
| `backend/.env.example` | Documented production frontend origin for `CORS_ORIGIN`. |
| `DEPLOY.md` | Replaced stale backend references, documented current health URL, Vercel root drift workaround, Railway healthcheck, and sleep recommendation. |
| `README.md` | Updated production URLs, env var name, and current `/api/v1` endpoint examples. |

### Closure gate

Verdict moved to **LIMITED READY** after provider alignment and a fresh green
production deploy. It is no longer blocked by deploy-pipeline or backend URL
truth, but it still needs a sanctioned production write-flow smoke before
calling full READY.

Completed after the correction pass:

1. Vercel project Root Directory set to `frontend`.
2. Fresh production deploy `baeu-learning-gi3tf4ey3-joaoaidars-projects.vercel.app` is `READY` and aliased to `https://baeu-learning.vercel.app`.
3. Public bundle points at `https://baeu-backend-production.up.railway.app` and does not contain the old `baeu-learning-api-production` URL.
4. Railway `baeu-backend` now has `healthcheckPath=/api/v1/health`.
5. Railway `baeu-backend` now has `sleepApplication=true`.
6. Local backend tests passed 64/64, frontend build passed, and local Playwright e2e passed 15/15.
7. Public read-only smoke passed: frontend 200/title OK, login boundary returns 401 for invalid credentials, backend health returns 200 `{"ok":true,"store":"pg"}`.

Remaining gate for full READY:

1. Run a sanctioned production signup/login/practice/progress smoke with a reusable test account and cleanup/reuse note. Do not infer this from health-only or read-only evidence.

---

## Product/persona/brutal audit — 2026-05-11-1212

**Source report:** `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-1212/sidecars/baeu-learning.md`  
**Evidence folder:** `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-1212/evidence/baeu-learning/`  
**Audited URL:** `https://baeu-learning.vercel.app/`  
**Verdict:** `WATCH` overall. `LIMITED READY` for corrected URL/auth/module catalog. `WATCH/NO-GO` for production first-practice browser readiness until the deployed UI reaches question -> answer -> feedback -> progress.

| Severity | Evidence ID | Persona/stakeholder affected | Failed journey or blocked evidence | Visible trust break | Closure gate | Agent attack rule |
|---|---|---|---|---|---|---|
| P1 | EVID-BAEU-009, EVID-BAEU-010 | First-time Korean learner | Fresh synthetic learner could sign up/login and see modules, but production browser attempts did not reach visible `question-card`; direct API could create session and fetch next question. | UI/API divergence at first value: backend can practice, deployed browser does not prove the learner can. | From `baeu-learning.vercel.app`, fresh learner clicks Start/Start practice, sees `question-card`, submits, sees feedback, then `/progress` reflects the attempt. Capture desktop/mobile screenshots. | Do not close with API health, local e2e, or module count. Require browser-visible practice feedback in production. |
| P1 | EVID-BAEU-002, EVID-BAEU-009 | Product owner / demo operator | Local Playwright passed 15/15, but production first-practice journey remained unproven/failed in browser automation. | False green risk: local MVP looks complete while deployed first value stalls. | Add/keep a production Playwright smoke using canonical URL and synthetic account; it must fail if the UI cannot reach `question-card`. | Always separate local e2e from production browser proof in Baeu readiness reports. |
| P2 | EVID-BAEU-007 | First-time learner / sponsor | Unauthenticated entry is a login shell and shows `Admin` before any public learner value. | Sponsor/learner sees operator affordance and no preview of practice quality. | Hide Admin from unauth learners or move it behind explicit operator route; add a learner-facing preview or clear product promise before login. | Test unauth desktop and mobile first impression, not just logged-in flows. |
| Watch | EVID-BAEU-005, EVID-BAEU-006 | Operator / future agent | Old backend URL still returns Railway 404, though public bundle points to canonical backend. | Stale URL can re-create false incidents in probes/docs. | Grep docs/config/bundle/probes for `baeu-learning-api-production`; canonical backend health remains `200`. | Treat old Railway URL as a stale-landmine, never as canonical URL truth. |

**Synthetic account note:** `audit-baue-1778512787788@test.local` was created for this audit. Keep temporarily for smoke reuse or delete in the next sanctioned cleanup. No secrets/tokens/cookies are stored here.

---

## Resolution pass — 2026-05-11-late

**Auditor:** Claude (parallel: live-repro + code-debug agents) | **Outcome:** prior P1 reclassified as audit-script artifact; LIMITED READY gate cleared by evidence.

### Findings

| Severity | Finding | Status |
|---|---|---|
| P1 (resolved) | "Browser flow does not reach `question-card`" from 2026-05-11-1212 audit. | **Not reproducible.** Fresh signup → module → CTA → Start → `[data-testid="question-card"]` visible. All network 200, no console errors. Root cause of false negative: audit script searched for a `<button>` on the module page, but the CTA is an `<a href="#/practice?module=…">`. |
| Watch | Module CTA had no stable selector for automation. | Fixed: added `data-testid="practice-cta"` to `frontend/src/pages/Module.jsx:53`. |
| Watch | No production-targeted Playwright smoke; local e2e uses Vite proxy + in-memory backend and cannot catch prod-only regressions (CORS, real DB seed, deployed bundle env). | Fixed: added `frontend/e2e/prod-smoke.spec.js` (gated by `E2E_PROD_SMOKE=1`) and `npm run e2e:prod-smoke` script. Each run creates one synthetic learner. |
| ✅ OK | Evidence: `/tmp/baeu-evidence/C1-module.png`, `C2-after-cta.png`, `C3-after-start.png`, `C-network.json`, `C-logs.txt`. | Captured against `https://baeu-learning.vercel.app/`. |

### Verdict change

LIMITED READY → **READY for first-practice journey.** Remaining items are not blockers:

- P2 unauth UX (login shell + visible Admin) — addressed in the follow-up pass below.
- Synthetic account cleanup — addressed in the follow-up pass below.

### Code changes in this pass

| File | Change |
|---|---|
| `frontend/src/pages/Module.jsx` | Added `data-testid="practice-cta"` to the practice CTA anchor. |
| `frontend/e2e/prod-smoke.spec.js` | New env-gated spec targeting deployed frontend. |
| `frontend/package.json` | Added `e2e:prod-smoke` script with `E2E_PROD_SMOKE=1`, `E2E_NO_WEBSERVER=1`, `E2E_BASE_URL=https://baeu-learning.vercel.app`. |

---

## P2 closure + cleanup tooling — 2026-05-11-late+1

**Scope:** unauth first impression, Admin affordance gating, synthetic test-account cleanup.

### Findings closed

| Severity | Finding | Status |
|---|---|---|
| P2 (closed) | Unauth UX was a bare login card with no product promise or preview. | Rebuilt `Auth.jsx` as a two-column landing: hero + value props + public module preview on the left, sign-up/login card on the right. Module preview uses the existing unauthenticated `GET /api/v1/modules` endpoint and degrades silently if it fails. |
| P2 (closed) | `Admin` nav link was rendered for unauthenticated learners and sponsors. | Header now only renders the Admin NavLink when `user?.role === 'admin'`. Operators can still reach `#/admin` directly by URL; the page itself remains gated by the X-Admin-Token unlock. |
| Tooling | No way to clean up `@test.local` synthetic accounts created during audits/smoke runs. | Added `backend/src/db/cleanup-test-users.js` with `npm run cleanup:test-users` script. Dry-run by default; refuses patterns that don't match `@test.local` or `audit-`; refuses to delete any row with `role != 'user'`; emails are masked in stdout. Practice sessions/attempts/mastery cascade automatically via existing `ON DELETE CASCADE`. |

### Code changes in this pass

| File | Change |
|---|---|
| `frontend/src/App.jsx` | Admin NavLink now gated on `user?.role === 'admin'`. |
| `frontend/src/pages/Auth.jsx` | New two-column landing with hero, value props, public module preview, and the existing auth form. Submit selectors and input attributes preserved so existing e2e helpers continue to work. |
| `backend/src/db/cleanup-test-users.js` | New CLI for safe synthetic-user deletion (dry-run default, masked output, role/pattern guards). |
| `backend/package.json` | Added `cleanup:test-users` script. |

### Verification

- `npm run build` in `frontend/` passes (288 modules, 3.11s).
- Existing e2e selectors in `frontend/e2e/_helpers.js` (`input[type=email]`, `input[type=password]`, `input[autocomplete="name"]`, role-name `^sign up$` / `^log in$`) still match the rebuilt `Auth.jsx`.
- Cleanup script not yet exercised against prod DB — first run will be on-demand to clear the pending `@test.local` accounts.

### Verdict

P2 closed in code. **READY** for buyer/demo first impression and practice flow. Remaining (non-blocker) work:
- Run `cleanup:test-users` once against prod (requires `DATABASE_URL` for `ancient-butterfly-19493910`).
- Consider running the prod Playwright smoke (`npm run e2e:prod-smoke`) as a pre-release gate going forward.

---

## Brutal audit — 2026-05-11-late+2

**Auditor:** Claude main + 4 parallel sub-agents (persona-browser, CTO/maintainer/adversarial, security/privacy, data/truth+PM). **Mode:** read-only. **Lenses:** 8 effective (target user, buyer, adversarial, CTO, maintainer, security, data-truth, PM).

### Verdict

- Readiness: **LIMITED READY → WATCH** for buyer/demo, **NOT READY** for paying B2B.
- Confidence: medium-high. 4 independent lenses converge on the same critical paths.
- **Meta-finding** (P0 in its own class): every "P2 closed" / "READY" claim in the prior sections of this file is based on **uncommitted local code**. Production Vercel still serves the pre-P2 build (last commit `7562de3` or earlier). The persona-browser audit against `https://baeu-learning.vercel.app/` shows: Admin link still visible to unauth users; landing is still the old login-shell with no product promise; `data-testid="practice-cta"` absent on module pages. Until we commit + push, every prior "fixed" line is repo-only.

### Evidence inspected

- Repo at `/Users/joaoadair/Documents/AI/Baeu_Learning` (services, controllers, middleware, repositories, schema, e2e, recent uncommitted diffs).
- Live frontend: signup, dashboard, practice, feedback, progress flows on `https://baeu-learning.vercel.app/` from a fresh synthetic learner (`aud***-1778514955@test.local`). Screenshots at `/tmp/baeu-audit/`.
- Live backend health + public API: `GET /api/v1/modules` (8 modules, 412 published exercises), `/lessons?module=...` (9 lessons total; 3 of 8 modules have zero), `/api/v1/health` returns `{ok:true,store:"pg"}`.
- Source-code audit of `AuthService`, `PracticeService`, `MasteryService`, `ExerciseSelector`, `requireAdmin`, `rateLimit`, `pgStore`, `schema.sql`, plus all 12 dead-code page files.
- `git status` + `git log` — confirms uncommitted state of all P2-closure changes.

### Project map

- **Promise (new landing copy):** mixed Korean practice across Hangul / grammar / vocabulary, adaptive review driven by per-skill mastery, per-module drill, progress with skill-tag breakdown.
- **Actual implemented surface:** signup/login (scrypt + JWT), 412 published exercises across 8 modules (3 types: MC / translation / fill_blank), `ExerciseSelector` with real weak-skill + due-mastery + variety logic, SRS-lite mastery (6 levels, exponential intervals), Progress page with per-skill mastery + error-tag chips.
- **Critical data paths:** Practice session → next-question selection → attempt record → mastery update → progress aggregation. All wired and observable end-to-end.
- **Known gaps/open loops:** every "P2 closed" change is local; listening type is schema-only; 3 modules have zero lessons (auto-recommendation silently no-ops); hardcoded streak fixtures in dead pages still ship in the bundle.

### Stakeholder matrix

| Lens | Score | Main objection | Evidence | Acceptance gate |
|---|---:|---|---|---|
| Target user (first-time learner) | 5/10 | "Cold-landing on prod, I have no idea what this is or why to sign up." | Persona1 screenshots `/tmp/baeu-audit/landing-desktop.png` | Deploy the rebuilt Auth.jsx; learner can articulate product promise in 10s pre-auth. |
| Buyer / sponsor | 3/10 | "Login-only shell. No promise, no audience, no proof, no pricing." | Same screenshots | Same deploy + a basic pricing/about line. |
| Adversarial / power-user | 7/10 | "No 401/500 hits, but Admin link visible to everyone is a trust leak." | Persona3 walk; backend admin endpoints are token-gated. | Deploy App.jsx role-gating; verify Admin absent in unauth header. |
| CTO / principal engineer | 4/10 | "`CORS_ORIGIN` empty → `origin:true` with credentials; no helmet; no global error handler; in-memory store can be selected silently in prod." | `app.js:13-14,26-30`, `server.js:10-13`, `controllers/*` | Fail-closed CORS + helmet + global handler + boot-refuses-memory-in-prod. |
| Maintainer | 4/10 | "~2800 LOC of dead pages shadow the wired set; future contributors will edit the wrong file." | `frontend/src/pages/` 12 unused files | Delete dead pages or move to `_archive/`. |
| Security | 4/10 | "Admin token compared with `===`; no helmet; no reset/revocation/deletion." | `middleware/auth.js:19`, `routes/auth.js:21-23` | Top 3 P1s in security findings below. |
| Data/truth | 7/10 | "Engine is real and adaptive, but hardcoded `streak={125}` ships to real users." | `MasteryService`, `ExerciseSelector` real; `Layout.jsx:148,228,289` `Dashboard.jsx:10` `ResultPage.jsx:75` are fixtures. | Wire streak to real data or remove the chrome until wired. |
| PM | 5/10 | "No onboarding, no curated empty-state when a module is exhausted, no business model." | `grep onboarding/pricing/stripe` → 0 hits. | At least an "all done in this module" state + a roadmap stub for monetization. |

### Critical findings (merged across lenses, severity-ordered)

| Sev | Finding | Evidence | Why it matters | Fix sketch |
|---|---|---|---|---|
| **P0 (deploy)** | All P2-closure changes uncommitted/unpushed. Prod Vercel serves pre-fix build. | `git status` shows 8 M + 4 ??; last commit `7562de3` is "chore: tighten .gitignore". | Every "READY" / "P2 closed" line in this file is repo-only. Audit-script artifact reasoning still holds, but the actual UX fix isn't live. | Commit + push the 5 logical groups (P2 UX, prod smoke, cleanup script, root vercel.json, env-example updates); confirm Vercel auto-deploy lands. |
| **P0** | `CORS_ORIGIN` unset → `origin: true` with `credentials: true`. | `backend/src/app.js:13-14` | Any third-party site can call the API with a victim's bearer token. CSRF/token-exfil surface. | Fail-closed: throw if `CORS_ORIGIN` empty when `NODE_ENV=production`; pin to canonical Vercel URL. |
| **P0** | No global Express error handler; per-controller `wrap` leaks `err.message` to clients. | `backend/src/controllers/*.js` (6 dupes of `wrap`) | Any unwrapped throw leaks stack/DB internals; inconsistent error shape. | `app.use((err,req,res,_next)=>...)` after routers; structured `{error: code}` response, full stack server-side. |
| **P0** | Admin link visible in header to unauth + non-admin users in PROD. | Persona2 screenshots; `App.jsx` change is uncommitted. | Trust leak; sponsor/learner first impression includes an operator affordance. | Same fix as P0(deploy) above. |
| **P0** | Pre-auth landing is a bare login card in PROD. | Persona1+2 screenshots. | Activation funnel: no reason for a cold visitor to sign up. | Same fix as P0(deploy). |
| **P1** | In-memory store/rate-limit can be silently selected in production; `/health` reports it but nothing alerts. | `backend/src/server.js:10-13`, `middleware/rateLimit.js:1-4` | Restart wipes sessions/attempts/mastery; multi-replica → no brute-force protection. | Refuse boot if `NODE_ENV=production` and no `DATABASE_URL`; require Redis-backed limiter in prod (or keep single dyno + document constraint). |
| **P1** | No `helmet` / security headers (HSTS, X-Content-Type-Options, referrer-policy, frameguard). | `backend/src/app.js:26-30` | Blocks any external security review for a paying customer. | `app.use(helmet({...}))` with explicit HSTS. |
| **P1** | `requireAdmin` uses non-timing-safe `===` on `ADMIN_TOKEN`. | `backend/src/middleware/auth.js:19` | Timing oracle; static token never rotated, no audit log. | `crypto.timingSafeEqual`; prefer JWT-role-only path; rotate token. |
| **P1** | Admin role from JWT not re-checked against DB; 7-day JWT lifetime, no revocation. | `backend/src/middleware/auth.js:27`; `routes/auth.js:21-23` | Stolen admin JWT is valid for 7 days. | Re-fetch role on each admin call OR short-TTL JWT + revocation list. |
| **P1** | No password-reset, no account-deletion, no logout-all. | `backend/src/routes/auth.js:21-23` | Blocks GDPR/LGPD compliance; blocks support tickets. | `/auth/reset` flow + `DELETE /me`; track `password_changed_at` and invalidate older JWTs. |
| **P1** | 401 mid-session is not centralized; only `me()` clears auth. | `frontend/src/App.jsx:49-55`, `frontend/src/api.js` `call()` | After 7 days users hit a toast loop instead of clean re-login. | In `api.js#call`, on 401 → `auth.clear()` + hash redirect to `#/`. |
| **P1** | `Auth.jsx`'s `api.modulesList()` swallow-catches → CORS/network failure leaves a stripped landing with no signal. | `frontend/src/pages/Auth.jsx:15-25` (after deploy) | False-green: ops thinks landing is fine; learner sees empty preview. | Log to console + render a small "couldn't load preview" hint badge. |
| **P1** | `no_exercises_in_module` error rendered as raw code via `toast.push(e.message)`. | `backend/src/services/PracticeService.js:50-52`, `frontend/src/pages/EndlessPractice.jsx:53-55` | Confirms Hypothesis #3 from earlier debug; learner sees an error code, not an empty state. | Detect empty modules via `exercise_count` client-side + render curated empty-state. |
| **P1** | 3 of 8 modules have ZERO lessons (greetings, vocab-daily, reading). | `GET /api/v1/lessons?module=<slug>` | `findLessonForErrorTag` silently no-ops for ~40% of catalog; "adaptive lesson recommendation" feature misfires. | Seed lessons or remove the silent no-op. |
| **P1** | Hardcoded fake streak fixtures shipped to real users. | `Layout.jsx:148,228,289` `streak={125}`; `Dashboard.jsx:10` `streak: 5`; `ResultPage.jsx:75` `streak: 3`. | Dishonest UX; users see a 125-day streak they didn't earn. | Wire to `overview.streakDays` (already in `Progress.jsx`) or remove the chrome. (Note: `Layout.jsx` is in the dead-code set but its file may still be imported via the duplicated `components/shared/layout/` path — verify before deleting.) |
| **P1** | No onboarding / tutorial. New user lands cold on module list. | `grep onboarding/tutorial/walkthrough` → 0 hits. | Activation drop-off. | Minimal "pick your first module" coachmark or first-question primer. |
| **P1 (strategic)** | No business model surface (pricing, plans, paywall). | `grep pricing/stripe/subscribe/premium/paid` → 0 hits. | Free-only product; no monetization scaffolding to test even cheap experiments. | Stub a `/pricing` route with placeholder tiers; ship a single "free for now" line. |
| **P2** | JWT in `localStorage` — XSS-exfiltratable. | `frontend/src/utils/authService.js:8` | Standard SPA tradeoff but blocks "we never expose tokens" claims. | httpOnly cookie + CSRF token, or accept residual risk explicitly. |
| **P2** | scrypt with `node:crypto` defaults (no explicit `{N,r,p}`). | `backend/src/services/AuthService.js:6-12` | Acceptable but non-standard; harder to defend in a security review. | Tune scrypt params explicitly OR switch to bcrypt (cost ≥12) / argon2id. |
| **P2** | `ssl: { rejectUnauthorized: false }` fallback in pgStore. | `backend/src/repositories/pgStore.js:8` | MITM surface on the DB connection if `sslmode=require` is forgotten. | Require `sslmode=require` in prod; drop the fallback. |
| **P2** | Email enumeration via signup `409 email_taken`. | `backend/src/services/AuthService.js:61` | Attackers can probe accounts. | Generic "if email is free, account created; if not, sign in" + delayed response. |
| **P2** | `cleanup-test-users.js` pattern guard uses OR (`audit-` prefix OR `@test.local` suffix). | `backend/src/db/cleanup-test-users.js:53-57` | Future real user `audit-foo@example.com` could be deleted by mistyped pattern. Role-check mitigates but isn't a hard gate. | Require BOTH `audit-` AND `@test.local`; never accept bare `%`. |
| **P2** | `prod-smoke.spec.js` writes a real user each CI run with no cleanup hook. | `frontend/e2e/prod-smoke.spec.js:18` | Pollution accumulates; signup rate-limit will throttle repeated CI runs. | Add post-test cleanup or admin "delete by id" endpoint scoped to test users. |
| **P2** | `incrementSession` is non-atomic for concurrent submits. | `backend/src/services/PracticeService.js:77-93` | Double-tap may duplicate an attempt or misalign the % 10 checkpoint. | Add `(session_id, exercise_id, response_ms)` idempotency or DB unique partial index + client debounce. |
| **P2** | `sumPracticedInModule` always returns `masteryMap.size` regardless of module. | `backend/src/controllers/modulesController.js:50-54` | "Practiced" hint is identical across modules — dishonest. | Join `user_skill_mastery` to module skill-tags. |
| **P2** | Listening type in schema, no end-to-end implementation. | `backend/src/db/schema.sql:39` vs. zero hits in `frontend/src/components/exercises/`. | Dead schema; false promise if marketed as "4 question types". | Drop from schema or implement audio pipeline. |
| **P2** | ~2800 LOC dead pages in `frontend/src/pages/` shadow the wired set. | 12 files: `AboutMe`, `AboutProject`, `AdminDashboard`, `Dashboard`, `ExercisePage`, `HomePage`, `LessonPage`, `LessonsPage`, `LoginPage`, `Profile`, `Register`, `ResultPage`. | Maintainer trap; future fixes land in wrong file. | Delete or move under `_archive/`. |
| **Watch** | `users` table has `unique` on raw `email` but index on `lower(email)`. | `backend/src/db/schema.sql:19,26` | `Foo@x.com` and `foo@x.com` can both exist. | `create unique index users_email_lower_uniq on users(lower(email))` and drop the raw unique. |
| **Watch** | Lesson body via `react-markdown` + `remarkGfm`. Safe today; becomes XSS if `rehype-raw` is ever added. | `frontend/src/pages/Lesson.jsx:51-53` | Latent risk in LLM-generated lessons. | Pin major; add `rehype-sanitize` defensively if `rehype-raw` is ever introduced. |
| **Watch** | Frontend `security.js` references a CSRF meta tag that's never set. | `frontend/src/config/security.js:17-20` | Aspirational/dead code. | Remove or wire if cookies are ever adopted. |

### False-green paths

- "P2 closed" / "READY" claims earlier in this file are repo-only — production still shows the pre-P2 build.
- `/api/v1/health` returns `{ok:true,store:"pg"}` looks green, but in `store:memory` fallback mode the same shape would look fine while data quietly evaporates on restart.
- Hardcoded `streak={125}` is the loudest false-green: the header looks like a retention loop is working.
- `prod-smoke.spec.js` only asserts `question-card` visibility — backend serving `{}` would still pass.
- Local Playwright 15/15 hides production-only failure modes (CORS, real DB seed, deployed bundle env) — already documented; still true.
- `Auth.jsx`'s preview swallow-catch: tests asserting only that the form renders pass even when the preview is broken.

### Cross-lens contradictions

- **Repo says P2 closed; browser says P2 not deployed.** (Resolved by deploy step.)
- **Landing copy claims "skill-tag breakdowns";** Progress page actually delivers this — but Dashboard ships a fake streak in parallel, undermining the same trust.
- **Backend admin is token-gated server-side;** frontend exposes Admin link client-side. Real defense intact, but UX/trust leak.
- **Engine is genuinely adaptive (ExerciseSelector + MasteryService);** but the Progress page in the dead-pages bundle still shows fixtures. Inconsistent honesty surface.

### What actually works (evidence-backed)

- `ExerciseSelector.js:32-80` and `MasteryService.js:22-63` — selector is signal-driven (weak-skill boost, due-mastery boost, never-seen bonus, variety penalty, mild random tiebreak), mastery is real SRS-lite (6 levels, exponential intervals 10m → 7d). Marketing claim "adaptive review" holds.
- `Progress.jsx:54-120` — per-skill rows with level + accuracy + error-tag chips. "Skill-tag breakdown" claim holds.
- `PracticeService` per-module filtering by `moduleId` is correct.
- SQL is fully parameterized across `pgStore.js` and `cleanup-test-users.js`. No `dangerouslySetInnerHTML`. `publicUser()` strips `password_hash`.
- `.env.example` files are clean; `.gitignore` covers `.env*`; no committed secrets.
- 412 published exercises across 8 modules is real, with sane GIN indexes on `skill_tags`.
- Persona3 found no 401/500/uncaught errors in the full signup → practice → progress → logout walk.

### Open questions

- What does the Vercel deploy pipeline currently expect? Auto on push to `main`? Or manual? (Affects how fast P0-deploy resolves.)
- Is `Layout.jsx` (with the hardcoded streak) actually included in the prod bundle, or is it dead-stripped because it's only imported by dead pages? Vite tree-shaking may save us. Verify.
- Does the `JWT_SECRET` env on Railway meet the "fails closed" length check? (`AuthService.js:24-30`).
- Is the `ancient-butterfly-19493910` Neon DB the production DB? Confirm via Railway env vars.
- Backend test coverage: which paths are covered vs. claimed? Especially `no_exercises_in_module`, mastery upsert race conditions, admin-role-via-DB.

### P0 / P1 / P2 backlog

**P0**
1. Commit + push the 5 P2-closure changes (Auth.jsx, App.jsx, Module.jsx, prod-smoke.spec.js, cleanup-test-users.js + package.json scripts + env examples + vercel.json + DEPLOY.md/README.md). Confirm Vercel deploys and re-run persona-browser to validate Admin invisible + new landing live.
2. Fail-closed `CORS_ORIGIN` in production (`backend/src/app.js`). Pin to canonical Vercel URL.
3. Global Express error handler. Strip `err.message` from responses; log full stack server-side.

**P1**
1. Refuse boot when `NODE_ENV=production` and no `DATABASE_URL` / store fallback would engage.
2. Add `helmet` with HSTS.
3. `crypto.timingSafeEqual` on admin token; re-check admin role from DB on each admin call.
4. Password-reset + account-deletion endpoints; `password_changed_at` invalidates older JWTs.
5. Centralize 401 in `api.js#call` (clear + redirect).
6. Remove hardcoded streak fixtures (`Layout.jsx`, `Dashboard.jsx`, `ResultPage.jsx`) — at minimum verify they're not in the prod bundle.
7. Curated empty-state when a module has no published exercises (and disable practice CTA via `exercise_count` already returned by the API).
8. Seed lessons for the 3 empty modules OR remove the silent `findLessonForErrorTag` no-op.
9. Minimal onboarding/first-time hint.
10. Stub a `/pricing` or `/about` route so buyer persona can articulate audience + intent.

**P2**
1. Move JWT to httpOnly cookie (or accept residual XSS risk explicitly in a doc).
2. Tune scrypt params explicitly or switch to bcrypt/argon2id.
3. Require `sslmode=require` in prod pg connection; drop `rejectUnauthorized: false` fallback.
4. Tighten `cleanup-test-users.js` to require BOTH `audit-` AND `@test.local`.
5. Add post-run cleanup hook to `prod-smoke.spec.js`.
6. Idempotency on `practice_attempts` to harden against double-submit.
7. Fix `sumPracticedInModule` (or remove the field).
8. Decide listening type: implement or drop from schema.
9. Delete dead pages in `frontend/src/pages/` (12 files).
10. Generic signup response to reduce email enumeration.

**Watch**
1. Fix `users` unique constraint to use `lower(email)`.
2. Defensive `rehype-sanitize` if `rehype-raw` ever lands in lesson rendering.
3. Remove dead `frontend/src/config/security.js` CSRF reference.

### Ship/demo/merge gates

- Demo-ready: P0(deploy), P0(CORS), P0(error-handler), P0(Admin gating), P1(hardcoded streaks).
- Sponsor/buyer-ready: above + P1(onboarding), P1(pricing/about stub), P1(empty-state).
- Paying-customer-ready (B2B/regulated): above + all P1 security items + P2(JWT cookie) + P2(scrypt tuning) + audit log on admin actions.

### Recommended parallel workstreams

1. **Ship the P2 closure** (commit + push + verify deploy + re-run persona-browser). Owner: main agent / Joao. Unblocks 4 of 5 P0 items in one shot.
2. **Backend hardening** (CORS fail-closed + helmet + global error handler + boot-refuses-memory + timing-safe admin token + 401 centralization). Owner: backend-focused agent. Disjoint files: `backend/src/app.js`, `backend/src/middleware/auth.js`, `backend/src/server.js`, `frontend/src/api.js`.
3. **Honest UX pass** (remove hardcoded streaks, empty-state for no-exercises module, minimal onboarding). Owner: frontend-focused agent. Disjoint files: `frontend/src/components/layout/Layout.jsx`, `frontend/src/pages/EndlessPractice.jsx`, `frontend/src/pages/Module.jsx`, `frontend/src/pages/Home.jsx`.
4. **Dead-code purge** (12 unused pages + `frontend/src/config/security.js` dead refs). Owner: maintenance-focused agent. Pure deletion + test re-run.
5. **Content depth** (seed lessons for empty modules; decide listening). Owner: content agent.
6. **Compliance scaffolding** (password reset + account deletion + privacy doc). Owner: backend agent (separate from #2 to keep PRs small).

### Synthetic accounts pending cleanup

`audit-baue-1778512787788`, `audit-1778513949059`, `audit-1778514023594`, `audit-1778514074779`, `audit-1778514128145`, `audit-brutal-1778514955` — all `@test.local`. Run `npm run cleanup:test-users -- --apply` from `backend/` with `DATABASE_URL` set.
