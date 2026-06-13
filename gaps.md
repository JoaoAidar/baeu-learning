# Gaps — Baeu Learning

## Content + activation pass — 2026-06-01 (ready to use)

Goal: single-user readiness — enough content + the full learning system live in prod.

- **SRS activated in prod:** ran `migrate:srs` on Neon → `user_exercise_srs` created. (Confirmed prod is the DB: 415→440 published, 53 users.) SM-2 scheduling now live.
- **Regression caught + fixed:** the SRS code had shipped before the table existed, breaking practice in prod (prod smoke caught it). `SrsService` now degrades to a no-op on store errors; redeployed; smoke green.
- **Content expanded (item a):** generator 354→379 — +10 particle drills, +5 word-order MC, +10 hard sentences. Pushed to prod via additive `seed:new` (+25). Prod now **440 published**, difficulty easy 218 / medium 212 / **hard 10**, word_order 16.
- **Reconciliation (item b):** `seedNewExercises` (`npm run seed:new`) is additive + idempotent (dedupes vs DB and within batch); both seed paths dedupe by prompt. Code is the content source of truth; prod grows additively without wipes. The historical 354↔412 count mismatch is now moot.
- **Housekeeping:** deleted 1 orphaned synthetic audit account.

**Verified:** backend 98/98; prod learner smoke passes end-to-end with SRS writing live.

**Known content notes (not blockers):** still translation-heavy (~75%); 3 prompts overlap between patterns/reading generators (already in prod, deduped on future seeds); grammar markers still relatively thin — expand via the (cost-capped) admin LLM generator as diagnostics reveal gaps.

## Migration safety split — 2026-06-01

Closed the destructive-`schema.sql` footgun flagged in the SRS pass.

- `schema.sql` is now **purely idempotent** (only `create … if not exists` + idempotent ALTERs); the legacy DROP block was removed. `npm run migrate` is now **safe to run on prod with real data** and also creates `user_exercise_srs` — so it's the one command needed for the item-3 SRS table going forward.
- The one-time destructive reset moved to `reset-legacy.sql`, run only via `npm run migrate:reset`, **double-guarded** (requires `CONFIRM_DESTRUCTIVE_RESET=1`, never wired into deploy).
- `migrate:srs` kept as a minimal targeted option.

**Net:** `npm run migrate` = safe/idempotent (use this); `npm run migrate:reset` = intentional full wipe only. Backend 95/95 still green.

## SRS + progress depth pass — 2026-06-01 (items 3, 5, 6)

| Item | Finding | Fix |
|---|---|---|
| 5 | Per-skill accuracy was lifetime-only, so old struggles dragged the signal and hid recent improvement. | `ProgressService.skills()` adds `recentAccuracy`/`recentAttempts` (last 500); FocusPanel ranks/labels by recent accuracy when available. |
| 6 | Totals/streak read up to 1000 attempts and bucketed days in UTC. | `overview()` now uses SQL aggregates (`getProgressAggregates` on pg+memory) — no cap; streak buckets in local tz (`APP_TZ_OFFSET_MINUTES`, default −180 / São Paulo). New `util/time.js`. |
| 3 | Mastery was per-skill-tag with a jumpy ±1 level — confidence, not true per-item spaced repetition. | New per-item SM-2-lite SRS (`user_exercise_srs` + `SrsService`): ease factor, geometric intervals, lapse resets to relearn. Selector uses item-level due as a primary signal (new → introduce, due → resurface, not-due → hold). Skill mastery kept as the diagnostic layer. |

