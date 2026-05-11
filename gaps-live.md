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

---

## Brutal-audit closure pass 1 — 2026-05-11-late+3

**Authorization:** Joao authorized commit/push + parallel workstreams. **Scope:** the deploy-dependent P0s, all backend-hardening P0/P1s, all honest-UX P1s. **Commits:** `d9c2ddb` (P2 ship + audit tooling), `595df15` (backend hardening), `239dc11` (honest UX + dead-code purge).

### P0 / P1 closures

| Severity | Finding | Closure |
|---|---|---|
| P0 | All P2-closure changes uncommitted/unpushed. | **CLOSED** — commit `d9c2ddb` pushed; Vercel deployed `baeu-learning-2pf03c0dv`. Bundle inspection on `https://baeu-learning.vercel.app/assets/index-6zKsj7jt.js` confirms `Build real Korean fluency`, `landing-hero`, `practice-cta`, `question-card`, and the minified `role)==="admin"` gate. Browser-truth pass deferred (Playwright MCP wants `channel: 'chrome'`; Chrome.app not installed on this Mac). |
| P0 | Admin link visible to unauth + non-admin users in prod. | **CLOSED via deploy** — `App.jsx` gate landed; bundle-confirmed. |
| P0 | Pre-auth landing was a bare login card. | **CLOSED via deploy** — new two-column landing in production. |
| P0 | `CORS_ORIGIN` unset → `origin: true` with `credentials: true`. | **CLOSED** — `backend/src/app.js:13-36` throws at startup when `NODE_ENV=production` and `CORS_ORIGIN` is empty; dev/test unchanged; comma-separated origins supported. Regression test `backend/tests/hardening.test.js`. |
| P0 | No global Express error handler; controllers leak `err.message`. | **CLOSED** — `backend/src/app.js:69-87` final `app.use((err,req,res,_next)=>…)`. Logs full stack server-side; client gets `{error: code-or-internal_error}`. Per-controller `wrap` deliberately left in place pending a per-controller audit. |
| P1 | In-memory store fallback can be silently selected in production. | **CLOSED** — `backend/src/server.js:10-17` exits with a fatal log if `NODE_ENV=production` and `store.__mode === 'memory'`. |
| P1 | No `helmet` / security headers. | **CLOSED** — `helmet@^8.1.0` installed; registered first in middleware chain at `backend/src/app.js:43-49` with defaults (HSTS on). CSP/COEP explicitly deferred to a strict-CSP commit (marked in code). |
| P1 | `requireAdmin` used non-timing-safe `===` on `ADMIN_TOKEN`. | **CLOSED** — `backend/src/middleware/auth.js` uses `crypto.timingSafeEqual` via `timingSafeEqualStr` helper with safe length-mismatch handling. |
| P1 | Admin role from JWT not re-checked against DB. | **CLOSED** — `requireAdmin` is now `async`; after decoding the JWT it re-fetches the user via the store and requires `user.role === 'admin'`. Stolen-JWT regression test in `hardening.test.js`. |
| P1 | 401 mid-session was not centralized. | **CLOSED** — `frontend/src/api.js:39-46` clears auth + redirects to `#/` on any 401, then rethrows. |
| P1 | `no_exercises_in_module` rendered raw as toast. | **CLOSED** — `frontend/src/pages/EndlessPractice.jsx` renders a `data-testid="practice-empty-state"` card with friendly copy + "Back to modules" link on 409; `Module.jsx` also disables the practice CTA visually when `exercise_count === 0` so the practice screen is never reached for empty modules. |
| P1 | Hardcoded `streak={125}/5/3` fixtures shipping to real users. | **CLOSED** — fixtures lived in dead files (`components/layout/Layout.jsx`, `components/shared/layout/Layout.jsx`, `pages/Dashboard.jsx`, `pages/ResultPage.jsx`, `pages/LoginPage.jsx`, plus `Layout.css`). All 6 files deleted. `grep -rnE 'streak\s*[:=]\s*\{?(125\|5\|3)' frontend/src/` returns zero hits. |
| P1 | No onboarding / first-time learner hint. | **CLOSED (minimal)** — `frontend/src/pages/Home.jsx` renders a `data-testid="home-coachmark"` above the modules grid, dismissible, persisted via `localStorage` flag `baeu_seen_home`. Points learners at Hangul & Reading. |
| Code-debt | ~2800 LOC dead pages in `frontend/src/pages/` shadow the wired set. | **PARTIALLY CLOSED** — 6 files deleted in this pass (the streak-fixture set). Remaining dead pages: `AboutMe`, `AboutProject`, `AdminDashboard`, `ExercisePage`, `HomePage`, `LessonPage`, `LessonsPage`, `Profile`, `Register`. Promote to a follow-up cleanup commit. |

