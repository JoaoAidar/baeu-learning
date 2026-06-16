// Production smoke for the conversation simulator. Signs up a synthetic learner,
// has a one-turn Korean chat with a persona (real LLM), ends it, asserts the
// feedback view renders, then deletes the account.
//
// Run with:
//   npm run e2e:prod-chat-smoke -- --workers=1
//
// Gated by E2E_PROD_CHAT_SMOKE=1. Writes against the real backend and spends a
// couple of real LLM calls, so it is opt-in only.

import { test, expect } from '@playwright/test';

const SHOULD_RUN = process.env.E2E_PROD_CHAT_SMOKE === '1';
test.skip(!SHOULD_RUN, 'set E2E_PROD_CHAT_SMOKE=1 to run');

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
        return { ok: res.ok, status: res.status };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    }, BACKEND);
    if (result?.ok) console.log('[prod-chat-smoke] cleanup: deleted synthetic learner');
    else console.warn('[prod-chat-smoke] cleanup failed (non-fatal):', JSON.stringify(result));
  } catch (e) {
    console.warn('[prod-chat-smoke] cleanup skipped (non-fatal):', e.message);
  }
});

test('prod: learner can chat with a persona and get feedback', async ({ page }) => {
  const email = `audit-chat-${Date.now()}@test.local`;
  const password = 'audit-smoke-1234';

  await page.goto('/');
  await page.getByRole('button', { name: /^sign up$/i }).click();
  await page.locator('input[autocomplete="name"]').fill('Chat Smoke');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign up$/i }).click();

  await expect(
    page.getByRole('heading', { name: /endless practice|module practice/i })
  ).toBeVisible({ timeout: 15_000 });

  // Open the conversation simulator.
  await page.getByRole('link', { name: /^chat$/i }).click();
  await expect(page.getByRole('heading', { name: /conversation practice/i })).toBeVisible({ timeout: 15_000 });

  // Pick a persona → chat room with the opening message.
  await page.getByTestId('persona-minji-friend').click();
  await expect(page.getByTestId('end-chat-btn')).toBeVisible({ timeout: 20_000 });

  // Send one Korean message and wait for the persona's reply (LLM round-trip).
  await page.getByTestId('chat-input').fill('안녕! 나는 잘 지내. 너는?');
  await page.getByTestId('chat-send').click();
  // A persona reply is a left-aligned bubble; after our message there should be
  // at least 2 persona bubbles (opening + reply). Give the LLM generous time.
  await expect
    .poll(async () => page.locator('[lang="ko"]').count(), { timeout: 45_000 })
    .toBeGreaterThanOrEqual(3); // opening + learner + reply

  // End the chat and get feedback.
  await page.getByTestId('end-chat-btn').click();
  await expect(page.getByRole('heading', { name: /chat feedback/i })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('heading', { name: /did your meaning come across/i })).toBeVisible();

  console.log(`[prod-chat-smoke] synthetic account: ${email}`);
});
