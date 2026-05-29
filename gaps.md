# Gaps — Baeu Learning

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
