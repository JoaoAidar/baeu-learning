// Helpers shared across e2e specs. We target inputs by type/autocomplete
// rather than label, because the Field component wraps inputs inside a <label>
// with both the label text and a hint string, which makes Playwright's
// `getByLabel` see "Password\nAt least 8 characters" instead of just "Password".

import { expect } from '@playwright/test';

export function uniqueEmail(prefix = 'e2e') {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${prefix}-${stamp}@test.local`;
}

export async function signup(page, { email, password = 'e2etest123', displayName = 'E2E' } = {}) {
  email = email || uniqueEmail();
  await page.goto('/');
  await page.getByRole('button', { name: /^sign up$/i }).click();
  await page.locator('input[autocomplete="name"]').fill(displayName);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign up$/i }).click();
  // Wait for home (any post-auth page state) before returning. Better Auth's
  // useSession may take a tick longer than the old localStorage-write to
  // resolve, so the timeout is bumped slightly.
  await expect(
    page.getByRole('heading', { name: /endless practice|module practice/i })
  ).toBeVisible({ timeout: 15_000 });
  return { email, password, displayName };
}

export async function login(page, { email, password }) {
  await page.goto('/');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /^log in$/i }).click();
}

export async function unlockAdmin(page, token) {
  await page.goto('/#/admin');
  await page.getByPlaceholder(/x-admin-token/i).fill(token);
  await page.getByRole('button', { name: /^unlock$/i }).click();
  await expect(page.getByRole('button', { name: /^content$/i })).toBeVisible();
}

// Inside a practice session: wait for the QuestionCard, pick something, submit,
// and click Continue. Returns true if a checkpoint card appeared instead of feedback.
//
// The render sequence after clicking Continue is:
//   feedback unmount → questionCard renders with OLD question (loading=true) →
//   API resolves → questionCard re-renders with NEW question.id
// We use `data-question-id` to wait for the new question to land before clicking,
// otherwise the option button can detach mid-click.
export async function answerOne(page, prevQuestionId = null) {
  const fb = page.getByTestId('feedback-card');
  const cp = page.getByTestId('checkpoint-card');
  const card = page.getByTestId('question-card');

  await expect(fb).toHaveCount(0, { timeout: 10_000 });
  await expect(card).toBeVisible({ timeout: 15_000 });

  // Wait until the question id is different from the previous one.
  if (prevQuestionId) {
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('[data-testid="question-card"]');
        return el && el.getAttribute('data-question-id') && el.getAttribute('data-question-id') !== prev;
      },
      prevQuestionId,
      { timeout: 15_000 }
    );
  }

  const currentQid = await card.getAttribute('data-question-id');

  const mcOptions = card.getByTestId('mc-option');
  const optionCount = await mcOptions.count();
  if (optionCount > 0) {
    await mcOptions.first().click();
  } else {
    await page.getByPlaceholder(/type your answer/i).fill('x');
  }
  await page.getByRole('button', { name: /^submit$/i }).click();

  await expect(fb.or(cp)).toBeVisible({ timeout: 10_000 });

  if (await cp.isVisible()) return { checkpoint: true, qid: currentQid };
  await fb.getByRole('button', { name: /continue/i }).click();
  return { checkpoint: false, qid: currentQid };
}
