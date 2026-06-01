const { chromium } = require('playwright');

const BASE = 'https://baeu-learning.vercel.app/';
const outDir = '/Users/joaoadair/Documents/Obsidian Vault/70-analysis/persona-browser-audits/2026-05-18/sidecars';
const out = `${outDir}/baeu-landing.png`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', (msg) => logs.push(`console:${msg.type()}:${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`pageerror:${err.message}`));

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  const title = await page.title();
  const h1 = await page.locator('h1').first().innerText({ timeout: 1000 }).catch(() => '');
  const bodyText = await page.locator('body').innerText();
  const signup = await page.getByRole('button', { name: /Sign up|Create your account/i }).count().catch(() => 0);
  const login = await page.getByRole('button', { name: /^Log in$/i }).count().catch(() => 0);

  await page.screenshot({ path: out, fullPage: true });

  const afterClickUrl = page.url();

  await page.getByRole('button', { name: /Forgot password\?/i }).click().catch(() => {});
  await page.waitForTimeout(700);
  const forgotHeading = await page.locator('h2').first().innerText().catch(() => '');

  await page.getByRole('button', { name: /Back to log in/i }).click().catch(() => {});
  await page.waitForTimeout(300);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  const mobileH1 = await page.locator('h1').first().innerText({ timeout: 1000 }).catch(() => '');
  const mobileShot = `${outDir}/baeu-mobile.png`;
  await page.screenshot({ path: mobileShot, fullPage: true });

  const routes = ['#/about', '#/progress', '#/admin', '#/account'];
  const routeChecks = [];
  for (const route of routes) {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);
    const text = await page.locator('body').innerText();
    const hasAuthHint = /Welcome back|Create your account/i.test(text);
    routeChecks.push({ route, url: page.url(), hasAuthHint, snippet: text.slice(0, 220).replace(/\s+/g, ' ') });
  }

  console.log(JSON.stringify({
    title,
    h1,
    bodyTextSnippet: bodyText.slice(0, 600).replace(/\s+/g, ' '),
    counts: { signup, login },
    afterClickUrl,
    forgotHeading,
    mobileH1,
    routeChecks,
    logs,
    screenshots: [out, mobileShot],
  }, null, 2));

  await browser.close();
})();
