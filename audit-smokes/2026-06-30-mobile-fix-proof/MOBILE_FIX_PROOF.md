# Mobile Fix Proof - 2026-06-30

**Target:** `https://baeu-learning.vercel.app`
**Deployment:** `dpl_4B1xiW8yqFmHikvA9cNpSYc6e9z8`
**Source commit before proof append:** `b6554fa`

## Verdict

Mobile remediation is live for the tested learner surfaces. The production build passes the core learner smokes and the post-fix mobile capture verifies the new compact nav, bottom toast placement, low-data Progress CTA, low-data Results simplification, and mobile More menu.

## Evidence

| Check | Result |
|---|---|
| Frontend build | `npm run build` passed. |
| Production learner smoke | `npm run e2e:prod-smoke -- --workers=1` passed. Synthetic learner was deleted. |
| Production lifecycle smoke | `npm run e2e:prod-lifecycle -- --workers=1` passed. Account was deleted through the UI; safety-net cleanup returned the expected unauthorized-after-delete state. |
| Vercel deploy | Production deploy `dpl_4B1xiW8yqFmHikvA9cNpSYc6e9z8` was `READY` and aliased to `https://baeu-learning.vercel.app`. |
| Mobile capture | `mobile-fix-proof.json` shows zero console/page/request errors, zero horizontal overflow, and cleanup `200 success:true`. |

## Screenshots

- `00-landing.png` - public mobile landing/auth entry.
- `01-home-toast-bottom.png` - signup success with toast placed below the main work area instead of over the top nav.
- `02-home-ready-nav-compact.png` - compact mobile nav with Practice, Chat, Progress, Results, and More.
- `03-progress-low-data-cta.png` - fresh/low-data Progress with the new action panel.
- `04-results-collapsed-details.png` - low-data Results reduced to summary plus Details block.
- `06-more-menu.png` - secondary mobile actions behind More.

## Residual Notes

- The automated target-size scan still reports the brand/home link as `89x32`. It is visible and usable, but remains below the 44px comfort target.
- The local default e2e run was not repeated because port `3001` is occupied by an unrelated local Next server from `LicitacoesDash`. I did not kill that process. Production smokes are the release proof for this slice.
