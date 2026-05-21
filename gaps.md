# Gaps — Baeu Learning

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

**Status 2026-05-21:** code/deploy bootstrap aligned; provider proof still open.

**Checklist:**
- [x] baeu-backend: adicionar `src/instrumentation.js` + deps @opentelemetry.
- [x] Setar 4 envs OTEL_* no Railway baeu-backend (provider UI confirmed names present on 2026-05-20).
- [ ] Redeploy baeu-backend with `backend/railway.toml` `startCommand="npm start"` so `--import=./src/instrumentation.js` is definitely active in production.
- [ ] (opcional) Vercel: ligar log drain para Grafana Loki (sem code change)
- [ ] Validar com `grafana_service.py tempo-services` que `baeu-backend` aparece
- [ ] Confirmar dashboard Robust Ops populado

---

## Persona browser audit — 2026-05-19-2005

**Auditor:** Codex | **Escopo:** browser/persona read-only nos 11 projetos da stack Kairos.

Evidence: `/Users/joaoadair/Documents/Obsidian Vault/70-analysis/persona-browser-audits/2026-05-19/2026-05-19-2005`

| Severity | Persona / stakeholder | Finding | Closure gate |
|---|---|---|---|
| P1 | Learner | Routes return 200 but browser screenshot stalls on Loading; first-value practice not observed. | Fix loading/runtime and run signup/login -> module -> practice -> feedback -> progress smoke. |
| P1 | Buyer/operator | Privacy/billing/plan trust surfaces remain not validated in browser. | Expose privacy/terms/plan status in public shell. |