**⚠️ Manual prod step for item 3:** the new table needs a one-time migration on Neon. Do **NOT** run `npm run migrate` (it re-runs schema.sql which drops practice tables). Run the additive, non-destructive script instead:
`DATABASE_URL=<neon> npm run migrate:srs`
Until the table exists in prod, `getSrs*` is a graceful no-op (SRS just doesn't schedule; selection falls back to skill signals) — nothing breaks.

**Latent footgun noted:** `schema.sql` drops/recreates practice tables on every full `migrate` run (legacy users→Better Auth cutover). Safe today because deploy runs `npm start` (no migrate), but anyone running `npm run migrate` against prod wipes practice history. Worth splitting destructive reset from idempotent schema later.

**Verification:** backend 95/95 (+4 SRS tests, +2 progress tests). Frontend build OK.

## Learning-rules accuracy pass — 2026-06-01

Pedagogy/business-logic review of grading + SRS. Fixed the three items that most distorted diagnostics/learning; items 3 (ease-factor SRS redesign), 5 (windowed accuracy), 6 (1000-attempt cap + tz streak) are deferred and tracked.

| Item | Finding | Fix |
|---|---|---|
| 1 | Wrong multiple-choice was blanket-tagged `vocabulary`, inflating that category and hiding the real skill missed. | `ErrorClassifier` maps the question's `skill_tags` to the error category (particle/verb/formality/hangul/word_order), falling back to vocabulary only when no grammar tag applies. |
| 2 | Level-5 "mastered" skills were skipped forever (never due, selector −1.5) — a retention leak, the opposite of spaced repetition. | `dueSkillsFromMap` no longer skips level 5; selector resurfaces a mastered skill once its 7d interval elapses (lapse handled by the existing −1 on wrong). |
| 4 | `focus=weak` filtered only by *recent errors*, so the Drill CTA could miss the low-level/due skills the Progress FocusPanel surfaced. | Selector `focus=weak` now unions recent-error skills with mastery-weak skills (level ≤1 or due), matching the panel. |

**Verification:** backend 89/89 (was 86; +3 tests for MC tagging, mastered resurface, mastery-weak focus). Note: live e2e webServer could not bind a loopback port in this session's sandbox; relied on route-level integration tests (`practiceRoutes.test.js`, `practice.test.js`) which exercise the full path in-process.

## Product decision + learner-path closure pass — 2026-06-01

**Decision:** Baeu is a **personal/free learner tool**, not a commercial product. João is the user. Institutional/buyer/admin-readiness gaps are now **out of scope**; priorities are the learner path to 100% and accurate diagnostics. (Recorded in agent memory: `project_baeu_product_decision.md`.)

**Verified-current (older audit findings stale):** metrics are all real (no hardcoded `streak` fixtures remain); IDOR `assertSessionOwner` returns 403 on next/answer/summary; module-vacancy returns clean `409`; `listModulesWithPublishedCounts` aggregate is wired; no dead page files; exercise count is dynamic (413-vs-354 claim no longer applies).

| Priority | Finding | Closure |
|---|---|---|
| Closed-code | 401 mid-session caused a toast loop. | `api.js` broadcasts `baeu:unauthorized` on any authed 401; `App.jsx` clears session + routes to login once. Admin-token calls opt out. |
| Closed-code | Cold-start read as "frozen"; ErrorBoundary generic + broken `process.env` check in Vite. | `BootSplash` shows "server may be waking up" after 4s; `ErrorBoundary` fixed (`import.meta.env.DEV`), dead import removed, network-aware copy + Try again. |
| Closed-code | "Practice weak areas" not surfaced (backend `focus=weak` existed, no entry point). | Dedicated CTA on Home + practice start screen → `#/practice?focus=weak`; `EndlessPractice` auto-starts focused. New e2e locks it. |
| Closed-code | Diagnostics scattered across tables. | `FocusPanel` at top of Progress synthesizes weak/due skills + top error-tags into one "What to work on now" view with a Drill CTA. |
| Closed-code | Admin LLM generation had no spend ceiling (OpenRouter `limit: null`). | `LLMGenerator` enforces `max_tokens` (`LLM_MAX_TOKENS`, def 4000), per-request cap (`LLM_MAX_PER_REQUEST`, def 50), and in-process daily cap (`LLM_DAILY_CAP`, def 200; `llm_daily_cap_reached` 429). |
| User-action | Resend + Google OAuth still unconfigured. | Add `RESEND_API_KEY` / `GOOGLE_CLIENT_ID`+`SECRET` to Railway `baeu-backend`, redeploy. Password reset falls back to `console.log` until then. |

**Verification:** frontend build ✅; frontend e2e 20/20 (2 prod-smoke skipped by design) ✅; backend 86/86 ✅.

## Update 2026-05-30 — Rev Audit all-tests Phase 3

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-30-2028/_ALL-TESTS-PHASE3.md`
Score: `84/100`; Gate: `PASS`.

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Prod synthetic learner first-value passed with cleanup. | Signup, practice, feedback, progress, relogin and cleanup passed. | Keep prod smoke recurring. |
| P2 | Admin/teacher path not observed. | Phase 2 not observed. | Add admin smoke if needed for ops/sale. |

## Log audit 2026-05-27 — learner query latency

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-27-1528-cost-usage-heavy/LOG-AUDIT-DEEP-DIVE.md`
Gate: `WATCH`.

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Backend logs slow module/exercise queries on learner path. | Railway `baeu-backend` 24h logs: 33 error-level perf events; repeated slow `select * from modules order by order_index asc, title asc`, exercise count by module, and slow `GET /api/v1/modules` around 800-1200ms. | Add EXPLAIN/index/cache for module list and exercise counts; add learner first-page perf smoke. |

## Cost/usage audit 2026-05-27 — provider-grounded

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-27-1528-cost-usage-heavy/`
Gate: `WATCH`.

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Admin LLM generation needs explicit cap even though current cost is low. | Repo scan flags OpenRouter-compatible LLM generator; Railway cost `$1.28`; OpenRouter key limit observed as `null`. | Gate admin generation behind budget, per-day/per-admin limits and usage log. |
| P1 | In-memory/rate-limit scaling remains a cost/reliability risk. | Repo scan carries Redis/rate-limit TODOs; `baeu-backend` sleep-enabled. | Prove Redis/rate-limit behavior before multi-instance or public cohort scale. |
| P2 | Neon active time is moderate. | Neon `baeu-learning` active time `36328s`, endpoint idle, suspend timeout `0`. | Add active-time watch; not first optimization target. |

## Test run 2026-05-27 — safe local tests

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-27-1429/test-run-all/agents/prato-baeu-tests.md`
Status: `LOCAL PASS / PROD BROWSER-LEARNER CAVEAT STILL OPEN`.

| Priority | Finding | Evidence | Closure gate | False-green path | Attack rule |
|---|---|---|---|---|---|
| P2 | Backend tests and frontend build are green. | Backend `npm test` exit 0 with `85/85` tests, `0 skipped`; frontend `npm run build` exit 0. | Preserve as baseline for practice/admin changes. | Backend/build green does not resolve current public `Loading...` browser false-green. | Local pass is necessary, not current prod proof. |
| P1 | Prod/e2e/admin/provider paths were skipped. | Not run: frontend e2e, prod learner smoke, prod admin smoke, DB seed/migrate/cleanup. | Rerun prod learner visible-content smoke and add admin/cohort/provider + two-account IDOR E2E. | Existing learner smoke can drift from current deployed browser behavior. | Keep learner-only caveat until browser and admin gates pass. |

## Update 2026-05-27 — coverage/smoke/stress deep dive

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-27-1429/deep-dive-limited-caveats/`
Verdict/gate: `READY WITH CAVEATS learner / WATCH admin-provider`; learner smoke is strong, buyer/admin proof is not.

| Priority | Finding | Evidence | Closure gate | False-green path | Attack rule |
|---|---|---|---|---|---|
| P1 | Learner lane has strong proof, but public browser currently showed `Loading...`. | Wave 1 found recent production learner smoke and CI green; browser-persona sidecar still saw public root stuck on loading. | Debug fresh anonymous load and add visible-content assertion to prod smoke; keep learner smoke as release gate. | Route 200 and old learner pass can hide current bundle/API drift. | A learner-ready claim needs visible current UI plus first-value smoke. |
| P1 | Admin/cohort/provider readiness is outside the green path. | Prod admin smoke exists but is opt-in/token gated; cohort/provider lifecycle and Google/Resend readiness are not enforced. | Add session-auth admin/cohort lifecycle: admin creates/imports content/cohort, learner consumes it, archive/cleanup, provider states explicit. | Learner practice passing does not prove institutional product. | Buyer claims stay learner-only until admin is proven. |
| P1 | IDOR owner assertion needs route-level E2E. | Service-level owner assertions and tests exist for practice sessions; no two-account HTTP/browser E2E was observed. | User A creates session; User B attempts next/answer/summary over HTTP and receives 403 without leaked details. | Unit ownership tests can miss route/auth wiring. | Prove isolation at the deployed boundary. |
| P2 | Load/cold-start and Tempo proof are missing. | Perf/rate-limit tests exist, but no real load harness; current Tempo proof for `baeu-backend` was not observed. | Add cold-start learner perf smoke with bounded p95-ish thresholds and a Tempo trace for signup/modules/practice/progress. | Health `store:pg` is not learner-flow observability. | Measure the learning path, not only health. |

## Heavy audit RUN_ID 2026-05-26-1745

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-26-1745/`
Verdict/gate: `LIMITED READY learner / WATCH buyer`.

| Priority | Finding | Evidence | Closure gate | False-green path | Attack rule |
|---|---|---|---|---|---|
| P0 | Decide active product vs park/archive before broadening scope. | Commercial/product lenses say the learner lane is the strongest constrained proof, but buyer/cohort strategy is unresolved. | Mark Baeu as active learner pilot or PARK; if active, keep prod learner smoke as release gate. | Old READY-ish learner proof can mask product-strategy drift. | Do not build admin/sales surface without a product decision. |
| P1 | Browser admin-token path blocks institutional trust. | Prior security sidecar and commercial lens flag static/admin token style as a buyer blocker. | Remove browser static admin-token path or block `x-admin-token` for browser origins; prove role/session admin flow. | Admin UI working with localStorage/static token is not secure cohort admin. | Cohort buyers require server-authenticated administration. |
| P1 | Ownership and admin/cohort/provider proof are open. | Product lens asks for two-account ownership negative tests plus admin/cohort/provider lifecycle. | Prove second user cannot access practice/progress/session; run admin creates cohort/content/provider-ready smoke with cleanup or mark out of scope. | Learner path passing does not prove cohort readiness. | Keep buyer claims learner-only until admin is proven. |

## Update 2026-05-26 — ship-readiness / infra follow-up

**Gate atual:** PARK / PoC saudável. Infra está em ordem, mas falta decisão de produto.

**Confirmado**
- Vercel project `baeu-learning` observado na stack.
- Railway `baeu-backend` com sleep true e deploy `SUCCESS`.
- Neon `baeu-learning` com branch `main`, endpoint idle/autosuspend padrão.

**Ainda falta**
- **P0/estratégia:** decidir se Baeu continua como produto/portfolio ativo ou vira archive.
- **P1:** canonizar URLs no docs/smokes: frontend `https://baeu-learning.vercel.app`; backend `https://baeu-backend-production.up.railway.app/api/v1/health`.
- **P1/produto:** sample path público e smoke sancionado de auth/progresso/lição.
- **P2:** health endpoint público/documentado para monitores simples, se ainda não estiver padronizado.

**Evidência:** Railway/Vercel/Neon wrappers 2026-05-26.

---

## P1 — Graceful degradation: ErrorBoundary parcial + zero retry quando backend Railway cai (2026-05-19)

**Contexto:** auditoria durante incidente Railway (2026-05-19). Baeu é Vite SPA no Vercel + backend Node no Railway (`baeu-backend`, `node --import=./src/instrumentation.js src/server.js`). Quando Railway cai (caso atual), o HTML do SPA continua servindo (Vercel edge), mas qualquer chamada a `VITE_API_URL` falha.

**O que está bom (já existe):**
- `frontend/src/components/shared/ErrorBoundary.jsx` custom presente ✅ — diferente da maioria dos projetos novos.
- Vite SPA shell pequeno (409B) servido pela edge → landing carrega mesmo com backend fora.
- Fallback `'http://localhost:3000/api'` em `utils/api.js` (irrelevante em prod, mas evita NPE em dev).

**Gaps:**
1. **Zero retry / AbortController / timeout** em `frontend/src` — `grep -c "retry|AbortController|timeout"` retorna 0 na maioria dos arquivos e 1 em apenas um.
2. **Sem react-query, SWR, axios** — todas as chamadas são `fetch()` cru em `frontend/src/api.js`, `utils/api.js`, `lib/auth.js`.
3. ErrorBoundary cobre apenas render errors do React; **não captura `Promise rejection` de `fetch()` falhando**, então uma página de prática que tenta `GET /lessons` quando backend está fora vai mostrar UI quebrada (loading infinito ou crash do componente filho).
4. Sem banner global de incidente parametrizável.

**Evidência:**
- `find frontend/src -iname "*ErrorBoundary*"` → 1 hit (`shared/ErrorBoundary.jsx`)
- `grep -rEhc "retry:|AbortController" frontend/src` → distribuição 0,0,0,…,1,…,0
- `grep VITE_API frontend/src` → `utils/api.js:3` e `lib/auth.js:7` (sem wrapper de erro de rede)
- Auditoria consolidada: `~/Library/Application Support/Claude/.../outputs/vercel-graceful-degradation-2026-05-19.md`

**Cruza com gap canônico:** o export Obsidian `50-agent-exports/baeu-learning/gaps.md` registra "URL stale failures são false negatives, backend canônico OK". Esse padrão ("URL stale") sugere que o frontend pode estar apontando pra URL Railway antiga sem retry — exatamente o tipo de falha silenciosa que o gap aqui descreve.

**Fix proposto (1-2h):**
- Centralizar todas as chamadas em `utils/api.js` num wrapper que: (a) timeout via `AbortController`; (b) retry com backoff em 5xx/timeout/network; (c) classifica erro em `{kind: 'network'|'http', status?, message}`.
- Adicionar um hook `useApiQuery` simples (ou adotar React Query — a curva é baixa pra Vite SPA) que use o wrapper acima.
- Estender o `ErrorBoundary` pra mostrar copy específico quando `error.kind === 'network'` ("backend temporariamente indisponível, recarregue").
- (Stretch) Adicionar `<IncidentBanner/>` lido de `VITE_INCIDENT_MESSAGE`.

**Status 2026-05-21:** partially closed in code.

**Checklist:**
- [x] Wrapper centralizado em `frontend/src/api.js` com timeout + retry idempotente + classificação (`ApiError.kind/status/code`).
- [x] Migrar chamadas `api.*` / `adminApi.*` para usar o wrapper centralizado.
- [ ] `lib/auth.js` / Better Auth social and password flows still use the Better Auth client directly.
- [ ] Estender ErrorBoundary com fallback diferenciado por categoria.
- [ ] Validar com backend Railway dormindo / backend canônico temporariamente inválido em browser.

---

## P0 — Grafana coverage (2026-05-19)

> **STATUS 2026-05-19 (Claude session):** código aplicado no `backend/`:
> - `backend/src/instrumentation.js`: novo arquivo, NodeSDK gated por OTEL_EXPORTER_OTLP_ENDPOINT
> - `backend/package.json`: scripts `dev` e `start` agora usam `--import=./src/instrumentation.js`; +5 deps `@opentelemetry/{sdk-node,auto-instrumentations-node,exporter-trace-otlp-http,exporter-metrics-otlp-http,sdk-metrics}`
>
> **Resta o user fazer:** `npm install` no backend, setar 4 envs OTEL_* no Railway `baeu-backend`, redeploy. Frontend Vite fica fora deste P0.


**Por que P0:** o Grafana audit de 2026-05-19 detectou que `baeu-backend` (Railway) e `baeu-learning` (Vercel, Vite) **não emitem traces** para o Tempo. O dashboard "Kairos - Baeu Learning - Robust Ops" existe mas o painel "Trace search - baeu-learning-web" está **vazio**. Nenhuma alert rule provisionada.

**Estado no Railway:** baeu-backend `sleepApplication=true`, último deploy SLEEPING 2026-05-19 14:02 — provavelmente dormindo a maior parte do tempo.

**Evidência:**
- `tempo-services` (2026-05-19): só 5 services emitindo, Baeu não está incluído.
- Dashboard: `https://joaoaidar.grafana.net/d/kairos-baeu-learning-robust-ops/kairos-baeu-learning-robust-ops`
- Auditoria: `outputs/grafana-stack-audit-2026-05-19.md`

**Pattern canônico (Node/TS para baeu-backend):**
Mesmo `instrumentation.ts` de architrack-api (`apps/api/src/instrumentation.ts`). Trocar `serviceName` para `baeu-backend`. SDK gated por `OTEL_EXPORTER_OTLP_ENDPOINT` — sem env, no-op.

**Vite frontend (baeu-learning Vercel) — nota importante:**
Vite SPA roda 100% no browser. OTel browser tem custo de bundle (~80kb) e mostra só client-side spans (page load, fetch). Recomendado **NÃO instrumentar agora** — adicionar log drain do Vercel pra Loki cobre a parte de logs/erros. Se quiser RUM depois, considerar Grafana Faro (`@grafana/faro-web-sdk`).

**Env vars (baeu-backend Railway):**
- `OTEL_SERVICE_NAME=baeu-backend`
- `OTEL_EXPORTER_OTLP_ENDPOINT` ← `~/.agents/service-env/grafana.env`
- `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`
- `OTEL_EXPORTER_OTLP_HEADERS` ← `~/.agents/service-env/grafana.env`

**Status 2026-05-21:** closed for backend Tempo proof.

**Checklist:**
- [x] baeu-backend: adicionar `src/instrumentation.js` + deps @opentelemetry.
- [x] Setar 4 envs OTEL_* no Railway baeu-backend (provider UI confirmed names present on 2026-05-20).
- [x] Redeploy baeu-backend; Railway logs show `npm start`, `node --import=./src/instrumentation.js src/server.js`, and `[otel] started — service=baeu-backend`.
- [ ] (opcional) Vercel: ligar log drain para Grafana Loki (sem code change)
- [x] Validar com `grafana_service.py tempo-services` que `baeu-backend` aparece.
- [x] Validar com `grafana_service.py tempo-search --service-name baeu-backend` que traces existem.
- [ ] Confirmar dashboard Robust Ops populado visualmente.

---

## Persona browser audit — 2026-05-19-2005

**Auditor:** Codex | **Escopo:** browser/persona read-only nos 11 projetos da stack Kairos.

Evidence: `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/persona-browser-audits/2026-05-19/2026-05-19-2005`

| Severity | Persona / stakeholder | Finding | Closure gate |
|---|---|---|---|
| P1 | Learner | Routes return 200 but browser screenshot stalls on Loading; first-value practice not observed. | Fix loading/runtime and run signup/login -> module -> practice -> feedback -> progress smoke. |
| P1 | Buyer/operator | Privacy/billing/plan trust surfaces remain not validated in browser. | Expose privacy/terms/plan status in public shell. |

---
## Persona browser audit — 2026-05-24-1646
**Auditor:** Claude (Cowork). Evidência: runs/2026-05-24-1646/projects/baeu-learning-persona.md
| Sev | Achado | Gate |
|---|---|---|
| P0 | Botão 'Sign up' é no-op (nunca abre registro); hard auth wall, sem guest/demo | first-value=FECHADO; corrigir signup |
| P1 | SRS adaptativo (que é real no código) não verificável de fora — nenhuma amostra jogável | adicionar demo/guest |

## Brutal Audit — 2026-05-24-1646
Source report: ~/Documents/AI/Audits/runs/2026-05-24-1646/projects/baeu-learning-brutal.md
Verdict: LIMITED READY — real, tested SRS engine (Leitner, 354 exercises, 82/82 tests) behind a login wall whose "Sign up" button is a no-op; cannot acquire its first user. Confidence HIGH on core, MEDIUM on prod funnel.

| Sev | Finding | Closure gate |
|-----|---------|--------------|
| P0 | "Sign up" CTA on landing is a no-op (click does nothing) | Wire CTA to signup mode + E2E test signup→first graded question |
| P1 | Hard auth wall, zero first-value (no guest/demo/sample) | Public playable sample question OR seeded demo account |
| P1 | Content claim mismatch: landing "413 questions" vs build 354 | Landing reads live count from API (or fix copy) |
| P1 | No pricing/plan/trial surface for buyers | Pricing page present |
| P2 | Dead frontend code → localhost:3000 (Exercise.jsx, lib/api.js) | Delete dead clients |
| P2 | Static long-lived ADMIN_TOKEN; brief mislabels auth as "JWT" (is Better Auth cookies) | Rotation policy + fix brief |

Evidence pointers: persona Sign-up click ref e9 no-op; routes /practice,/app,/dashboard,/modules,/guest,/demo → login wall; deep ran buildTopik1Content()=354 vs landing 413; repo Exercise.jsx L7 / lib/api.js L5 / utils/api.js L3 = http://localhost:3000/api; Auth.jsx uses authClient.signUp.email (Better Auth); 82/82 tests pass.

Key false-green: "413 questions published" — generator actually emits 354; and "adaptive/progress tracking" is real in code but publicly undemonstrable (everything gated → buyer takes it on faith).

Agent attack rule: Do NOT trust /api/v1/health 200 store:pg as "ready" — infra-green hides a broken acquisition funnel. Before declaring shippable, prove signup works end-to-end (a NEW user reaching the first graded question) and reconcile the 413-vs-354 claim. Treat any unauthenticated /api/* response of content-type text/html as SPA fallback, not a real endpoint.

## Flow Audit — 2026-05-24-1646
Source: `~/Documents/AI/Audits/runs/2026-05-24-1646/projects/baeu-learning-flows.md` · backend `backend/src/`, frontend `frontend/`.

Inventory: ~22 backend endpoints (5 public, 8 auth, 7 admin, 1 Better-Auth catch-all) + 11 SPA routes. Auth = Better Auth session cookies (not JWT). Core practice/SRS/grading + progress are genuinely wired e2e and persist to Postgres.

| Sev | Flow finding | Evidence |
|-----|--------------|----------|
| P1 | IDOR on practice session: next/answer/summary act on `session.user_id` from the looked-up row without asserting it equals `req.userId` — an authed user with another's sessionId can read its summary and submit answers that mutate the other user's score+mastery | PracticeService.nextQuestion/submitAnswer/sessionSummary (no owner assert); routes require_user only |
| P1 | Signup deployed-CTA reportedly no-op (sole acquisition path); in-source Auth.jsx toggle IS wired → deploy/UX gap, needs E2E (signup→first graded question) | persona click; Auth.jsx setMode('signup') + signUp.email |
| P1 | Zero first-value pre-auth (no guest/demo/sample) — all app routes → Auth when !user | App.jsx renderPage() |
| P2 | `GET /api/v1/exercises` is unguarded (published-only read, but no middleware) | routes/exercises.js mounts adminController.listExercises bare |
| P2 | Dead frontend clients → localhost:3000 + nonexistent routes (Exercise.jsx, lib/api.js, utils/api.js), unimported | grep imports |
| P2 | Static long-lived ADMIN_TOKEN (no rotation) | middleware/auth.js requireAdmin path 1 |

Closure gate: add an app-layer `session.user_id === req.userId` (403) check on practice next/answer/summary; ship E2E proving signup→first graded question on the deployed build; add a pre-auth playable sample. Until the IDOR check lands, treat per-user practice data as cross-readable by any authed user who obtains a sessionId.

## Prod Smoke — 2026-05-24-1646
Authorized prod smoke (read-only; no signup/login submitted). Results:
- **API `/api/v1/health`** → 200 `{ok:true,store:pg}` (~5.7s).
- **CONFIRMED P1 — "Sign up" CTA is a NO-OP in prod:** clicked it in agent-browser; post-click snapshot is byte-identical to pre-click (still "Welcome back" login form, no registration form opens). Deploy/build artifact (source toggle is wired). The ONLY acquisition path is broken in prod. Evidence: `smoke-baeu-before-signup.png`, `smoke-baeu-after-signup-click.png`.
- **CONFIRMED P1 — no guest/demo:** `/#/practice` unauth → login wall, zero pre-auth first-value.
- Practice-session IDOR (P1): not exercisable (needs 2 accounts) — code-confirmed only.
- Created: nothing. See `baeu-learning-smoke.md`.

---

## Heavy audit refresh - 2026-05-25-1220

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-25-1220`

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P0 | Acquisition/first-value remains blocked until deployed signup reaches a graded question. | Prior prod smoke confirmed Sign up CTA no-op and no guest/demo; current refresh did not observe a closing deployed E2E. | New user or sanctioned synthetic account: signup -> first practice session -> answer -> feedback -> progress, with cleanup. |
| P1 | Practice-session ownership check remains a security gate. | Flow audit code finding: next/answer/summary rely on looked-up `session.user_id` without asserting it equals authenticated user. | App-layer owner assertion returns 403 for another user's sessionId and tests cover next/answer/summary. |
| P1 | Tempo proof regressed/not currently visible in inventory. | Current Tempo refresh listed only `architrack-api` and `gestor-financeiro-bot`; `baeu-backend` was not observed despite older closed proof. | `tempo-search --service-name baeu-backend` returns traces after a named production request. |
| P2 | Railway cost is moderate for a blocked funnel. | Railway estimated usage refresh: `baeu-learning` about `$1.2317` current-period estimate. | Cost baseline is accepted or reduced after signup/first-value closes. |

---

## Heavy audit refresh - 2026-05-26-1437

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-26-1437`

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Deployed learner first-value improved: prod learner smoke passed with cleanup. | Side E2E: `npm --prefix frontend run e2e:prod-smoke` passed; synthetic account was created and `cleanup: deleted synthetic learner`. Browser also saw `lesson/advanced-vocabulary-1` pass. | Keep prod learner smoke in release gates and add regression evidence for signup -> first graded question. |
| P1 | Practice-session ownership/IDOR remains a hard security gate unless already closed in code. | This run did not execute a two-account ownership attack; prior gap remains code/security-level evidence. | App-layer owner assertion returns 403 for another user's sessionId and tests cover next/answer/summary. |
| P2 | Tempo proof was not visible in this run. | Grafana Tempo service inventory did not include `baeu-backend` in this run. | `tempo-search --service-name baeu-backend` returns traces after a named production request. |

## 2026-05-26-1553 heavy-audit-all update

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Learner path remains the strongest constrained-ready slice, but public shell alone is thin. | Canonical alias `https://baeu-learning.vercel.app/` returned only a minimal shell in the public HTML capture; prior prod learner smoke is the real evidence, not the landing page. Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-26-1553/evidence/public-canonical-smoke.tsv`. | Keep prod learner smoke as release gate and add visible first-value/route evidence for signup -> first graded question. |
| P1 | Admin/cohort/provider readiness remains outside learner readiness. | Heavy scorecard classifies Baeu as LIMITED READY only for learner path. | Admin/cohort/provider smoke passes with cleanup and documented account lifecycle. |

## Fase 2 E2E heavy audit — 2026-05-29-1346

Source: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-29-1346-e2e/projects/valuation-prato-baeu.md`
Gate: `WATCH / public-backend boundaries green`.

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Canonical production surfaces are healthy for read-only checks. | Frontend `https://baeu-learning.vercel.app/` returned 200; backend `https://baeu-backend-production.up.railway.app/api/v1/health` returned `ok=true`, `store=pg`; `/api/v1/modules` returned 200. | Keep canonical backend URL in smoke docs and prefer it over stale endpoint language. |
| P1 | Learner APIs are protected anonymously, but full learner lifecycle was not rerun in this safe pass. | Anonymous `/api/v1/progress/overview` and `/api/v1/practice/next` returned 401. | Run sanctioned learner smoke signup -> module -> practice -> feedback -> progress with cleanup/reuse note. |
| P1 | Admin/provider lifecycle remains outside this proof. | Admin prod smoke requires admin token and write-like import/publish/archive operations; not run. | Run admin/cohort/provider smoke only with approved token and cleanup. |

## Infra/code closure pass — 2026-05-29

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| Closed-local | Practice-session IDOR patched locally. | Service/controller now require `userId`; unit tests plus `backend/tests/practiceRoutes.test.js` assert `403 session_forbidden` for another user's next/answer/summary. Backend `npm test` passed 86/86. | Deploy backend and run two-account boundary proof in prod if buyer/security claim needs live evidence. |
| Closed-prod | Learner lifecycle rerun in production. | `npm run e2e:prod-smoke -- --workers=1` passed on 2026-05-29; synthetic `audit-1780090991478@test.local` deleted by cleanup. | Keep as release gate. |
| Closed-local | Local e2e no longer leaks `.env` provider config. | Playwright config forces local backend `DATABASE_URL=''` and Vite `VITE_API_BASE_URL=''`; admin suite 8/8 and learner/auth/lessons 11/11 passed with these envs. | Preserve before future e2e work. |
| Mitigated-local | `/api/v1/modules` slow path reduced. | `listModulesWithPublishedCounts()` aggregates modules + published counts in one query. | Deploy, then check Railway logs for reduced `[baeu][pg]` slow alarms. |
| Closed-provider-proof | Tempo proof fresh. | Grafana wrapper `tempo-services` includes `baeu-backend`; `tempo-search --service-name baeu-backend` returned 2 traces. | Optional dashboard visual proof only. |
| Still blocked | Google OAuth and Resend delivery. | Safe Railway env-name check says Google client id/secret and `RESEND_API_KEY` absent. | Configure provider envs and run targeted smokes. |
| Still blocked | Admin LLM cost cap. | OpenRouter wrapper auth OK, key `limit: null`. | Set/verify cap before scaled generation. |

## Provider/env follow-up — 2026-05-29

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| Closed-prod | Admin production smoke now passes. | Railway `ADMIN_TOKEN` was injected via `railway run` without printing value; `npm run e2e:prod-admin-smoke -- --workers=1` passed after harness fix. | Keep smoke targeting canonical backend API. |
| Fixed-local | Prod admin smoke targeted wrong origin. | `frontend/e2e/prod-admin-smoke.spec.js` now builds API URLs from `E2E_API_BASE_URL`, `VITE_API_BASE_URL`, or `https://baeu-backend-production.up.railway.app`. | Commit/deploy harness fix. |
| Still blocked | Google OAuth and Resend. | Railway env-name inventory lacks `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `RESEND_API_KEY`; `EMAIL_FROM` exists. | Add provider values and run targeted smokes. |
| Watch | Legacy Vercel env. | Vercel env list still includes `VITE_API_URL` plus canonical `VITE_API_BASE_URL`; code uses `VITE_API_BASE_URL`. | Remove legacy key only with explicit approval. |

## Provider/env connectivity follow-up — 2026-06-05/06

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P0 | Google OAuth continua sem credenciais de produção no Railway. | Inventário seguro do `baeu-backend` indica `GOOGLE_CLIENT_ID=false` e `GOOGLE_CLIENT_SECRET=false`; Vercel/Railway/Neon estão conectados, mas OAuth não. | Criar OAuth client `Baeu Learning Production Web` no Google Cloud com origin `https://baeu-learning.vercel.app` e redirect `https://baeu-backend-production.up.railway.app/api/auth/callback/google`; setar envs no Railway sem imprimir valores; redeploy; smoke de login Google. |
| P1 | OAuth client está pré-preenchido no Chrome, mas ainda não foi criado. | Google Cloud aberto no projeto `ArchiTrack`; form de OAuth Web preenchido e botão Create habilitado. | João confirmar criação externa da credencial; depois capturar ID/secret de forma segura e aplicar no Railway. |
| P1 | Smoke de entrega Resend ainda não está provado. | Env inventory atual mostra Resend presente em produção, mas não houve confirmação de e-mail recebido/inbox. | Rodar forgot-password ou e-mail transacional com conta smoke e verificar entrega via inbox/Gmail connector. |


## Auditoria heavy/product/persona - 2026-06-06-0200

Fonte: `/Users/joaoadair/Documents/AI/Audits/runs/2026-06-06-0200`.

- Status: gap ainda aberto após provider + HTTP + browser persona + repo surface scan.
- Produto: Baeu Learning.
- Próximo gate: Conta smoke/admin padronizada; Google OAuth se for requisito; prova de progressao persistida e admin content import.
- Critério de fechamento: evidência atualizada no run ou smoke recorrente com conta dedicada, sem depender de sessão manual.


## Produto/comercial/TAM/personas - 2026-06-06

Fonte: `/Users/joaoadair/Documents/AI/Audits/runs/2026-06-06-0200/_PRODUCT-COMMERCIAL-TAM.md`.

- Score comercial/produto: **58/100**.
- Tese: Produto learner parece bom para pratica diaria, mas precisa wedge: comunidade K-pop/K-drama ou B2B cultura coreana.
- Anti-tese: B2C language learning tem CAC alto, churn alto e competidores enormes.
- TAM/SAM rough: Nicho global crescente: Duolingo/AJU reporta coreano como 6a lingua mais estudada e 5,5M learners globais; Brasil e submercado menor e B2C baixo ARPU.
- Personas prioritarias: Learner K-pop/K-drama; professor/admin; estudante TOPIK; auditor pedagogico.
- Monetizacao sugerida: R$19-49/mes B2C; cohorts/tutoria podem subir ARPU.
- Gap pontuado: Provar progressao persistida, admin/cohort smoke e decisao Google/OAuth.
- Criterio de fechamento: demonstrar este gap com smoke/prova de primeira jornada e atualizar o score no proximo run.

## Deep product audit — 2026-06-06 (RUN_ID 2026-06-06-0445) — GATE: AMBER

Read-only static audit (no edits, no secrets). Evidence: `~/Documents/AI/Audits/runs/2026-06-06-0445/other/baeu-deep.md`. Live health `{"ok":true,"store":"pg"}`; Railway logs = 11 perf-warnings-at-error-level, all HTTP 200, no 5xx.

**Adaptivity/SRS claim VERIFIED REAL** (not placeholder): SM-2-lite per-item (`SrsService.js`, table `user_exercise_srs`) + per-skill mastery (`MasteryService.js`), both wired into `ExerciseSelector.selectNext()` and recorded on every answer (`PracticeService.js:95-102`). Strongest core-claim implementation in the suite.

| # | Sev | Finding | Evidence |
|---|---|---|---|
| G1 | Med | "Try a sample" = hardcoded single MC; does not showcase adaptive/SRS headline promise. | `frontend/src/pages/Auth.jsx:285-360` |
| G2 | Med | LLM daily cost cap is in-process counter, resets on restart — not billing-grade. | `backend/src/services/LLMGenerator.js:14-37` |
| G3 | Med | `requireEmailVerification: false` — any email signs up + practices immediately. | `backend/src/auth.js:56` |
| G4 | Low | Hard tier ~10/440, ~75% translation-type → fast plateau. | `topik1Content.js`; gaps.md |
| G5 | Low | Perf warnings logged at `error` level (all 200) pollute alerting; 750-850ms cold-wake. | Railway logs |
| G6 | Low | SRS prod-write not re-proven w/ live authed answer this run; prior silent no-op regression. | `SrsService.js:64-102` |

## E2E/Smoke — 2026-06-06-0445
Canonical URL: https://baeu-learning.vercel.app (resolved via vercel api-get /v9/projects/baeu-learning → targets.production.alias[0]; project baeu-learning confirmed).

| Check | Result | Detail |
|---|---|---|
| Local backend `npm test` (node --test) | PASS | 98 passed / 0 fail (35s). Warnings only: Better Auth BASE_URL not set in test env; SRS table missing locally (expected, degrades to no-op). |
| HTTP `/` | PASS | 200, 0.07s |
| HTTP `/api/health` | PASS | 200, 0.04s |
| HTTP hash-router root `/#/` | PASS | 200, 0.05s |

Red flags: none new. SRS prod-write still not re-proven with a live authed answer this run (see G6).

## Correção Prod Smoke — 2026-06-06-0445
- RETRATADO: "backend offline" foi falso positivo (domínio errado no smoke). Backend Railway `baeu-backend-production.up.railway.app/api/v1/health` = 200 {"ok":true,"store":"pg"}.
- P2 (real): Vercel SPA retorna 200+HTML pra qualquer path (catch-all) → health probe na URL Vercel é falso-verde; usar o backend Railway direto. Front aponta via VITE_API_URL.

## Análise Comercial/Produto/UX — 2026-06-06

Fonte: `~/Documents/AI/Audits/product-analysis/baeu-2026-06-06.md`. RUN 2026-06-06. Read-only (sem secrets/edits). Live: health `{ok:true,store:pg}`, `/api/v1/modules total_published=437` (8 módulos), `/api/v1/practice/next`=401 anon.

**GATE: AMBER.** Núcleo adaptativo/SRS é REAL (SM-2-lite + mastery por skill, ambos persistidos no Neon e consumidos no `ExerciseSelector`) — justifica AMBER, não RED. Bloqueado de GREEN por: sample ≠ engine (valor invisível pré-signup), sem monetização/guardrail de custo billing-grade, conteúdo top-tier raso (~10/437 hard, ~75% translation), retenção não-instrumentada. Comercial: NOT READY. Learner-loop: LIMITED-READY (cohort supervisionado).

| Lens | Sub-gate | P0 principal |
|---|---|---|
| Comercial | AMBER→RED | Sem paid loop nem wedge de aquisição; diferenciador invisível ao comprador (sample 1 MC hardcoded, `Auth.jsx:285-360`). |
| Produto | AMBER | Sem first-value real pré-signup; promessa só acessível após o passo de maior fricção. |
| UX | AMBER | Sample é dead-end false-affordance; a11y quase ausente (~6 aria + ~4 keyboard no app inteiro); sem streaks/nudges. |
| Adversarial | AMBER | Sample ≠ engine (false-green primário); SRS prod-write não re-provado live (G6 aberto); "mastery" sem dados de eficácia; retenção não medida. |

**Maior oportunidade comercial:** wedge B2B/cohort (tutores/escolas/sponsors) — a página About já vende exatamente isso e é o único caminho com WTP real e CAC baixo; B2C austero text-only não compete com Anki/Duolingo grátis.

**Maior risco:** retenção estruturalmente não-suportada e não-medida (sem habit loop, sem analytics, sem áudio, ~10 hard items) → churn por novidade no B2C self-serve, sem instrumento para sequer detectá-lo.

**Top recs (com gate de aceite):** R1(P0) demo anônimo real (~5 questões via `/practice/next`, sem conta) · R2(P0) LLM cap billing-grade (persistido, sobrevive restart) · R3(P0/P1) cohort roster + analytics retenção (DAU, day-1/7) · R4(P1) áudio + hard-tier · R5(P1) streak+email nudge (Resend já presente) · R6(P1) placement diagnostic. 30/60/90: provar avaliabilidade → provar que retenção pode existir → provar o moat com números antes de cobrar (R$19–49/mês B2C e/ou por-seat cohort).

## Audit RUN_ID 2026-06-06-0523

**Auditor:** Claude (Cowork) | **Scope:** infra health curl + git log 14d + gaps analysis + E2E analysis
**Gate:** PASS (single-user João) | Scope: ferramenta pessoal, não produto comercial

### Health checks ao vivo (2026-06-06T08:28 UTC)

| Serviço | Status | Tempo | Nota |
|---------|--------|-------|------|
| baeu-backend /health | 200 OK | 0.49s | ok:true, store:pg — acordado apesar de sleep=true |
| baeu-backend /modules | 200 OK | 1.18s | 437 publicados, 8 módulos |
| baeu-backend /exercises | 200 OK | — | endpoint acessível |
| baeu-backend /practice/start | 401 | — | auth barrier esperada; SRS não verificado sem token |
| baeu-frontend | 200 OK | 0.07s | Vercel edge |

### Interpretação do commit "ready-to-use state" (02/06)

**O que ficou incluído (done):** SRS SM-2 ativo em prod (user_exercise_srs criada via migrate:srs); 437 exercícios publicados em 8 módulos; schema.sql agora idempotente (footgun removido); FocusPanel de diagnóstico; CTA "Praticar pontos fracos"; LLM generator com spend cap; SrsService com graceful no-op fallback.

**O que ficou de fora (known gaps não bloqueadores para uso pessoal):**
- Conteúdo translation-heavy (~75%); hard tier com apenas 10 exercícios (vs 218 easy/212 medium)
- Google OAuth e Resend não configurados — password reset só em console.log
- /modules latência 1.18s — slow query (sem índice) flagrada em audit 05/27
- LLM daily cap em memória (resetado no redeploy; não persistido em DB)
- sleep=true no Railway — cold start se ficar inativo; aceitável para uso pessoal

### Gate e entradas para gaps

Gate: **PASS** para uso pessoal João. SRS ativo, conteúdo suficiente (437), learner path funcional.

Entradas sugeridas para o gaps file:
- P1: adicionar índice em `modules order_index, title` e em `exercises(module_id, published)` para reduzir latência /modules de ~1.2s para <200ms.
- P1: configurar RESEND_API_KEY para password reset funcionar em prod.
- P2: persistir LLM daily cap em DB (hoje resetado no redeploy).
- P2: expandir conteúdo hard tier (hoje 10 exercícios) via admin generator com cap.
- P2: smoke recorrente com token real para verificar SRS write path end-to-end.

---

## Frameworks Analysis — 2026-06-06-0454

**Auditor:** Claude (Cowork) | **Escopo:** JTBD/VPC/Kano/AARRR/Moat/Lean | Doc: `frameworks-sintese-2026-06-06.md`

| Severity | Finding | Gate |
|---|---|---|
| P0 | AARRR quebra primeiro na ATIVAÇÃO: parede de signup antes de provar o engine (sample fake `Auth.jsx:285-360`). Teste ≤2 sem: demo anônimo de ~5 questões reais via `/practice/next` (guest token) + analytics day-1/7 + outbound a 3-5 tutores TOPIK | demo real live |
| P1 | Kano: áudio ausente é básico VIOLADO em produto de língua; ~10/437 hard = platô rápido. TTS nos itens de vocab + hard-tier via LLM generator existente (cap persistido em DB) | TTS + tier |
| P1 | Moat: SRS é commodity (Anki grátis); moats possíveis em ordem — dados de eficácia (exige instrumentação, hoje zero), conteúdo TOPIK+diagnóstico zero-setup, B2B tutor/coorte (switching cost social). Posicionamento: "motor de drill TOPIK-1 que diz ao tutor o que está fraco", não "app de coreano" | wedge B2B decidido |
| P2 | Claim de outcome sem dado: "steady mastery" é claim de mecanismo — instrumentar retenção antes de qualquer marketing | day-1/7 medido |

---

## User-Value Frameworks — 2026-06-06-0454

**Auditor:** Claude (Cowork) | **Escopo:** Forças/TTFV/Hooked/HEART/NSM/Peak-End | Doc: `~/Documents/AI/Audits/product-analysis/user-value-frameworks-2026-06-06.md`

| Severity | Finding | Gate |
|---|---|---|
| P0 | 1º valor = diagnóstico de fraqueza ("você erra partículas") após ~5 questões — deve acontecer ANTES da conta; hoje enterrado pós-signup no FocusPanel | demo anônima com diagnóstico no fim |
| P1 | Hooked sem gatilho externo (Resend presente, não configurado) e investimento invisível (sem streak); Peak-End p/ usuário forte = tédio de itens fáceis; celebrar fila-due zerada | nudge + streak + celebração |
| P1 | NSM: itens due completados/usuário/semana; day-1/7 é o sinal vital ausente — dados já persistidos, falta agregar | retention medida |

---

## Análise de Produto (frameworks) — 2026-06-06-0538
Brief: /Users/joaoadair/Documents/AI/Audits/product-analysis/frameworks/2026-06-06-0538/baeu-learning.md
- **Valor real:** alto como ferramenta pessoal (SRS por exercício + FocusPanel = JTBD exato do João) + valor de engenharia: SrsService (SM-2), FocusPanel, LLM generator c/ cap e schema user_exercise_srs são transferíveis.
- **Recomendação:** manter pessoal (decisão registrada correta). B2C amplo: Anki/Duolingo intransponíveis; nicho PT-BR+TOPIK+B2B tutor é marginal.
- **Reaproveitar:** extrair SrsService/FocusPanel/generator como lib interna antes do próximo produto de aprendizado.

## Provider/log check — 2026-06-06-0539

Fonte: `/Users/joaoadair/Documents/Codex/2026-06-06/abra-os-logs-de-railway-e/outputs/stack-deploy-logs-vercel-railway-grafana-2026-06-06-0539.md`.

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Google auth provider está quebrado em prod. | Railway `baeu-backend` 2h error filter: `Better Auth`: `Provider not found ... { provider: 'google' }`. | Configurar/remover Google provider de forma explícita; smoke login Google ou ausência intencional sem erro de provider nos logs. |
| P1 | Latência de `/api/v1/modules` continua aparecendo como erro operacional. | Railway `baeu-backend` 1h: slow SQL ~820ms e `slow GET /api/v1/modules 200 821.3ms`; health 200 ~0.50s. | Índice/cache/EXPLAIN para módulos+contagem de exercícios; meta: `/api/v1/modules` p95 < 200ms em warmed path. |
| P2 | Observabilidade Tempo está conectada para backend, mas não substitui o gap de auth/perf. | Grafana `tempo-search baeu-backend` retornou traces recentes; logs ainda mostram auth provider e slow query. | Manter trace coverage e criar alerta específico para slow module query/auth provider errors. |

---

## Análise Usuário/Valor — 2026-06-06-0548
Brief: /Users/joaoadair/Documents/AI/Audits/product-analysis/frameworks-user/2026-06-06-0548/internal-tools.md
- **Momento de valor:** drill diário porque o sistema LEMBRA + FocusPanel mostra progresso que o Anki não mostra em PT-BR. Parcialmente sentido (~2-3x/semana) mas não mensurável (sem session_start, sem streak observável). Único dos internos com loop Hooked viável (SRS = investimento crescente).
- **Gatilho 30d:** logar sessões + e-mail de streak via Resend + streak na home (~1 dia de eng fecha o loop e torna o hábito verificável).

## Persona/browser smoke — 2026-06-06-1009

| Priority | Finding | Evidence | Closure gate |
|---|---|---|---|
| P1 | Prod learner smoke abortou na primeira navegação, embora o browser sweep leve tenha carregado a landing. A prova de first-value segue instável. | `work/persona-smokes-2026-06-06T1009/baeu-e2e-audit-rerun.log`: `page.goto: net::ERR_ABORTED`; cleanup failed non-fatal. Browser sweep: `/` 200 desktop/mobile com H1 de fluência coreana. | Rodar prod smoke duas vezes seguidas com signup sintético, practice feedback, progress persistence e cleanup OK. |

## Dossiê custo/escala — 2026-06-06-0811

| Estado | Custo/mês | Notas |
|---|---|---|
| Hoje (sleep=true, uso esporádico) | ~R$0 | Neon free + Railway dorme |
| Hábito diário com LLM generator capped | R$10–30 | Neon free + Railway ~R$5–15 sleep-off + LLM R$2–10/mês (gemini-flash, cap 200/dia) |
| Recomendação | **MANTER** | Custo desprezível; SRS real; ferramenta pessoal João |

## UX Smoke — 2026-06-06 (frameworks: 5s/LIFT/Nielsen/Mobile/Tema/WCAG)

Notas: 5s 9 · LIFT 8.5 · Nielsen 8 · Mobile 8.5 · Tema 8 · WCAG 6.5. Evidência: /tmp/ux-smoke/baeu-*.png (temporário).

| Sev | Achado | Evidência | Fix |
|---|---|---|---|
| P1 | Inputs Email/Senha renderizam com fundo escuro (~#333) dentro de card branco em página clara — visual quebrado e texto/placeholder possivelmente ilegível (suspeita: estilo dark-mode/autofill vazando) | baeu-desktop.png e baeu-mobile.png | Forçar bg claro + texto escuro nos inputs |
| P2 | "Check answer" disabled em vermelho claro sobre branco — estado pouco distinguível | baeu-desktop.png | Disabled cinza + tooltip |
| P2 | Headings pulam nível (h1 → h3) | snapshot a11y | Promover seções a h2 |
| P2 | Login abaixo de toda a dobra no mobile (depois de 4 cards) | baeu-mobile.png | CTA "Entrar" sticky/âncora |

## Análise de produto fleet — 2026-06-06 (resumo)

Score comercial 58 (incubar nicho) · Maturidade ~75-80% — **a maior da fleet** (SRS SM-2 vivo, 440 exercícios, e2e 20/20). Dor: learner de coreano quer prática diária estruturada. Adesão: 1 usuário real. Recomendação: lifestyle product — manter barato, cohorts/professor p/ ARPU; sem pressão de GTM. Próximos: índice/cache (queries 800-1200ms), Redis p/ rate-limit, Resend+OAuth. Relatório completo: /Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/2026-06-06-0925-fleet-product-analysis.md
