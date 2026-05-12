# Baeu-Learning Gaps Live

This file was created by the Kairos full audit run **2026-05-11-2253**
because no `gaps-live.md` existed previously. Subsequent audits should
append entries here rather than recreate.

## Kairos full audit — 2026-05-11-2253

**Auditor:** Claude (Cowork) | **Escopo:** infra + functional + visual(PARTIAL) + product nos 9 projetos.
**Source report:** `/Users/joaoadair/Documents/AI/Audits/kairos-audit-2026-05-11-2253.md`

### Achados

| Severity | Finding | Status |
|---|---|---|
| OK | Backend API `/api/v1/health` 200 (`{"ok":true,"store":"pg"}`) em 2.3s a partir de SLEEPING — cold start funciona. | Liveness OK. |
| OK | Railway `baeu-backend` sleep=true coerente com app pre-buyer/baixo tráfego; Neon `ancient-butterfly-19493910` last_active 2026-05-12T00:12Z, compute=0.7h. | Sem alerta. |
| OK | Frontend `https://baeu-learning.vercel.app` 200 (title `Baeu — Korean Practice`). | Servindo. |
| P0 | `joao-stack/SKILL.md` lista a URL backend como `baeu-learning-api-production.up.railway.app` — essa URL retorna 404 "Application not found". A URL real é `baeu-backend-production.up.railway.app`. Service name renomeado: `baeu-learning-api` → `baeu-backend`. | Corrigir joao-stack e qualquer doc/script que use o nome antigo antes de próximo audit. |
| P1 | Visual rendering / console / network não foi auditado (Chrome MCP off neste run). | Rerodar Module 3 com browser conectado. |
| P1 | Não há `gaps-live.md` anterior — este é o baseline. Não há histórico para comparar drift. | Próximas auditorias devem appendar abaixo. |
| P2 | Vercel framework=vite; sem prova de smoke E2E público nesta sessão. | Adicionar smoke nativo (web `/` 200 + backend `/api/v1/health` 200) ao fleet. |

### Closure gates de produto

- **Não conheço** os gates de produto Baeu (não havia gaps-live anterior). Próximo passo: rodar `kairos-product-audit` standalone para Baeu e capturar a primeira matriz persona/journey/gate aqui.

### Sources

- Run artifacts: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-11-2253/`
- joao-stack reference: `/Users/joaoadair/.agents/skills/joao-stack/SKILL.md` (Baeu-Learning section — flag para drift de URL).

## Fresh full audit — 2026-05-11-2208

Source report: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-11-2208/consolidated/KAIROS_FULL_AUDIT_2026-05-11-2208.md`

**Verdict:** LIMITED READY / WATCH. Public frontend and canonical backend are live, but learner first-value, deployment truth, and observability are still the closing gates.

| Severity | Surface | Finding | Closure gate |
|---|---|---|---|
| OK | Infra | `https://baeu-learning.vercel.app` returned 200 and canonical backend `/api/v1/health` returned 200 with `store: pg`. | Keep both endpoints in registry/smokes and avoid older Railway aliases. |
| P1 | Produto | First-time learner proof is still incomplete in this fresh run. | Prod smoke proves signup/login -> practice question -> answer feedback -> progress update, with cleanup notes. |
| P1 | Deploy | Railway `baeu-backend` is sleeping and backend release truth is still manual/source-link sensitive. | Link Railway GitHub source or attach explicit `railway up` + health/header proof for backend changes. |
| P1 | Observability | Grafana/OTEL/Faro logs were not proven with sanctioned dashboard evidence. | Add dashboard/query proof or mark the project as not instrumented in the ops report. |
| P2 | Conteudo/Admin | Admin/content generation and module lesson depth still need production-safe validation. | Sanctioned admin smoke plus minimum lesson availability per module. |

## Gap validation sweep - 2026-05-11-2306

**Verdict:** WATCH / LIMITED READY pre-buyer. The latest reports agree that Baeu is live enough for controlled validation, but not buyer-demo-clean until learner first-value and backend registry truth are closed.

**Landing/canonical URL:** frontend `https://baeu-learning.vercel.app`; canonical backend `https://baeu-backend-production.up.railway.app/api/v1/health`. Do not use stale `baeu-learning-api-production.up.railway.app`.

