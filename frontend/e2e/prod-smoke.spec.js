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
