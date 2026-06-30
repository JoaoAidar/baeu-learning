# Baeu Visual Remediation Deploy Proof

Date: 2026-06-30T01:15Z
Executor: Codex

## Deployment

- Project: `baeu-learning`
- Target: production
- Deployment ID: `dpl_FvzFUVqEeJfqXyo3bkgcXdpnkdBS`
- Preview URL: `https://baeu-learning-cprlnuzpy-joaoaidars-projects.vercel.app`
- Canonical alias: `https://baeu-learning.vercel.app`
- Vercel result: `READY`, alias completed

## Production Proof

| Check | Result |
|---|---|
| `npm run e2e:prod-smoke -- --workers=1` | Passed: signup -> feedback -> progress -> relogin persistence -> cleanup |
| `npm run e2e:prod-lifecycle -- --workers=1` | Passed: signup -> theme -> low-data Results -> practice -> results-with-data -> delete |
| Browser wrapper deploy-smoke | Passed `/`, `/#/about`, `/#/progress`, `/#/results`, `/#/chat`, `/#/not-a-real-route-e2e`; `bad_count=0` |

## Notes

- First prod-smoke attempt failed on a test selector because the new Home created two `Hangul & Reading` links; synthetic cleanup still ran. The spec now targets `a[href="#/module/hangul"]`.
- No backend deploy was needed; this pass changed frontend UI, e2e expectations, and audit/docs surfaces.
- Remaining manual gates are unchanged: real learner/sponsor validation, Google OAuth/Resend provider configuration, prod admin smoke with sanctioned `E2E_ADMIN_TOKEN`, and native review for draft lessons.