**Top 3 gaps:**

| Priority | Gap | Closure gate |
|---|---|---|
| P1 | First-value learner journey remains unproven in prod. | Sanctioned prod smoke covers signup/login -> practice question -> answer feedback -> progress update, with cleanup notes. |
| P1 | Backend URL/service registry drift remains a false-green trap. | `joao-stack`, fleet smokes, and docs all use `baeu-backend-production.up.railway.app`; stale Railway alias removed from audit inputs. |
| P1 | Browser visual/console/network and observability proof were not captured because Chrome MCP was unavailable. | Rerun visual/product smoke with browser connected and record Grafana/OTEL/Faro proof or explicit not-instrumented status. |

**Closure gates:** keep web/backend liveness in recurring smokes; prove first-value learner path; fix registry URL drift; rerun prod-smoke after current E2E edits; label minimum lesson/module depth for demo.

**Source report:** `/Users/joaoadair/Documents/AI/Audits/latest.md`; `/Users/joaoadair/Documents/AI/Audits/kairos-audit-2026-05-11-2253.md`; `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-11-2208/consolidated/KAIROS_FULL_AUDIT_2026-05-11-2208.md`.

## Canonical Vercel URL correction - 2026-05-11-2312

Source: Vercel project `domains` API captured at `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-11-2306/vercel-canonical-domains-summary.json`.

Canonical frontend domain remains `https://baeu-learning.vercel.app`. Backend health must use `https://baeu-backend-production.up.railway.app/api/v1/health`, not the stale `baeu-learning-api` Railway alias.

## Product + persona audit - 2026-05-11-2322

**Source sidecar:** `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/sidecars/worker-c-baeu-anamnese-fazenda.md`

**Canonical URL:** `https://baeu-learning.vercel.app` confirmed from Vercel project `domains` API for project `baeu-learning`.

**Personas:**
- First-time Korean learner: wants to sign up and reach practice value without Joao narrating.
- Parent/sponsor/buyer: checks whether the product is credible enough for paid beta or demo.
- Pedagogy/adversarial auditor: challenges feedback quality, module credibility, review logic, and false-green routes.

**Routes/states observed:**
- `/` desktop public entry: renders real Baeu app with login/signup and product promise.
- Signup: synthetic account `worker-c-2322-baeu@example.com` created; password not stored here.
- Authenticated practice: modules loaded, practice session started, answer submitted, incorrect-answer feedback shown.
- Progress: counters and skill/error sections visible after one practice attempt, including mobile viewport.
- `/about`: trust/about surface observed.
- `/not-a-real-route-2322`: HTTP 200 and SPA fallback to authenticated practice home, not explicit 404.

**Verdict:** LIMITED READY for learner beta; WATCH for buyer/demo. Fresh signup -> practice question -> answer feedback -> progress was browser-proven in production, closing the previous "first-value unproven" gap for one synthetic learner session. Buyer readiness remains weak because trust/pricing/proof/pedagogy surfaces are thin, and unknown routes can look green while hiding routing problems.

**Top P0/P1/P2:**
- P1: Add buyer/demo trust surface with pricing or pilot terms, curriculum authority, pedagogy scope, and clear caveats.
- P1: Prove persistence/review intelligence across logout/relogin or reload, not only one live session counter.
- P1: Unknown routes should render a clear not-found/recovery state or intentional redirect, not silent HTTP 200 app fallback.
- P2: Expand product evidence for admin/content controls and TOPIK/module credibility.

**Closure gates:**
- Browser smoke with sanctioned synthetic account proves signup/login -> practice question -> answer feedback -> progress persistence after reload/relogin.
- `/about` or a buyer/demo route explains curriculum scope, content authority, pricing/pilot terms, and what Baeu is not claiming.
- Unknown routes return explicit 404/recovery UX or an intentionally documented redirect.
- Admin/content import/generation path has a safe demo or is explicitly marked out of public scope.

