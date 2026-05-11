// Production smoke. Runs against a deployed frontend (E2E_BASE_URL) and asserts
// the first-value path: signup → module → practice CTA → Start → question-card.
//
// Run with:
//   E2E_NO_WEBSERVER=1 E2E_BASE_URL=https://baeu-learning.vercel.app \
//     npx playwright test e2e/prod-smoke.spec.js
//
// Gated by E2E_PROD_SMOKE=1 so it doesn't run in the default local e2e pass.
// It writes against the real backend, so it creates a synthetic learner each run.

import { test, expect } from '@playwright/test';

const SHOULD_RUN = process.env.E2E_PROD_SMOKE === '1';

test.skip(!SHOULD_RUN, 'set E2E_PROD_SMOKE=1 to run');

// Cleanup hook: delete the synthetic learner created by the smoke so we don't
// pollute the prod DB or hit signup rate-limits on repeated CI runs. Treated
// as non-fatal: if cleanup fails the test still validates the journey.
//
// Better Auth sessions live in an http-only cookie. We call the delete-user
// endpoint via `fetch` in the page context — the cookie travels automatically
// (same-origin since the page can reach the backend directly via CORS).
const BACKEND = 'https://baeu-backend-production.up.railway.app';

test.afterEach(async ({ page }) => {
  try {
    const result = await page.evaluate(async (backend) => {
      try {
        const res = await fetch(`${backend}/api/auth/delete-user`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        const body = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, body };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    }, BACKEND);
    if (result?.ok) {
      console.log('[prod-smoke] cleanup: deleted synthetic learner');
    } else {
      console.warn('[prod-smoke] cleanup failed (non-fatal):', JSON.stringify(result));
    }
  } catch (e) {
    console.warn('[prod-smoke] cleanup skipped (non-fatal):', e.message);
  }
});

test('prod: fresh learner reaches question-card on first practice', async ({ page }) => {
  const email = `audit-${Date.now()}@test.local`;
  const password = 'audit-smoke-1234';

  await page.goto('/');
  await page.getByRole('button', { name: /^sign up$/i }).click();
  await page.locator('input[autocomplete="name"]').fill('Prod Smoke');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign up$/i }).click();

  await expect(
    page.getByRole('heading', { name: /endless practice|module practice/i })
  ).toBeVisible({ timeout: 15_000 });

  await page.getByText(/Hangul & Reading/i).first().click();
  await page.getByTestId('practice-cta').click();

  await expect(page.getByRole('heading', { name: /module practice/i })).toBeVisible();
  await page.getByRole('button', { name: /^start$/i }).click();

  await expect(page.getByTestId('question-card')).toBeVisible({ timeout: 15_000 });

  console.log(`[prod-smoke] synthetic account: ${email}`);
});
