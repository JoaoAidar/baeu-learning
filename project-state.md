---
project: Baeu Learning
repo_path: /Users/joaoadair/Documents/AI/Baeu_Learning
generated_at: 2026-06-29T21:54:00-03:00 (open-closure refresh)
source_branch: main
source_commit: 3e732dd (2026-06-13, PR #7)
freshness: open-closure audit 2026-06-29 — reflete smokes prod learner + IDOR e testes locais verdes
confidence: high (código + smokes prod + testes locais; provider/admin gates ainda separados)
---

# Project State — Baeu Learning

> **NOTA 2026-06-13:** o sprint de 13/06 (PRs #2–#7, todos merged/deployados) fechou
> praticamente todo o backlog técnico/UX. As seções abaixo foram atualizadas; o
> histórico anterior de "Gate UX: BLOCK" foi superado. Fonte de verdade viva: topo de
> `gaps-live.md`.

## Verified Runtime State (2026-06-13)

**Refresh 2026-06-29:** backend health prod voltou `200 {"ok":true,"store":"pg"}`;
frontend prod voltou `200`; `backend npm test` passou `128/128`; `frontend npm run build`
passou; `frontend npm run e2e` passou `20` e pulou `5` specs opt-in; `npm run
e2e:prod-smoke -- --workers=1` passou com cleanup; `npm run e2e:prod-idor-smoke
-- --workers=1` passou com duas contas sintéticas e cleanup. Evidence:
`audit-smokes/2026-06-29-open-closure/OPEN_CLOSURE_AUDIT.md`.

- Frontend prod: `https://baeu-learning.vercel.app` → SPA Vite hash-router. Sprint 06-13
  corrigiu `lang` (`en` + spans `lang="ko"`), meta/OG, título dinâmico por rota.
- Backend prod: `https://baeu-backend-production.up.railway.app/api/v1/health` →
  `{"ok":true,"store":"pg"}`. Health canônico é `/api/v1/health` (`/api/health` sem v1 = 404).
- Google OAuth: **OCULTO por flag** (`VITE_GOOGLE_SIGN_IN_ENABLED` default-off,
  `Auth.jsx`). Sem credencial real no Railway; não há mais CTA quebrado em prod.
  Reabrir só se quiser Google login de verdade.
- SRS: SM-2 por item em `backend/src/services/SrsService.js`; lógica pura extraída
  para `backend/src/lib/srs/` (asset de fleet, sprint 06-13). Sinais de aprendizado
  (automaticity, forgetting/leeches, pace por skill, sentence-error fino, review
  forecast) surfaced em Results + Progress (PRs #3–#7).
- Landing: demo SRS real de 6 cartas usando o engine (itens errados ressurgem) —
  não é mais o MC hardcoded.
- Reset de senha existe (rota `#/reset-password`, e-mail via Resend).

## Veredito estratégico (run 1214 — NÃO re-derivar)

- **LIFESTYLE legítimo.** ICE 7.7 lifestyle / 4.7 B2C. Não perseguir GTM B2C.
- Extrair SRS engine como lib interna da fleet (ver gaps-live/backlog C).
- Cohort B2B (tutor + alunos) só se surgir organicamente.

## Decisões Round 2 (2026-06-07)

- **LIFESTYLE declarado; sem GTM B2C.** Nenhum funil pago, nenhuma landing de venda.
- **Kill suave datado:** sem uso (João = 0 prática) até **2026-09-07** → arquivar como
  lifestyle (export dump SRS/attempts, README "ARCHIVED", sleep Railway, manter Vercel estático).
- **Extração SRS lib ganha o MESMO prazo (2026-09-07):** `nextSrsState` é função pura;
  acoplamento é só `getStore` — extrair antes do checkpoint para o arquivamento não
  matar o único asset de fleet.
- **Quick-wins custo zero PERMITIDOS apesar do gate BLOCK:** esconder botão Google
  (flag), `lang` correto, meta/OG — ~2h total.
- **NSM pessoal:** `dias com prática SRS concluída` (não MAU, não signups).
- Re-smoke 2026-06-07-1557: zero commits desde 06-06; OAuth social segue 404 live;
  placar 0 fechado em prod / 9 persistem / 2 não-testáveis / 1 fechado por baseline (#12).
- **Re-run 2026-06-07-2334:** botão Google OCULTADO em prod (flag
  `VITE_GOOGLE_SIGN_IN_ENABLED` default-off, `Auth.jsx:15/:249`; deploy 21:43
  `dpl_FnZtuj8UZbXjgC83eLfxQjMZSP4Z` = latest READY Vercel). **ATENÇÃO: mudança
  NÃO COMMITADA — prod à frente do git; commitar Auth.jsx + .env.example.**
  `lang="en"`, 0 og:, sample hardcoded e 3 camadas de tokens persistem. Cold start
  segue NOT_OBSERVED (3 runs).

## Gates

- Gate UX: **DESBLOQUEADO** — o BLOCK de 06-07 (1×P0 + 4×P1) foi fechado pelo sprint
  06-13. P0 #1 (demo SRS landing), #3 lang, #4 meta/OG, #5 TTS, #10 cold-start: todos
  FECHADOS + deployados. Ver topo de `gaps-live.md`.
- Fluxo learner first-value: **PROVADO** em prod (melhor média UX do portfólio).
- Observabilidade: traces (Tempo), logs (Loki) e métricas (Prometheus) PROVADOS live (PR #3).

## Envs (NOMES apenas — valores nunca)

- Backend (Railway): `PORT`, `NODE_ENV`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `ADMIN_TOKEN`, `CORS_ORIGIN`, `DATABASE_URL` (Neon), `GOOGLE_CLIENT_ID`*,
  `GOOGLE_CLIENT_SECRET`* (*ausentes em prod → OAuth morto), `RESEND_API_KEY`,
  `EMAIL_FROM`, `LLM_API_KEY` (OpenRouter), `LLM_BASE_URL`, `LLM_MODEL`.
- Frontend (Vercel): `VITE_API_BASE_URL`.

## O que funciona vs mock

- Funciona em prod: auth e-mail/senha + reset, practice loop, grading, SRS scheduling,
  progress/streak, sinais de aprendizado, demo SRS na landing, lessons/modules, admin (token).
- Oculto por flag (não morto): botão Google (sem credencial real; escondido default-off).
- Sem mock-mode no produto; conteúdo é seed real (TOPIK 1, ~440 itens, hard tier 50).

## Canonical Commands

Ver `AGENTS.md` → Safe Commands. Health read-only:
`curl https://baeu-backend-production.up.railway.app/api/v1/health`

## Do Not Do

- Não criar GTM/landing B2C (decisão 1214).
- Não usar alias antigo `baeu-learning-api`.
- Não rodar geração LLM de admin em escala (custo OpenRouter).
- Não ler/printar `.env*` ou valores de env.

## Next Actions (ordem ICE)

Os sprints de 13/06 (PRs #2–#7, deployados) fecharam quase tudo — UX, demo SRS na
landing, sinais de aprendizado, observabilidade, hard tier, índice /modules.

**Backlog atual (refresh 2026-06-30T01:15Z: brutal visual remediation shipped):**
0. **Visual/product-intent remediation shipped** — production deploy
   `dpl_FvzFUVqEeJfqXyo3bkgcXdpnkdBS` is live at `https://baeu-learning.vercel.app`.
   Prod proof: learner first-value smoke passed, lifecycle smoke passed, public route
   deploy-smoke passed. Evidence: `audit-smokes/2026-06-29-brutal-visual-audit/DEPLOY_PROOF.md`.
1. **Market-first-value / retenção** — learner loop está provado, mas ainda falta
   validação real ou demo assistida de retorno diário/WTP: card corrigido + progresso
   persistido + próxima tarefa + confirmação de próximo passo.
2. **Provider/admin gates manuais** — Google OAuth e Resend delivery dependem de
   credenciais/configuração; admin prod smoke depende de `E2E_ADMIN_TOKEN` sancionado.
3. **Conteúdo/pedagogia** — reduzir dominância de `translation` (~75%) com tipos
   discriminantes: conjugação `fill_blank`, contraste de partículas `multiple_choice`,
   reconhecimento por áudio (TTS ko-KR já existe), + hard de gramática. Lote aditivo
   via `npm run seed:new`.
4. **Manutenção viva:** NSM pessoal = dias com prática SRS. Soft-kill datado 2026-09-07
   se uso = 0. Não abrir GTM B2C sem sinal orgânico (regra 2-de-3, ver `gaps-live.md`).

**Sem pendências de higiene de deploy abertas:** PRs #2–#7 commitados + merged + deployados.