**Evidence paths:**
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-desktop-entry.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-signup-boundary.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-after-signup-or-error.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-practice-question.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-practice-feedback.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-progress-after-practice.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-mobile-progress.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-about-trust-surface.png`
- `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/product-audits/runs/2026-05-11-2322/evidence/baeu-error-route.png`

**Cleanup/reuse note:** synthetic user `worker-c-2322-baeu@example.com` has one incorrect practice attempt; keep as audit-only test user or delete after evidence retention.
## Smoke + E2E audit - 2026-05-11-2345

- Canonical HTTP smoke: PASS. Web `https://baeu-learning.vercel.app/` returned 200 in 45ms; API health returned 200 in 567ms.
- Browser E2E: PASS after serial rerun. Initial parallel run hit a local Playwright page setup timeout; rerun with `npm run e2e:prod-smoke` produced `1 passed (9.2s)`.
- Evidence: `/Users/joaoadair/Documents/AI/Audits/runs/2026-05-11-2345/e2e/baeu-e2e-rerun-serial.log`.
- Cleanup: the synthetic learner `audit-1778555017384@test.local` was deleted by the smoke cleanup.
- Current gap: fresh learner reaches first practice card in production, but persistence/relogin/progress history and teacher/buyer reporting are still unproven.
- Next step: extend the prod smoke to log out/in with the same learner, verify progress persistence, and expose a buyer-facing trust/reporting checkpoint.

## Kairos persona-browser-audit — 2026-05-11-2323

**Auditor:** Claude (Cowork) via subagente paralelo com agent-browser CLI. 3 personas inferidas (não há vault docs): Korean learner / dedicated student / adversarial QA. Canonical: `baeu-learning.vercel.app`.
**Source report:** `/Users/joaoadair/Documents/AI/Audits/persona-audit-2026-05-11-2323.md`
**Per-project report:** `/Users/joaoadair/Documents/AI/Audits/persona-runs/2026-05-11-2323/per-project/baeu.md` (DOM snapshots — screenshots hung repetidamente)

**Verdict:** **LIMITED READY** — surpresa positiva. Mais clean do portfolio em termos de console/copy.

### Achados

| Severity | Finding | Status |
|---|---|---|
| OK | **Zero console output, zero errors em todas as rotas** — raro neste portfolio. | Validação positiva. |
| OK | Signup → first question loop em ~30s; account creation síncrono; sem email-verification dead end; PG store real; toast '환영합니다!'. | Validação positiva. |
| OK | Module-scoped drilling funciona (Hangul → ㅎ consonant question corretamente tagged); module detail page mostra skill breakdown honesto. | Validação positiva. |
| OK | '412 questions across 8 modules' bate matematicamente: 62+21+40+25+53+117+36+58=412 ✓. | Validação positiva. |
| OK | Copy mais honesto do portfolio: 'we want to earn the right to charge before we ask'. | Validação positiva. |
| P1 | Multiple-choice Submit silenciosamente falhou em avançar após seleção válida (translation Submit funcionou — bug MC-específico). | Fix MC component. |
| P2 | Translation placeholder lê 'Type in Hangul…' enquanto prompt pede meaning em inglês. | Fix placeholder. |
| P2 | Mid-quiz refresh perde in-progress card. | Persistir estado. |
| P2 | Google OAuth não testado (per directive — não usar conta real). | Testar com conta fake dedicada se possível. |
| P2 | Delete-account confirmation pattern não verificado. | Cobrir em audit futuro. |

## Iteration plan execution - 2026-05-12

**Scope:** close the next learner-proof and buyer/demo-clean gates without widening the product surface.

### Changes in progress

| Gap | Action | Closure signal |
|---|---|---|
| Prod first-value stops too early. | Extend production smoke from question-card only to answer feedback, Progress, logout/login, and persisted Progress. | `npm run e2e:prod-smoke` proves attempt count survives relogin and synthetic user cleanup runs. |
| Unknown routes silently fall back to app home/practice. | Add explicit not-found recovery UI for unmatched hash routes. | Local E2E covers `#/not-a-real-route-e2e` and sees `not-found-page`. |
| Translation prompt placeholder implies Hangul even when answer should be English. | Make non-MC placeholder generic/translation-aware. | Local E2E/build pass; future persona audit no longer sees "Type in Hangul..." on translation meaning prompts. |
| Progress lacks stable smoke selectors. | Add deterministic `data-testid` on Progress stat cards. | Prod smoke can assert `stat-total` after relogin. |

