import { test, expect } from '@playwright/test';
import { unlockAdmin } from './_helpers.js';

const ADMIN_TOKEN = process.env.E2E_ADMIN_TOKEN || 'dev-admin-e2e';

test('admin token gate accepts valid token', async ({ page }) => {
  await page.goto('/#/admin');
  await expect(page.getByRole('heading', { name: /^admin$/i })).toBeVisible();
  await page.getByPlaceholder(/x-admin-token/i).fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: /^unlock$/i }).click();
  await expect(page.getByRole('button', { name: /^content$/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^calibration$/i })).toBeVisible();
});

test('admin token gate rejects bogus token (toast forbidden)', async ({ page }) => {
  await page.goto('/#/admin');
  await page.getByPlaceholder(/x-admin-token/i).fill('not-the-token');
  await page.getByRole('button', { name: /^unlock$/i }).click();
  // List call after unlock fires with bad token → toast 'forbidden'.
  await expect(page.getByText(/forbidden/i)).toBeVisible({ timeout: 8_000 });
});

test('admin: paste JSON → import → published list contains the new exercise', async ({ page }) => {
  await unlockAdmin(page, ADMIN_TOKEN);

  const marker = `e2e-import-${Date.now()}`;
  const payload = JSON.stringify([
    {
      type: 'translation',
      difficulty: 'easy',
      prompt: `${marker} (translate)`,
      correct_answer: '테스트',
      accepted_answers: ['테스트'],
      skill_tags: ['e2e'],
      status: 'published',
    },
  ]);

  await page.getByPlaceholder(/^\[/).fill(payload);
  await page.getByRole('button', { name: /^import$/i }).click();

  // Switch filter to published — the new item should show up regardless of toast lifetime.
  await page.getByTestId('status-filter').selectOption('published');
  await expect(page.getByText(marker)).toBeVisible({ timeout: 10_000 });
});

test('admin: publish + archive transitions on a draft exercise', async ({ page }) => {
  await unlockAdmin(page, ADMIN_TOKEN);

  const marker = `e2e-flow-${Date.now()}`;
  // Insert as draft via API for determinism — the UI flow itself is exercised below.
  const insertRes = await page.request.post('/api/v1/admin/exercises/import', {
    headers: { 'x-admin-token': ADMIN_TOKEN, 'Content-Type': 'application/json' },
    data: [
      {
        type: 'translation',
        prompt: `${marker} (draft)`,
        correct_answer: 'x',
        accepted_answers: ['x'],
        skill_tags: ['e2e'],
        status: 'draft',
      },
    ],
  });
  expect(insertRes.ok()).toBeTruthy();

  // The Content tab defaults to status=draft. Force a reload by selecting
  // a different filter then back — selecting the same value is a no-op.
  await page.getByTestId('status-filter').selectOption('archived');
  await page.getByTestId('status-filter').selectOption('draft');
  await expect(page.getByText(marker)).toBeVisible({ timeout: 10_000 });

  // Click Publish on the matching row (testid scopes us to a single row)
  const draftRow = page.getByTestId('exercise-row').filter({ hasText: marker }).first();
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/admin/exercises/') && r.url().includes('/status') && r.ok()),
    draftRow.getByRole('button', { name: /^publish$/i }).click(),
  ]);

  // The list reload after publish removes the row from `draft` view automatically.
  await expect(page.getByTestId('exercise-row').filter({ hasText: marker })).toHaveCount(0, { timeout: 10_000 });

  // Switch to published, verify it appears
  await page.getByTestId('status-filter').selectOption('published');
  await expect(page.getByText(marker)).toBeVisible({ timeout: 10_000 });

  // Archive it
  const pubRow = page.getByTestId('exercise-row').filter({ hasText: marker }).first();
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/admin/exercises/') && r.url().includes('/status') && r.ok()),
    pubRow.getByRole('button', { name: /^archive$/i }).click(),
  ]);

  await page.getByTestId('status-filter').selectOption('archived');
  await expect(page.getByText(marker)).toBeVisible({ timeout: 10_000 });
});

test('admin: invalid JSON shows error toast', async ({ page }) => {
  await unlockAdmin(page, ADMIN_TOKEN);
  await page.getByPlaceholder(/^\[/).fill('not json {');
  await page.getByRole('button', { name: /^import$/i }).click();
  await expect(page.getByText(/invalid json/i)).toBeVisible();
});

test('admin: calibration tab loads', async ({ page }) => {
  await unlockAdmin(page, ADMIN_TOKEN);
  await page.getByRole('button', { name: /^calibration$/i }).click();
  await expect(page.getByRole('heading', { name: /recent wrong attempts/i })).toBeVisible();
});
