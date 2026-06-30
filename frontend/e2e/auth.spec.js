import { test, expect } from '@playwright/test';
import { uniqueEmail } from './_helpers.js';

test('landing can switch to signup and play public sample before auth', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('landing-hero')).toBeVisible();
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  await page.getByTestId('auth-switch-signup').click();
  await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  await expect(page.locator('input[autocomplete="name"]')).toBeVisible();

  // Anonymous demo runs the real engine loop. First card: 안녕하세요 → Hello (a).
  await expect(page.getByTestId('public-sample-practice')).toBeVisible();
  await page.getByTestId('demo-option-a').click();
  await expect(page.getByTestId('demo-option-a')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('demo-check').click();
  await expect(page.getByTestId('demo-feedback')).toContainText(/correct/i);
  // Advancing keeps you anonymous (no session created by the demo).
  await page.getByTestId('demo-next').click();
  await expect(page.getByTestId('demo-progress')).toContainText('1/6 learned');

  await expect(page.getByRole('heading', { name: /endless practice/i })).toHaveCount(0);
  await expect(page.getByTestId('logout-btn')).toHaveCount(0);
});

test('signup → home shows modules', async ({ page }) => {
  const email = uniqueEmail('auth');
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /welcome back|create your account/i })).toBeVisible();

  await page.getByTestId('auth-switch-signup').click();
  await page.locator('input[autocomplete="name"]').fill('Auth Test');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('e2etest123');
  await page.getByTestId('auth-submit').click();

  await expect(page.getByTestId('today-panel')).toBeVisible();
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
  await page.context().clearCookies();

  await page.goto('/');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('wrongpass1');
  await page.getByRole('button', { name: /^log in$/i }).click();

  await expect(page.getByText(/wrong email or password/i)).toBeVisible();
});

test('signup with weak password is blocked', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('auth-switch-signup').click();
  await page.locator('input[type="email"]').fill(uniqueEmail('weak'));
  await page.locator('input[type="password"]').fill('short');
  await page.getByTestId('auth-submit').click();

  // Either browser-level minLength validation blocks navigation, or backend rejects.
  await expect(page.getByRole('heading', { name: /create your account|welcome back/i })).toBeVisible();
});

test('unknown route shows recovery instead of silently rendering practice', async ({ page }) => {
  await page.goto('/#/not-a-real-route-e2e');

  await expect(page.getByTestId('not-found-page')).toBeVisible();
  await expect(page.getByRole('heading', { name: /route does not exist/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /back to practice/i })).toBeVisible();
});
