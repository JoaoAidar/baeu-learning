import { test, expect } from '@playwright/test';
import { uniqueEmail } from './_helpers.js';

test('signup → home shows modules', async ({ page }) => {
  const email = uniqueEmail('auth');
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /welcome back|create your account/i })).toBeVisible();

  await page.getByRole('button', { name: /^sign up$/i }).click();
  await page.locator('input[autocomplete="name"]').fill('Auth Test');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('e2etest123');
  await page.locator('form').getByRole('button', { name: /^sign up$/i }).click();

  await expect(page.getByRole('heading', { name: /endless practice/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^modules$/i })).toBeVisible();
  await expect(page.getByText(/Hangul & Reading/i).first()).toBeVisible();
});

test('login with wrong password shows error toast', async ({ page }) => {
  const email = uniqueEmail('auth-wrong');
  // Better Auth sign-up endpoint (cookie-based; we only need the user row).
  const res = await page.request.post('/api/auth/sign-up/email', {
    data: { email, password: 'rightpass1', name: 'Wrong Test' },
  });
  expect(res.ok()).toBeTruthy();

  await page.goto('/');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('wrongpass1');
  await page.getByRole('button', { name: /^log in$/i }).click();

  await expect(page.getByText(/wrong email or password/i)).toBeVisible();
});

test('signup with weak password is blocked', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^sign up$/i }).click();
  await page.locator('input[type="email"]').fill(uniqueEmail('weak'));
  await page.locator('input[type="password"]').fill('short');
  await page.locator('form').getByRole('button', { name: /^sign up$/i }).click();

  // Either browser-level minLength validation blocks navigation, or backend rejects.
  await expect(page.getByRole('heading', { name: /create your account|welcome back/i })).toBeVisible();
});
