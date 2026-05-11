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

const PROD_API_BASE = 'https://baeu-backend-production.up.railway.app';

// Cleanup hook: delete the synthetic learner created by the smoke so we don't
// pollute the prod DB or hit signup rate-limits on repeated CI runs. Treated
// as non-fatal: if cleanup fails the test still validates the journey.
test.afterEach(async ({ page, request }) => {
  let token = null;
  let email = null;
  try {
    token = await page.evaluate(() => localStorage.getItem('baeu_token'));
    email = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('baeu_user');
        return raw ? (JSON.parse(raw).email || null) : null;
      } catch (_) {
        return null;
      }
    });
  } catch (_) {
    // page may already be closed; nothing to clean up
  }
  if (!token) return; // signup probably failed before token was set
  try {
    const res = await request.delete(`${PROD_API_BASE}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[prod-smoke] cleanup ${email || '(unknown email)'}: ${res.status()}`);
  } catch (e) {
    console.warn('[prod-smoke] cleanup failed (non-fatal):', e.message);
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
