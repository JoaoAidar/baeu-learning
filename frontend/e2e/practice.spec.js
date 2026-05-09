import { test, expect } from '@playwright/test';
import { signup, answerOne } from './_helpers.js';

test('global endless practice: start → answer → continue', async ({ page }) => {
  await signup(page);
  await page.getByRole('link', { name: /start practice/i }).click();
  await expect(page.getByRole('heading', { name: /endless practice/i })).toBeVisible();
  await page.getByRole('button', { name: /^start$/i }).click();

  await answerOne(page);
  await expect(page.getByText(/this session/i)).toBeVisible();
});

test('module-scoped practice only pulls from that module', async ({ page }) => {
  await signup(page);

  await page.getByText(/Hangul & Reading/i).first().click();
  await expect(page.getByRole('heading', { name: /Hangul & Reading/i })).toBeVisible();

  await page.getByRole('link', { name: /practice this module/i }).click();
  await expect(page.getByRole('heading', { name: /module practice/i })).toBeVisible();
  await page.getByRole('button', { name: /^start$/i }).click();

  let prev = null;
  for (let i = 0; i < 3; i++) {
    const r = await answerOne(page, prev);
    prev = r.qid;
  }
});

test('checkpoint appears after 10 attempts', async ({ page }) => {
  test.setTimeout(180_000);
  await signup(page);
  await page.goto('/#/practice');
  await page.getByRole('button', { name: /^start$/i }).click();

  let prev = null;
  for (let i = 0; i < 12; i++) {
    const r = await answerOne(page, prev);
    if (r.checkpoint) {
      await expect(page.getByText(/last 10 questions/i)).toBeVisible();
      return;
    }
    prev = r.qid;
  }
  throw new Error('checkpoint never appeared in 12 attempts');
});
