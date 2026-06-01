---
status: active
date: 2026-05-27
generated_at: 2026-05-27T17:37:53.951163+00:00
source: /Users/joaoadair/Documents/Obsidian Vault/70-analysis/fleet-checkups/2026-05-27-fleet-e2e-cicd-check.md
scope: prod-e2e-cicd-persona-agents
---

# Baeu-Learning Prod E2E + CI/CD Persona-Agent Report

## Verdict

`READY WITH CAVEATS`

Main blocker: -

## Brutal Audit Personas

These are persona-agent evaluations: each lens assumes the stakeholder role and turns the objection into a concrete iteration gate.

| Persona / Lens | Score | Current Gate |
| --- | ---: | --- |

## Deploy And Providers

| Provider | Status | Evidence |
| --- | --- | --- |
| Vercel | `READY` | baeu-learning-8wf3fyjr9-joaoaidars-projects.vercel.app, commit - |
| Railway | `auth_invalid` | Railway auth failed via CLI keychain and service-env token. Refresh railway login and/or rotate RAILWAY_TOKEN. |

Note: provider checks go through local service wrappers/service-env first. If a provider is still auth-failing, fix the wrapper/token layer rather than adding ad hoc token reads to this report.

## Liveness

| Endpoint | Result | p95 | Sample |
| --- | --- | ---: | --- |
| web | 5/5 `[200]` | 52.1ms | <!doctype html> <html lang="en">   <head>     <meta charset="UTF-8" />     <meta name="viewport" content="width=device-width, initial-scale=1.0" />     <title>Baeu — Korean Practic |
| api_health | 5/5 `[200]` | 374.7ms | {"ok":true,"store":"pg"} |

## E2E Findings

| Check | Status | HTTP | Timing | Note |
| --- | --- | ---: | ---: | --- |
| web | `pass` | 200 | 50.9ms | <!doctype html> <html lang="en">   <head>     <meta charset="UTF-8" />     <meta name="viewport" content="width=device-width, initial-scale=1.0" />     <title>Baeu — Korean Practic |

## CI/CD

- Summary: `Production Smoke:success:ba17b77`
- CI ok: `true`
- Latest run: `Production Smoke` / `completed` / `success` / `ba17b77`
- URL: https://github.com/JoaoAidar/baeu-learning/actions/runs/26517915636

## False Green Paths

- HTTP 200 is liveness only; it does not prove the persona gates above.
- Web shell load does not prove authenticated user success.
- CI/local tests do not prove provider, billing, Drive, FX, truth-tier or tenant behavior unless the matching E2E gate is present.
- This report should be treated as iteration input, not a readiness certificate.

## Next Actions

