import { test, expect } from '@playwright/test';
import { signup } from './_helpers.js';

test('module page lists grammar lessons', async ({ page }) => {
  await signup(page);
  await page.getByText(/^Particles$/i).click();
  await expect(page.getByRole('heading', { name: /grammar lessons/i })).toBeVisible();
  // At least one of our particle lessons should appear
  await expect(page.getByText(/Topic vs Subject/i).first()).toBeVisible();
});

test('clicking a lesson opens the markdown reader and renders body', async ({ page }) => {
  await signup(page);
  await page.getByText(/^Particles$/i).click();
  await page.getByText(/Topic vs Subject/i).first().click();

  // Lesson reader header
  await expect(page.getByRole('heading', { name: /Topic vs Subject/i })).toBeVisible();
  // Markdown body should render: a heading from inside the markdown
  await expect(page.getByRole('heading', { name: /the rule in one line/i })).toBeVisible();
  // And a table — the rule reference table
  await expect(page.getByText(/Comparing or contrasting/i)).toBeVisible();

  // "Practice now" CTA links to practice
  await expect(page.getByRole('link', { name: /practice now/i })).toBeVisible();
});

test('back link from lesson returns to the module page', async ({ page }) => {
  await signup(page);
  await page.getByText(/^Particles$/i).click();
  await page.getByText(/Object marker/i).first().click();
  await expect(page.getByRole('heading', { name: /Object marker/i })).toBeVisible();

  await page.getByRole('link', { name: /^← back$/i }).first().click();
  await expect(page.getByRole('heading', { name: /^Particles$/i })).toBeVisible();
});