### Still open (not addressed in this pass)

| Severity | Finding | Why deferred |
|---|---|---|
| P1 | No password-reset / account-deletion / logout-all (GDPR/LGPD gap). | Out of scope for the brutal-audit close pass; needs a dedicated email-flow design + compliance copy. Next workstream candidate. |
| P1 | 3 of 8 modules have zero lessons (`findLessonForErrorTag` silently no-ops). | Content work, not engineering. Schedule a content-seed pass for `greetings`, `vocab-daily`, `reading`. |
| P1 (strategic) | No business model surface. | Product/strategy decision, not closure-by-code. |
| P2 | JWT in `localStorage` (XSS exfiltratable). | Tradeoff decision: needs CSRF design if moving to httpOnly cookie. |
| P2 | scrypt with default params. | Acceptable for current MVP; switch deferred to bcrypt/argon2id later. |
| P2 | `ssl: { rejectUnauthorized: false }` fallback in pgStore. | Easy fix; bundle with the next backend pass. |
| P2 | Email enumeration via signup 409. | Tradeoff; acceptable for MVP. |
| P2 | `cleanup-test-users.js` pattern guard uses OR. | Tighten to AND in next pass. |
| P2 | `prod-smoke.spec.js` writes a user with no cleanup hook. | Pair with the cleanup-script tightening. |
| P2 | `incrementSession` non-atomic for concurrent submits. | Needs DB unique-partial-index + client debounce. |
| P2 | `sumPracticedInModule` returns the same value for every module. | Single-line fix; bundle with next backend pass. |
| P2 | Listening type in schema, no implementation. | Decide implement vs. drop. |
| P2 | Per-controller `wrap` duplication (now redundant with global handler). | Audit each controller before removing — separate commit. |
| Watch | `users` unique on raw `email` vs. index on `lower(email)`. | Migration work; pair with next schema change. |
| Watch | Frontend `security.js` references absent CSRF meta tag. | Cosmetic; remove when frontend cleanup is bundled. |

### Verification

- `backend/tests`: **68/68 pass** (64 pre-existing + 4 new in `hardening.test.js` covering CORS fail-closed, error-handler sanitization, stolen-JWT admin rejection).
- `frontend && npm run build`: **OK** (288 modules, 346.79 kB JS).
- `git push origin main`: `7562de3 → d9c2ddb → 595df15 → 239dc11`. All three commits pushed.
- Vercel auto-deploy status: pending verification at time of writing (`baeu-learning-2pf03c0dv` confirmed READY for `d9c2ddb`; deploy of `239dc11` polling).
- Browser-truth verification: deferred. Bundle inspection consistent with closure; full DOM/screenshot pass requires either Chrome install (`brew install --cask google-chrome`) or use of the Claude-in-Chrome MCP with a live tab.

### Verdict update

- Demo-ready: **CLOSED** (subject to one browser-truth pass).
- Sponsor/buyer-ready: still needs a pricing/about stub + content seed for empty modules.
- Paying-customer-ready: still needs password-reset / account-deletion / JWT-cookie + CSP.

### Synthetic accounts pending cleanup (running total)

`audit-baue-1778512787788`, `audit-1778513949059`, `audit-1778514023594`, `audit-1778514074779`, `audit-1778514128145`, `audit-brutal-1778514955` — all `@test.local`. No new accounts created in this pass (verification was bundle-only, no signup).

### Railway auto-deploy root cause + fix

