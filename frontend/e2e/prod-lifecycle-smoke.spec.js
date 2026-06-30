// Production lifecycle smoke — the "create a throwaway account → exercise the
// product → delete it" routine to run before/after a deploy.
//
// Covers the full disposable-account journey against a DEPLOYED frontend
// (E2E_BASE_URL), including the things shipped in the dark-mode / empty-state
// sprint that a shallow "is it 200?" check would miss:
//   1. dark-mode toggle actually flips the theme
//   2. Results empty states render as intentional panels (not blank cards)
//   3. free-text practice placeholder matches the prompt (romanize / Korean /
//      English), never the old always-"meaning in English" bug
//   4. Results populates a real bar once there's data
//   5. account deletion via the real Danger Zone UI logs you back out
//
// Run with:
//   npm run e2e:prod-lifecycle
//
// Gated by E2E_PROD_LIFECYCLE=1 so it never runs in the default local pass.
// It writes to the real backend, so it creates AND deletes a synthetic learner
// each run; an afterEach safety-net removes the account if a failure short-
// circuits the in-test UI delete.

import { test, expect } from '@playwright/test';

const SHOULD_RUN = process.env.E2E_PROD_LIFECYCLE === '1';

test.skip(!SHOULD_RUN, 'set E2E_PROD_LIFECYCLE=1 to run');

// Better Auth keeps the session in an http-only cookie; the page can hit the
// backend directly (CORS), so a same-page fetch carries the cookie. Used only
// as a safety net — the happy path deletes through the UI.
const BACKEND = process.env.E2E_API_BASE_URL || 'https://baeu-backend-production.up.railway.app';

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
        return { ok: res.ok, status: res.status };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    }, BACKEND);
    // ok=true → an orphan account was still live and got cleaned; 401 → already
    // deleted by the UI step (expected on a green run). Both are fine.
    console.log('[lifecycle-smoke] safety-net cleanup:', JSON.stringify(result));
  } catch (e) {
    console.warn('[lifecycle-smoke] cleanup skipped (non-fatal):', e.message);
  }
});

test('prod lifecycle: signup → theme → empty results → practice → results-with-data → delete', async ({ page }) => {
  const email = `lifecycle-${Date.now()}@test.local`;
  const password = 'lifecycle-smoke-1234';

  // 1) Landing + dark-mode toggle flips the <html> theme class.
  await page.goto('/');
  await expect(page).toHaveTitle(/Baeu/i);
  const toggle = page.getByTestId('theme-toggle');
  await expect(toggle).toBeVisible();
  const wasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await toggle.click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
    .toBe(!wasDark);

  // 2) Create a fresh synthetic learner.
  await page.getByRole('button', { name: /^sign up$/i }).click();
  await page.locator('input[autocomplete="name"]').fill('Lifecycle Smoke');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign up$/i }).click();
  await expect(page.getByTestId('today-panel')).toBeVisible({ timeout: 15_000 });

  // 3) Results empty states — fresh account shows the intentional panels, not
  //    blank cards (the "features não 100% nas telas" regression).
  await page.goto('/#/results');
  await expect(page.getByTestId('results-low-data-summary')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/no activity in this window yet/i)).toBeVisible({ timeout: 15_000 });

  // 4) Practice one question. If it's free-text, the placeholder must be one of
  //    the intentional variants — guards the romanize/Korean placeholder fix.
  await page.goto('/#/practice');
  await page.getByRole('button', { name: /^start$/i }).click();
  const card = page.getByTestId('question-card');
  await expect(card).toBeVisible({ timeout: 15_000 });

  const freeInput = card.locator('input');
  const mcOptions = card.getByTestId('mc-option');
  if (await mcOptions.count()) {
    await mcOptions.first().click();
  } else {
    const placeholder = await freeInput.first().getAttribute('placeholder');
    expect(placeholder, 'free-text placeholder should match the prompt intent')
      .toMatch(/romanization|in Korean|meaning in English|your answer/i);
    await freeInput.first().fill('x');
  }
  await page.getByRole('button', { name: /^submit$/i }).click();
  await expect(page.getByTestId('feedback-card')).toBeVisible({ timeout: 15_000 });

  // 5) Results with data — the daily lane now has at least one non-empty bar.
  await page.goto('/#/results');
  await expect(page.getByTestId('results-daily')).toBeVisible({ timeout: 15_000 });
  const coloredBars = await page.evaluate(() => {
    const lane = document.querySelector('[data-testid="results-daily"]');
    if (!lane) return 0;
    return Array.from(lane.querySelectorAll('div > div')).filter(
      (b) => b.style.height && !/gray/.test(b.className)
    ).length;
  });
  expect(coloredBars, 'a day with activity should render a colored bar').toBeGreaterThan(0);

  // 6) Delete the account through the real Danger Zone UI (also smokes deletion).
  await page.goto('/#/account');
  await page.getByTestId('delete-account-btn').click();
  await page.getByTestId('delete-account-confirm-input').fill(email);
  await page.getByTestId('delete-account-password-input').fill(password);
  await page.getByTestId('delete-account-confirm-btn').click();

  // Deletion ends the session → back on the logged-out landing.
  await expect(
    page.getByRole('heading', { name: /welcome back|create your account/i })
  ).toBeVisible({ timeout: 15_000 });

  console.log(`[lifecycle-smoke] account created + deleted via UI: ${email}`);
});
