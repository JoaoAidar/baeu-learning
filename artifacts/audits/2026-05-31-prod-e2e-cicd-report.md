---
status: active
date: 2026-05-31
generated_at: 2026-05-31T03:17:39.402122+00:00
source: /Users/joaoadair/Documents/Obsidian Vault/70-analysis/fleet-checkups/2026-05-31-fleet-e2e-cicd-check.md
scope: prod-e2e-cicd-persona-agents
---

# Baeu-Learning Prod E2E + CI/CD Persona-Agent Report

## Verdict

`LIMITED READY`

Main blocker: [Errno 2] No such file or directory: 'gh'

## Brutal Audit Personas

These are persona-agent evaluations: each lens assumes the stakeholder role and turns the objection into a concrete iteration gate.

| Persona / Lens | Score | Current Gate |
| --- | ---: | --- |

## Deploy And Providers

| Provider | Status | Evidence |
| --- | --- | --- |
| Vercel | `READY` | baeu-learning-4b8ub6c8x-joaoaidars-projects.vercel.app, commit - |
| Railway | `ok` | Project: baeu-learning
Environment: production
Service: baeu-backend |

Note: provider checks go through local service wrappers/service-env first. If a provider is still auth-failing, fix the wrapper/token layer rather than adding ad hoc token reads to this report.

## Liveness

| Endpoint | Result | p95 | Sample |
| --- | --- | ---: | --- |
| web | 5/5 `[200]` | 77.6ms | <!doctype html> <html lang="en">   <head>     <meta charset="UTF-8" />     <meta name="viewport" content="width=device-width, initial-scale=1.0" />     <title>Baeu — Korean Practic |
| api_health | 5/5 `[200]` | 444.5ms | {"ok":true,"store":"pg"} |

## E2E Findings

| Check | Status | HTTP | Timing | Note |
| --- | --- | ---: | ---: | --- |
| web | `pass` | 200 | 57.0ms | <!doctype html> <html lang="en">   <head>     <meta charset="UTF-8" />     <meta name="viewport" content="width=device-width, initial-scale=1.0" />     <title>Baeu — Korean Practic |

## CI/CD

- Summary: `[Errno 2] No such file or directory: 'gh'`
- CI ok: `false`

## False Green Paths

- HTTP 200 is liveness only; it does not prove the persona gates above.
- Web shell load does not prove authenticated user success.
- CI/local tests do not prove provider, billing, Drive, FX, truth-tier or tenant behavior unless the matching E2E gate is present.
- This report should be treated as iteration input, not a readiness certificate.

## Next Actions

