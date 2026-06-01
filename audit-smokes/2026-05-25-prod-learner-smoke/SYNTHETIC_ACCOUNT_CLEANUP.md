# Synthetic Account Cleanup - 2026-05-25

Scope: controlled production learner smoke against `https://baeu-learning.vercel.app` and canonical backend `https://baeu-backend-production.up.railway.app`.

## Accounts

| Account | Source | Result |
|---|---|---|
| `audit-1779712380351@test.local` | First prod-smoke run; Playwright passed, but log tee path was wrong. | Cleanup reported `deleted synthetic learner`. |
| `audit-1779712447588@test.local` | Canonical saved run in `frontend-e2e-prod-smoke.log`. | Cleanup reported `deleted synthetic learner`. |

## Reuse Rule

Do not reuse these exact accounts for future login checks; both were deleted after the smoke. Reuse the existing smoke harness and account pattern instead:

```sh
cd /Users/joaoadair/Documents/AI/Baeu_Learning/frontend
npm run e2e:prod-smoke -- --workers=1
```

Expected cleanup signal:

```text
[prod-smoke] cleanup: deleted synthetic learner
```

If cleanup does not print that signal, preserve the log and either delete through the Account screen while still logged in or rerun a targeted cleanup with the same session cookie. Do not inspect provider secrets or hidden auth state.
