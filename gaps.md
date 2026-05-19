# Gaps — Baeu Learning

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

**Checklist:**
- [ ] baeu-backend: adicionar `src/instrumentation.ts` + 5 deps @opentelemetry
- [ ] Setar 4 envs OTEL_* no Railway baeu-backend
- [ ] Redeploy baeu-backend
- [ ] (opcional) Vercel: ligar log drain para Grafana Loki (sem code change)
- [ ] Validar com `grafana_service.py tempo-services` que `baeu-backend` aparece
- [ ] Confirmar dashboard Robust Ops populado