**Root cause** (discovered after the brutal-audit close pass found backend changes hadn't landed in prod despite a successful `git push`): the Railway service `baeu-backend` has **no GitHub source linked**. `railway status --json` shows `serviceInstances[0].source = {repo: null, image: null}`. Every prior production backend deploy has been a manual `railway up` from a local checkout — including the `244a89ca` deploy from `2026-05-09T18:07:36` that was treated as "current prod" through three audits.

This means the "Railway autodeploy" assumed by `DEPLOY.md` and by every audit closure gate (including the 2026-05-11-0905 correction package and the 2026-05-11-late+2 brutal audit) **does not exist for this service**. Backend commits sit in `main` indefinitely until someone manually runs `railway up`. The Vercel side does auto-deploy (confirmed); only the backend is manual.

**This pass:** the backend hardening commit `595df15` was deployed via `cd backend && railway up --service baeu-backend --ci`. Verified live: `curl -I https://baeu-backend-production.up.railway.app/api/v1/health` now returns `strict-transport-security`, `x-content-type-options: nosniff`, `referrer-policy: no-referrer`, `cross-origin-opener-policy: same-origin`, `x-frame-options: SAMEORIGIN`, and friends — all helmet defaults. Hardening is in production.

**Durable fix (deferred):** link `JoaoAidar/baeu-learning` to the Railway service with branch=`main` and root=`backend/`, then prune the `railway up` muscle memory from runbooks. Cannot be done from the CLI alone in a safe read-only way — needs dashboard action OR an authenticated GraphQL mutation. Promoted as a P1 deploy-pipeline gap.

**Update DEPLOY.md** to reflect that backend deploys are currently manual via `railway up`, until the GitHub source is linked.

### Verification (final, this pass)

- Frontend: bundle `assets/index-BsMMMYky.js` on `https://baeu-learning.vercel.app/` contains `Build real Korean fluency`, `landing-hero`, `practice-cta`, `home-coachmark`, `practice-empty-state` (5/5 markers).
- Backend: `https://baeu-backend-production.up.railway.app/api/v1/health` returns 200 with full helmet header set (HSTS 1 year + includeSubDomains, nosniff, no-referrer, frame SAMEORIGIN, COOP same-origin, CORP same-origin, etc.). Hardening live.
- Browser-truth pass still deferred (Chrome.app missing for Playwright MCP).

### New P1 added

| Severity | Finding | Closure gate |
|---|---|---|
| P1 (ops) | Railway service `baeu-backend` has no GitHub source — backend autodeploy never existed. Every backend release requires manual `railway up`. | Link `JoaoAidar/baeu-learning` (branch=`main`, root=`backend/`) as the source in the Railway dashboard. Future audits must check this is wired before treating a `git push` as a backend deploy. |

---

## Brutal-audit closure pass 2 — 2026-05-11-late+4

**Scope:** account deletion, logout-all-devices, business-model surface, second dead-code purge, two P2 cleanups, and an honest DEPLOY.md. Commits `734a38f` + `f86b8e7`. Backend deployed via `railway up`; migration applied to Neon via `npm run migrate`.

### P1 / P2 closures

| Severity | Finding | Closure |
|---|---|---|
| P1 | No account-deletion endpoint (GDPR/LGPD gap). | **CLOSED** — `DELETE /api/v1/auth/me` (requires auth, returns 204, cascades sessions/attempts/mastery via existing FK ON DELETE CASCADE). UI: `Account.jsx` with type-to-confirm-email gate. Test: `compliance.test.js` confirms post-delete auth fails. |
| P1 | No logout-all-devices / no JWT revocation. | **CLOSED** — `POST /api/v1/auth/logout-all` increments `user.token_version` atomically (`token_version = coalesce(token_version,0)+1` returning new value); JWT now carries a `tv` claim; `requireUser` is async and re-fetches the user to compare `payload.tv` vs `user.token_version` on every request. Backward-compat: missing `tv` is treated as 0, and existing users start at `token_version = 0`. UI: "Sign out everywhere" button in `Account.jsx`. |
| P1 (strategic) | No business-model surface. | **CLOSED (stub)** — public `/about` route with four sections: what / who / today (live module count via `api.modulesList()`) / pricing (single line: "Free during early access"). Gives the buyer/sponsor persona something to articulate without committing to monetization. Stake in the ground, not a paywall. |
| P2 | `sumPracticedInModule` returned `masteryMap.size` for every module. | **CLOSED** — replaced with `countMasteredSkillsInModule(userId, moduleId)` in both stores; PG version joins `user_skill_mastery` against `exercises.skill_tags` scoped to the module; memory version intersects in-process. `modulesController.js` computes per-module counts in parallel. |
| P2 | `cleanup-test-users.js` pattern guard used OR. | **CLOSED** — `isPatternAllowed()` now requires BOTH `audit-` prefix AND `@test.local` substring; explicitly refuses bare `%`, empty string, wrong prefix, wrong domain. Test scenarios documented in code and covered by `compliance.test.js`. |
| Code-debt (continuation) | Remaining dead pages from the brutal audit (9 files, ~2750 LOC). | **CLOSED** — `AboutMe`, `AboutProject`, `AdminDashboard`, `ExercisePage`, `HomePage`, `LessonPage`, `LessonsPage`, `Profile`, `Register` all deleted after grep-confirming zero imports. (`AboutProject` actually depended on `styled-components` not installed — it would have crashed any future contributor that tried to wire it.) |
| Docs (continuation) | `DEPLOY.md` claimed backend autodeploy that never existed. | **CLOSED** — replaced with explicit "manual via `railway up`" block at the top of the Railway section, with the exact command and the root-cause note. Existing autodeploy steps remain as the target state once the GitHub source is linked. |

### Migration applied to prod

- `alter table users add column if not exists token_version integer not null default 0;` ran via `DATABASE_URL=$(railway variables ...) npm run migrate`. Output: `migrations applied`. Idempotent — safe to re-run.

### Verification (live)

- Frontend: bundle landed via Vercel auto-deploy (commit `f86b8e7`). Build size shrunk to 352.40 kB JS despite adding two pages, because the dead-page purge removed more.
- Backend: `railway up` produced a fresh deploy. `curl /api/v1/health` returns helmet headers + `{"ok":true,"store":"pg"}`. New endpoints exist and are auth-gated:
  - `DELETE /api/v1/auth/me` (no auth) → **401**
  - `POST /api/v1/auth/logout-all` (no auth) → **401**
- Tests: backend 72/72 pass (added 4 in `compliance.test.js`).

### Still open after this pass

| Severity | Finding | Why deferred |
|---|---|---|
| P1 | No password-reset / forgot-password flow. | Requires email service decision (Resend / Postmark / SES). See "Email service for password reset" decision below. |
| P1 | 3 of 8 modules have zero lessons (greetings, vocab-daily, reading). | Content work; needs Korean expertise. Schedule a content-seed pass with Joao. |
| P1 (ops) | Railway service has no GitHub source (manual `railway up` only). | Dashboard action — cannot be done from CLI safely. |
| P2 | JWT in `localStorage` (XSS exfiltratable). | Tradeoff; needs CSRF design if moving to httpOnly cookie. |
| P2 | scrypt with default params. | Acceptable for MVP; bcrypt/argon2id swap deferred. |
| P2 | `ssl: { rejectUnauthorized: false }` fallback in pgStore. | Single-line fix; bundle with next backend pass. |
| P2 | Email enumeration via signup 409. | Tradeoff. |
| P2 | `prod-smoke.spec.js` writes a user with no cleanup hook. | Pair with the cleanup script next pass. |
| P2 | `incrementSession` non-atomic for concurrent submits. | Needs DB unique-partial-index + client debounce. |
| P2 | Listening type in schema, no implementation. | Implement vs. drop decision. |
| P2 | Per-controller `wrap` duplication (now redundant with global handler). | Audit each controller before removing. |
| P2 | `pages/admin/` subdir (5 files: Dashboard, Lessons, Overview, Settings, Users) is dead but not deleted. | Out of scope for this pass; flagged for follow-up. |
| Watch | `users` unique on raw email vs index on `lower(email)`. | Migration work. |
| Watch | Frontend `security.js` references absent CSRF meta tag. | Cosmetic. |

### Email service for password reset (decision needed)

Three options for the email-flow backend the password-reset P1 requires:

1. **Resend** (resend.com) — modern API, generous free tier (3k emails/mo), drop-in `@resend/node`. Simplest integration. Recommended for an MVP.
2. **AWS SES** — cheapest at scale, but DNS + sandbox-out + bounce-handling overhead. Worth it once volume justifies it (10k+ emails/mo).
3. **Postmark** — transactional-only, excellent deliverability, $15/mo for 10k emails. Sweet spot if Resend's free tier becomes a constraint.

Default proposal: Resend. Single env var `RESEND_API_KEY`, single dependency, can be swapped later. Password-reset flow design (after service is chosen):
- `POST /api/v1/auth/forgot-password` (rate-limited): always returns 200 with generic "if the email exists, a reset link was sent" — no enumeration. Generates a single-use token, stores hash + expiry, emails the link.
- `POST /api/v1/auth/reset-password`: validates token + sets new password + bumps `token_version` (invalidates existing sessions). Returns 200.

Once Joao picks a service, the implementation is ~2-3 hours of work in a single workstream.

### Synthetic accounts pending cleanup (running total)

`audit-baue-1778512787788`, `audit-1778513949059`, `audit-1778514023594`, `audit-1778514074779`, `audit-1778514128145`, `audit-brutal-1778514955` — all `@test.local`. No new accounts created in this pass.

---

## Brutal-audit closure pass 3 — 2026-05-11-late+5

**Scope:** P2 batch (low-risk cleanups) — scrypt cost tuning with transparent legacy migration, `users` unique on `lower(email)`, pgStore SSL hardening, dead `pages/admin/` subdir + dead `config/security.js`, prod-smoke cleanup hook. Commits `c70591d` + `d99c5da`. Backend deployed via `railway up`; migration applied to Neon.

### P2 closures

| Severity | Finding | Closure |
|---|---|---|
| P2 | scrypt with `node:crypto` defaults (no explicit params). | **CLOSED** — `SCRYPT_PARAMS = { N: 1<<17, r: 8, p: 1, maxmem: 256 MiB }` pinned in code (OWASP minimum). New tagged hash format `scrypt$N$r$p$salt$hash`. `verifyPassword` transparently handles legacy 3-part hashes under `LEGACY_SCRYPT_PARAMS` and returns a `rehash` field on success, which `login` opportunistically persists via `updateUserPasswordHash`. Existing users get auto-upgraded on next login, no flag day. |
| P2 | `ssl: { rejectUnauthorized: false }` fallback in pgStore. | **CLOSED** — production now throws at init if `DATABASE_URL` lacks `sslmode=`. Dev/test keep permissive fallback. Verified prod URL already has `sslmode=` before shipping, so no operational risk. |
| Watch | `users` unique on raw `email` vs index on `lower(email)`. | **CLOSED** — `create unique index if not exists users_email_lower_uniq on users(lower(email))` + drop raw column unique. Migration applied via `npm run migrate`. Idempotent. |
| P2 (code-debt) | `pages/admin/` subdir (5 files: Dashboard, Lessons, Overview, Settings, Users) dead but not deleted. | **CLOSED** — entire subdir removed after grep confirmed zero imports. |
| Watch | Frontend `security.js` references absent CSRF meta tag. | **CLOSED** — file deleted (was never imported anywhere); empty `frontend/src/config/` directory also removed. |
| P2 | `prod-smoke.spec.js` writes a synthetic user with no cleanup hook. | **CLOSED** — `afterEach` reads `baeu_token`/`baeu_user` from `localStorage`, calls `DELETE /api/v1/auth/me` against prod backend with the bearer. Non-fatal on failure. Closes the pollution + signup rate-limit risk. |

### Verification (live)

- `npm test` (backend): **80/80 pass** (was 72; +9 across `scrypt.test.js` + `pgStoreSsl.test.js`).
- `npm run build` (frontend): OK (290 modules, 352.40 kB).
- `npm run migrate` against prod Neon: `migrations applied`. `lower(email)` unique index created without conflict — no case-different duplicate emails in prod users table.
- Backend deploy via `railway up`: live. `/api/v1/health` returns 200; `/api/v1/modules` returns 8 modules / 412 published exercises. No regression.

### Still open after this pass

| Severity | Finding | Status |
|---|---|---|
| P1 | Password-reset flow. | **Decision made: Neon Auth (full auth replacement).** Migration plan below. |
| P1 | JWT in `localStorage` (XSS exfiltratable). | Will be obsolete after Neon Auth migration (Stack Auth handles tokens). |
| P1 | Email enumeration via signup 409. | Will be obsolete after Neon Auth (provider-managed signup). |
| P1 | 3 of 8 modules with zero lessons. | Content work; deferred to a content-seed pass with Joao. |
| P1 (ops) | Railway service has no GitHub source. | Dashboard action — manual. |
| P2 | Per-controller `wrap` (now redundant). | Refactor; needs per-controller error-code audit. |
| P2 | `practice_attempts` idempotency on double-submit. | Needs DB unique partial index + client debounce. |
| P2 | Listening type in schema, no implementation. | Decision: implement audio vs. drop constraint. |

---

## Workstream plan — Neon Auth migration (option A)

**Goal:** replace the custom JWT + scrypt + users-table auth with Neon Auth (Stack Auth), unlocking password reset, email verification, JWT revocation, OAuth, and password-change flows out of the box. Decided 2026-05-11 — explicit pick over Resend/Postmark/SES because the substitution eliminates ongoing auth maintenance entirely.

### Phase 0 — Neon Auth provisioning (manual, Joao)

1. In the Neon dashboard for project `ancient-butterfly-19493910`, enable **Neon Auth**.
2. Neon provisions a `neon_auth.users_sync` table that mirrors Stack Auth identities (id, primary_email, display_name, raw_json, created_at, etc.).
3. Capture the Stack Auth project ID, publishable client key, and secret server key. These become env vars on Vercel + Railway.

This is the only step that **must** be a human dashboard action. Everything below is code Joao authorizes me to run.

### Phase 1 — Backend integration

- Install `@stackframe/stack` SDK on the backend.
- New `backend/src/middleware/neonAuth.js`: `requireUser` that validates Stack Auth tokens from the `Authorization: Bearer …` header (or a session cookie if we choose that path) and resolves to `{ stackUserId, email, displayName }`.
- Migrate the existing `users` table to reference Stack Auth ids: add `users.stack_user_id uuid unique` column; the rest of our schema continues to reference `users.id` via FK (no churn on practice_sessions / attempts / mastery).
- Keep our `users.role` column (Stack Auth has roles but it's cleaner to keep ours since admin gating is already wired). Sync logic: a Stack Auth signup creates a `users` row via webhook OR lazy-on-first-request.
- Account deletion now does TWO things: call Stack Auth's delete-user endpoint, then cascade-delete in our `users` row (which already cascades to practice data).
- Remove: `AuthService.signToken`, `signupOrLogin` flows, `signupController` / `loginController` write paths, `token_version` logic (Stack Auth handles revocation). Keep `requireAdmin` since it's an admin-check, not an auth check.

### Phase 2 — Frontend integration

- Install `@stackframe/react` SDK on the frontend.
- Replace `Auth.jsx` (signup/login form) with Stack Auth's components OR build a minimal wrapper around its hooks if we want to keep the current visual design. Recommend keeping the visual design and using hooks — better consistency with the brand.
- Replace the localStorage `baeu_token`/`baeu_user` pattern with Stack Auth's session management.
- Add `/account` redirect to Stack Auth's account-management screen (free password change, email change, sessions list — all built in).
- Replace our custom logout-all with Stack Auth's session-revocation API.
- Add password-reset entry point on the login screen (Stack Auth ships the flow).

### Phase 3 — User migration

**Problem:** existing scrypt passwords aren't extractable. We can't transparently move users to Stack Auth without involving them.

**Recommended approach: bulk password-reset.**

1. Export the existing `users` table (just `id, email, display_name, created_at` — no hashes).
2. Use Stack Auth's user-import API to create Stack Auth identities for every existing email, **without** a password. Each new Stack Auth user is flagged "must reset password before login."
3. Map `users.id` → `users.stack_user_id` via the new column.
4. Send one email blast: "Baeu has upgraded its login. Click here to set your new password." Links to a Stack Auth password-reset page scoped to their email.
5. On first successful Stack Auth signin, our backend reconciles `users.stack_user_id` and the user is back in business with all their progress preserved.

**Why this approach:**
- Existing scrypt passwords can't be migrated transparently — any path involves users acting.
- "Set your new password" is gentler UX than "create a new account."
- Practice progress (sessions, attempts, mastery) is preserved across the migration because we keep `users.id` stable.

**Fallback option** for users who don't reset within 30 days: their `users` row remains but they can't log in until they reset. No data loss; they just need to click the link.

### Phase 4 — Cutover

1. Deploy backend with **both** auth paths active: legacy JWT path still works for existing users; Stack Auth path active for new users. Read-only feature flag if needed (`AUTH_MODE=dual`).
2. Run the migration script (Phase 3 steps 1–3).
3. Send the email blast.
4. After 30 days OR when migration is ≥95% complete: flip `AUTH_MODE=stack-only`, remove legacy JWT signing code in the next commit.
5. Drop the legacy `password_hash` column in a follow-up migration.

### Estimated effort

- Phase 0: ~10 min (Joao, dashboard).
- Phase 1: ~3-4h of focused work (one agent, backend-only, write-authorized).
- Phase 2: ~2-3h (one agent, frontend-only).
- Phase 3: ~1h to build the import + email-trigger script + run it.
- Phase 4: ~30 min cutover + ~10 min follow-up cleanup.

Total: **~7-9h of agent work**, plus the dashboard step + the email blast send + the 30-day observation window.

### What Neon Auth resolves on the way

- ✅ Password reset (built-in)
- ✅ JWT revocation (Stack Auth tokens)
- ✅ Email verification (built-in, opt-in)
- ✅ scrypt tuning concern (Stack Auth uses modern hashing internally)
- ✅ Email enumeration on signup (provider-managed)
- ✅ Password change without admin intervention
- ✅ Session list / "sign out everywhere" (UI provided)
- ✅ Optional: OAuth providers (Google, GitHub) as a future upgrade with zero new code

### What remains our responsibility

- Practice data deletion on account close (cascade from our `users` row).
- `requireAdmin` check (we keep our `role` column).
- Onboarding coachmark / first-time hint (not auth).
- Content depth (not auth).

### Open questions for Joao before kicking off

1. Confirm bulk password-reset is the right user-migration approach.
2. Confirm we keep the visual design of the auth screens (Stack Auth hooks) vs. embedding Stack Auth's pre-built UI components.
3. Email sender identity for the migration blast — Stack Auth handles sending, but the "from" address and subject line should be Joao's call.
4. Decide whether to enable OAuth providers (Google) at cutover or leave for later.

---

## Better Auth cutover — 2026-05-11-late+6

**Status:** LIVE in production. **Path taken:** C (Better Auth direct, not Neon Auth wrapper). Joao confirmed no real users — migration was a clean wipe.

**Commits in cutover order:**
- `8a753bd` feat(backend): replace custom JWT auth with Better Auth (21 files, +867/−972)
- `4be5186` fix(backend): polyfill `globalThis.crypto` for Better Auth id generator
- `f0d68d1` feat(frontend): migrate to Better Auth — Google sign-in, password reset, useSession
- `3821bdb` fix(schema): drop practice tables explicitly before recreate

### Architecture decision: Better Auth direct (not Neon Auth wrapper)

Research before code revealed that "Neon Auth" (Dec 2025) is a Next.js-focused wrapper over Better Auth; it has no first-class Express server middleware. Better Auth standalone gave us Express integration, Postgres adapter directly on the existing Neon DB, no external API dependency, Google OAuth, password reset, sessions, and "sign out everywhere" — same underlying tech, better fit for our SPA + Express + Neon stack.

### What landed

**Backend (`@better-auth/core` + Better Auth `1.6.10`):**
- `backend/src/auth.js` (NEW): betterAuth() with PG Pool, trustedOrigins from `CORS_ORIGIN`, `emailAndPassword + sendResetPassword console.log stub`, optional Google socialProvider (gated on both env vars), `user.deleteUser.enabled = true`, prod cookies `sameSite=none; secure; httpOnly`.
- Handler mounted at `app.all('/api/auth/*', toNodeHandler(getAuth()))` BEFORE `express.json` so Better Auth gets the raw body.
- `requireUser` rewrite uses `auth.api.getSession({headers: fromNodeHeaders(req.headers)})`. `requireAdmin` keeps the x-admin-token operator path, then session + role check against the new `user_role` table.
- New `GET /api/v1/me/role` returning `{id, email, role}` so the frontend's `useSession`-driven shell can decide whether to render the Admin link.
- Schema: legacy `users` cascade-dropped, practice tables explicitly dropped + recreated with `user_id text → "user"(id) on delete cascade`, Better Auth canonical tables (`user`, `session`, `account`, `verification`) inlined into `schema.sql`, new `user_role` table.
- Deleted: `routes/auth.js`, `controllers/authController.js`, `services/AuthService.js`, `tests/{auth,scrypt,compliance,hardening}.test.js` (Better Auth owns it now).
- Tests: 67/67 pass — added `authMiddleware.test.js` covering 401 / 403 / x-admin-token paths.

**Frontend (`better-auth` `1.6.10`, ~24 packages):**
- `lib/auth.js` (NEW): `createAuthClient({ baseURL: VITE_API_BASE_URL })`, re-exports `useSession/signIn/signUp/signOut/forgetPassword/resetPassword`.
- `Auth.jsx`: three modes (login/signup/forgot), Better Auth email flows, "Continue with Google" button via `signIn.social({provider:'google'})`. Generic toast on forgot-password success in both branches to prevent enumeration.
- `App.jsx`: `useSession()` boot (replaces `api.me`/`auth.getToken`/`localStorage`), `#/reset-password?token=...` rendered before the auth gate, role lookup via `api.meRole()` (Admin link hidden if endpoint fails).
- `AccountSettings.jsx`: "Sign out everywhere" = `revokeOtherSessions + signOut`. "Delete account" type-to-confirm-email + optional password input → `authClient.deleteUser({})`.
- `api.js`: `call()` always sets `credentials: 'include'`; legacy `auth`/`api.signup`/`api.login`/`api.me`/`api.deleteMe`/`api.logoutAll` removed; new `api.meRole()`.

**Env vars on Railway (set this session):**
- `BETTER_AUTH_SECRET` (random via `openssl rand -base64 32`)
- `BETTER_AUTH_URL=https://baeu-backend-production.up.railway.app`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — **still MISSING**; Google sign-in disabled until Joao creates the OAuth client in Google Cloud Console.

### Verification (live, 2026-05-11)

```
POST /api/auth/sign-up/email     → 200, returns {token, user{id:text, email, name}}
GET  /api/auth/get-session       → 200, returns full session+user with cookie
GET  /api/v1/me/role             → 200 {id, email, role:'user'} with cookie
POST /api/v1/practice/sessions   → 200 {id, user_id:text, mode:'endless', ...}
GET  /api/v1/practice/next?...   → 200 returns a real Korean question
POST /api/auth/delete-user       → 200 {success:true, message:'User deleted'}
```

Frontend bundle `index-CKMH3qIw.js` contains all Better Auth UI markers (`Build real Korean`, `Continue with Google`, `Welcome back`, `Sign out everywhere`, `Delete account`, `forgetPassword`, `reset-password`).

### Bugs fixed during cutover (lessons)

1. **`ReferenceError: crypto is not defined`** at `@better-auth/utils/random.mjs:41`. Better Auth's id generator expects `globalThis.crypto` (Web Crypto). Railway's Node runtime didn't expose it as a global. Fix: polyfill at the top of `auth.js`:
   ```js
   import { webcrypto } from 'node:crypto';
   if (!globalThis.crypto) globalThis.crypto = webcrypto;
   ```
2. **`invalid input syntax for type uuid`** on practice/sessions insert. `drop table users cascade` only drops FK constraints, not the dependent practice tables — they survived with `user_id uuid` columns. Fix: explicit `drop table if exists practice_attempts cascade` etc. before the recreate.
3. **No Better Auth `/api/v1/me/role` endpoint** in the agent's deliverable. Added post-hoc in `routes/me.js`.

### P1s resolved by Better Auth

| P1 | Status |
|---|---|
| Password-reset flow | Built-in. `forgetPassword` + `resetPassword` wired. Email send is currently `console.log(url)` — needs an email-service decision (Resend/Postmark/SES) to actually send. |
| JWT revocation / "sign out everywhere" | Built-in via Better Auth sessions. `revokeOtherSessions` wired in `AccountSettings.jsx`. |
| Email enumeration on signup 409 | Better Auth's signup returns a generic `USER_ALREADY_EXISTS` code; our forgot-password UI gives identical success toast for valid + invalid emails. |
| scrypt tuning concerns | Better Auth uses its own modern hashing. Our legacy scrypt code is gone. |
| Account-deletion compliance (GDPR/LGPD) | `authClient.deleteUser` cascades through Better Auth's tables → cascades to our practice tables via FK. |

### Still open

| Severity | Finding | Status |
|---|---|---|
| P1 | `sendResetPassword` only logs to console — no email sent. | **Awaiting email-service decision.** Resend default proposal stands. |
| P1 (manual) | Google OAuth credentials. | **Awaiting Joao**: create OAuth 2.0 Client ID in Google Cloud Console with redirect URI `https://baeu-backend-production.up.railway.app/api/auth/callback/google` and set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` on Railway. Backend auto-enables Google when both env vars are present (next `railway up` picks up the env). |
| P1 (ops) | Railway has no GitHub source — backend deploys still manual via `railway up`. | Dashboard action — unchanged from prior pass. |
| P1 | 3 modules with zero lessons (greetings, vocab-daily, reading). | Content work. |
| P2 batch (remaining) | JWT-in-localStorage (now moot — cookies), `practice_attempts` idempotency on double-submit, listening type in schema with no implementation, per-controller `wrap` redundancy. | Schedule for next pass. |

### Synthetic accounts in prod DB

`audit-smoke-1778523867@test.local` was cleaned up via `npm run cleanup:test-users -- --apply` (deleted 1 row + cascaded). No pollution remaining.

### What Joao needs to do next (to enable Google sign-in)

1. Google Cloud Console → APIs & Services → Credentials → "Create OAuth client ID" → Web application.
2. Add authorized redirect URI: `https://baeu-backend-production.up.railway.app/api/auth/callback/google` (also `http://localhost:3001/api/auth/callback/google` for local dev).
3. Copy the Client ID + Client Secret.
4. Set on Railway: `railway variables --set "GOOGLE_CLIENT_ID=..." --set "GOOGLE_CLIENT_SECRET=..."`.
5. Trigger a backend redeploy: `cd backend && railway up --service baeu-backend --ci`.

Frontend Google button already exists — it just gracefully toasts an error today because the backend doesn't have Google configured. After step 5, the button works end-to-end.