### Still open after this slice

- Mid-quiz refresh persistence is still not implemented.
- Google OAuth remains provider-config gated.
- Resend production delivery remains provider-config gated.
- Railway GitHub source link remains a dashboard action.
- Admin/content production smoke and lesson-depth work remain separate.

## Field smoke + brutal/persona audit - 2026-05-12

**Source report:** `/Users/joaoadair/Documents/AI/Baeu_Learning/audit-smokes/2026-05-12-field/FIELD_SMOKE_REPORT.md`

**Verdict:** LIMITED READY for controlled desktop field validation; WATCH / not clean for mobile field validation.

| Severity | Surface | Finding | Evidence | Closure gate |
|---|---|---|---|---|
| OK | Backend/tests | Backend test suite passed 72/72. | `audit-smokes/2026-05-12-field/backend-test.log` | Keep this green before field/demo changes. |
| OK | Frontend/local | Frontend build passed; local Playwright passed 16, with the prod-only smoke skipped locally. | `frontend-build.log`, `frontend-e2e-local-rerun.log` | Keep local suite green after mobile/header fix. |
| OK | Desktop production | Fresh synthetic learner completed signup -> module practice -> answer feedback -> progress Total 1 -> logout -> login -> persisted progress Total 1; cleanup succeeded. | `prod-browser-journey-visible-final.log` | Preserve this exact flow in `npm run e2e:prod-smoke`. |
| P1 | Production deploy/test drift | Official prod smoke failed because deployed bundle lacks `data-testid="stat-total"` even though current repo has it; screenshot still showed Total 1. | `frontend-e2e-prod-smoke-rerun.log`, `prod-asset-check.log`, prod screenshot. | Redeploy current frontend, rerun `npm run e2e:prod-smoke`, expect 1 passed. |
| P1 | Mobile browser UX | Pixel/mobile journey reached first value and progress, but logout click was blocked by header layout pointer interception. | `prod-browser-mobile-failed-final.png`, final browser log. | Mobile viewport must pass signup -> progress -> logout -> login -> persisted progress without force-click. |
| Watch | Railway auth/tooling | Railway wrapper/API works, but direct `railway variables` OAuth is stale/Unauthorized. | `cleanup-field-users.log`; provider wrapper evidence still ok. | Run `railway login` before variable-level CLI work. |

**Cleanup:** all synthetic `field-*` accounts created in this run were deleted through app/API cleanup. The cleanup log redacts the temporary sign-in token.

## Mobile fix + persona-browser-audit - 2026-05-12

**Source report:** `/Users/joaoadair/Documents/AI/Baeu_Learning/audit-smokes/2026-05-12-mobile-fix/MOBILE_PERSONA_BROWSER_AUDIT.md`

**Verdict:** READY for the tested mobile learner journey on Pixel 5. This closes the previous P1 mobile logout/session-recovery blocker for the core field flow.

| Severity | Surface | Finding | Evidence | Closure gate |
|---|---|---|---|---|
| OK | Mobile header | Header now wraps on mobile, keeps nav items as non-breaking targets, and exposes `data-testid="logout-btn"`. | `frontend/src/App.jsx`; `local-mobile-journey.log`. | Pixel/mobile logout must remain clickable without force-click. |
| OK | Production deploy | Vercel production deploy `baeu-learning-5eu3wqgnh-joaoaidars-projects.vercel.app` is `READY` and aliased to `https://baeu-learning.vercel.app`. | `vercel-deploy-prod.log`, `vercel-deployments-after-deploy.json`. | Keep canonical alias on latest READY deploy. |
| OK | Prod smoke | `npm run e2e:prod-smoke` passed after deploy: signup -> practice -> feedback -> progress -> logout/login -> persisted progress; cleanup succeeded. | `frontend-e2e-prod-smoke.log`. | Keep this smoke green before field/demo claims. |
| OK | Persona mobile | First-time TOPIK learner on Pixel 5 completed entry -> signup -> module practice -> feedback -> progress -> logout -> login -> persisted progress; no console errors, failed requests, or >=400 browser responses. | `persona-mobile-prod-audit.log`, screenshots `persona-mobile-01` through `persona-mobile-08`. | Repeat this audit if header/nav changes. |
| Watch | Buyer/pedagogy trust | This was a focused mobile/session audit, not a full buyer/domain credibility re-score. | Audit scope. | Run broader persona audit later if field feedback asks for trust, pricing, or pedagogy proof. |

**Cleanup:** synthetic account `persona-mobile-1778602194180@test.local` was deleted by the audit cleanup.

## Railway GitHub source link + autodeploy validated — 2026-05-12

**Why this entry exists:** earlier audits (this file: 2026-05-11-2253, 2026-05-11-2208, 2026-05-11-2306) flagged "backend release truth is still manual/source-link sensitive" as a closing gate. That gate is now closed.

### What changed

- `baeu-backend` (service `abf4f7f2-68a9-4b3a-acd1-ae0d4fd6fcf0`) was linked to the GitHub repo `JoaoAidar/baeu-learning`, branch `main`, root directory `backend`.
- Railway GraphQL confirms: `repoTriggers` has 1 edge (`repository: JoaoAidar/baeu-learning`, `branch: main`), and `serviceInstances[0].source.repo = "JoaoAidar/baeu-learning"`, `rootDirectory = "backend"`. Shape matches the working pattern on `anamnese-api` and `ecommify-api`.

### Validation evidence

| Check | Result |
|---|---|
| Initial deploy on link creation | `2026-05-12T16:17:11.672Z` — Railway auto-deployed when the source was connected. |
| No-op commit (`62d6018`) pushed at 16:18:43 | Autodeploy `59a93a41-6091-4395-97ad-526e1c6d083c` SUCCESS at **16:18:47** (4s after push). |
| Post-deploy health | `GET /api/v1/health` → 200 `{"ok":true,"store":"pg"}`. |

The manual `cd backend && railway up --service baeu-backend --ci` step previously documented in `DEPLOY.md` and used in every prior backend release of this session is no longer required for normal pushes to `main`. It remains as a fallback if the GitHub source ever drifts.

### Verification one-liner (future audits)

```sh
TOKEN=$(grep RAILWAY_API_TOKEN /Users/joaoadair/.agents/service-env/railway.env | cut -d= -f2-)
curl -s -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"query":"{ service(id: \"abf4f7f2-68a9-4b3a-acd1-ae0d4fd6fcf0\") { repoTriggers { edges { node { repository branch } } } serviceInstances { edges { node { source { repo } rootDirectory } } } } }"}' \
  | python3 -m json.tool
```

Expected: `source.repo = "JoaoAidar/baeu-learning"`, `rootDirectory = "backend"`, `repoTriggers.edges` non-empty.

### Open follow-ups (manual provider steps)

These are tracked in `RUNBOOK.md` and are the only remaining P1 items I can verify externally via API:

| Env var | State (2026-05-12) | What it gates | Detection method |
|---|---|---|---|
| `RESEND_API_KEY` | MISSING | Password-reset email actually ships (falls back to `console.log` URL when unset). | GraphQL `variables(...)` key presence. |
| `EMAIL_FROM` | MISSING | Override the default `Baeu <onboarding@resend.dev>` sender once a custom domain is verified on Resend. | Same. |
| `GOOGLE_CLIENT_ID` | MISSING | Enable "Continue with Google" button (frontend already rendered; backend errors `PROVIDER_NOT_FOUND` until set). | Same; smoke: `POST /api/auth/sign-in/social {provider:google}` returns 200 not 404. |
| `GOOGLE_CLIENT_SECRET` | MISSING | Pair of the above. | Same. |

All three (Resend + Google ID/Secret) trigger automatic Railway redeploy via the now-live GitHub source watcher when set — no manual `railway up` needed. Detection-side: GraphQL `variables(projectId, environmentId, serviceId)` returns the var names (not values), so future audits can poll without printing secrets.

### Content seed gap

Persona/product audits still flag (`worker-c-baeu-anamnese-fazenda.md`, 2026-05-11-2322) that 3 of 8 modules have zero grammar lessons (`greetings`, `vocab-daily`, `reading`). Closure requires Korean-language content authoring; no LLM seed path planned. Tracked in `RUNBOOK.md §4`. Not a code or infra gate.
