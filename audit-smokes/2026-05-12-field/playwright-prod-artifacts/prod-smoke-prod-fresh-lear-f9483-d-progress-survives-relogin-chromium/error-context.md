# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: prod-smoke.spec.js >> prod: fresh learner gets feedback and progress survives relogin
- Location: e2e/prod-smoke.spec.js:53:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('stat-total')
Expected substring: "1"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for getByTestId('stat-total')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "배 Baeu · Korean practice" [ref=e6] [cursor=pointer]:
        - /url: "#/"
        - generic [ref=e7]: 배
        - generic [ref=e8]: Baeu
        - generic [ref=e9]: · Korean practice
      - navigation [ref=e10]:
        - link "Practice" [ref=e11] [cursor=pointer]:
          - /url: "#/"
        - link "Progress" [active] [ref=e12] [cursor=pointer]:
          - /url: "#/progress"
        - link "About" [ref=e13] [cursor=pointer]:
          - /url: "#/about"
        - generic [ref=e14]:
          - link "Account" [ref=e15] [cursor=pointer]:
            - /url: "#/account"
          - generic [ref=e16]: ·
          - button "Log out" [ref=e17] [cursor=pointer]
  - main [ref=e18]:
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Streak
          - generic [ref=e23]: 1d
        - generic [ref=e24]:
          - generic [ref=e25]: Total
          - generic [ref=e26]: "1"
        - generic [ref=e27]:
          - generic [ref=e28]: Accuracy
          - generic [ref=e29]: 100%
        - generic [ref=e30]:
          - generic [ref=e31]: Last 7d
          - generic [ref=e32]: "1"
          - generic [ref=e33]: 100%
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]: Skills due
          - generic [ref=e37]: "0"
        - generic [ref=e38]:
          - generic [ref=e39]: Mastered
          - generic [ref=e40]: "0"
      - generic [ref=e41]:
        - heading "Skills" [level=3] [ref=e42]
        - generic [ref=e43]:
          - generic [ref=e45]:
            - generic [ref=e46]:
              - strong [ref=e47]: hangul
              - generic [ref=e48]: Seen
            - generic [ref=e49]: 1/1 · 100%
          - generic [ref=e53]:
            - generic [ref=e54]:
              - strong [ref=e55]: hangul_reading
              - generic [ref=e56]: Seen
            - generic [ref=e57]: 1/1 · 100%
          - generic [ref=e61]:
            - generic [ref=e62]:
              - strong [ref=e63]: vowels
              - generic [ref=e64]: Seen
            - generic [ref=e65]: 1/1 · 100%
```

# Test source

```ts
  1   | // Production smoke. Runs against a deployed frontend (E2E_BASE_URL) and asserts
  2   | // the first-value path: signup -> module -> practice -> feedback -> progress ->
  3   | // logout/login -> persisted progress.
  4   | //
  5   | // Run with:
  6   | //   E2E_NO_WEBSERVER=1 E2E_BASE_URL=https://baeu-learning.vercel.app \
  7   | //     npx playwright test e2e/prod-smoke.spec.js
  8   | //
  9   | // Gated by E2E_PROD_SMOKE=1 so it doesn't run in the default local e2e pass.
  10  | // It writes against the real backend, so it creates a synthetic learner each run.
  11  |
  12  | import { test, expect } from '@playwright/test';
  13  |
  14  | const SHOULD_RUN = process.env.E2E_PROD_SMOKE === '1';
  15  |
  16  | test.skip(!SHOULD_RUN, 'set E2E_PROD_SMOKE=1 to run');
  17  |
  18  | // Cleanup hook: delete the synthetic learner created by the smoke so we don't
  19  | // pollute the prod DB or hit signup rate-limits on repeated CI runs. Treated
  20  | // as non-fatal: if cleanup fails the test still validates the journey.
  21  | //
  22  | // Better Auth sessions live in an http-only cookie. We call the delete-user
  23  | // endpoint via `fetch` in the page context — the cookie travels automatically
  24  | // (same-origin since the page can reach the backend directly via CORS).
  25  | const BACKEND = 'https://baeu-backend-production.up.railway.app';
  26  |
  27  | test.afterEach(async ({ page }) => {
  28  |   try {
  29  |     const result = await page.evaluate(async (backend) => {
  30  |       try {
  31  |         const res = await fetch(`${backend}/api/auth/delete-user`, {
  32  |           method: 'POST',
  33  |           credentials: 'include',
  34  |           headers: { 'Content-Type': 'application/json' },
  35  |           body: '{}',
  36  |         });
  37  |         const body = await res.json().catch(() => ({}));
  38  |         return { ok: res.ok, status: res.status, body };
  39  |       } catch (e) {
  40  |         return { ok: false, error: e?.message || String(e) };
  41  |       }
  42  |     }, BACKEND);
  43  |     if (result?.ok) {
  44  |       console.log('[prod-smoke] cleanup: deleted synthetic learner');
  45  |     } else {
  46  |       console.warn('[prod-smoke] cleanup failed (non-fatal):', JSON.stringify(result));
  47  |     }
  48  |   } catch (e) {
  49  |     console.warn('[prod-smoke] cleanup skipped (non-fatal):', e.message);
  50  |   }
  51  | });
  52  |
  53  | test('prod: fresh learner gets feedback and progress survives relogin', async ({ page }) => {
  54  |   const email = `audit-${Date.now()}@test.local`;
  55  |   const password = 'audit-smoke-1234';
  56  |
  57  |   await page.goto('/');
  58  |   await page.getByRole('button', { name: /^sign up$/i }).click();
  59  |   await page.locator('input[autocomplete="name"]').fill('Prod Smoke');
  60  |   await page.locator('input[type="email"]').fill(email);
  61  |   await page.locator('input[type="password"]').fill(password);
  62  |   await page.locator('form').getByRole('button', { name: /^sign up$/i }).click();
  63  |
  64  |   await expect(
  65  |     page.getByRole('heading', { name: /endless practice|module practice/i })
  66  |   ).toBeVisible({ timeout: 15_000 });
  67  |
  68  |   await page.getByRole('link', { name: /Hangul & Reading/i }).click();
  69  |   await page.getByTestId('practice-cta').click();
  70  |
  71  |   await expect(page.getByRole('heading', { name: /module practice/i })).toBeVisible();
  72  |   await page.getByRole('button', { name: /^start$/i }).click();
  73  |
  74  |   await answerCurrentQuestion(page);
  75  |   await expect(page.getByTestId('feedback-card')).toBeVisible({ timeout: 15_000 });
  76  |
  77  |   await page.getByRole('link', { name: /^progress$/i }).click();
> 78  |   await expect(page.getByTestId('stat-total')).toContainText('1', { timeout: 15_000 });
      |                                                ^ Error: expect(locator).toContainText(expected) failed
  79  |
  80  |   await page.getByRole('button', { name: /log out/i }).click();
  81  |   await expect(page.getByRole('heading', { name: /welcome back|create your account/i })).toBeVisible({ timeout: 15_000 });
  82  |
  83  |   await page.locator('input[type="email"]').fill(email);
  84  |   await page.locator('input[type="password"]').fill(password);
  85  |   await page.getByRole('button', { name: /^log in$/i }).click();
  86  |   await expect(page.getByRole('heading', { name: /endless practice|module practice/i })).toBeVisible({ timeout: 15_000 });
  87  |
  88  |   await page.getByRole('link', { name: /^progress$/i }).click();
  89  |   await expect(page.getByTestId('stat-total')).toContainText('1', { timeout: 15_000 });
  90  |
  91  |   console.log(`[prod-smoke] synthetic account: ${email}`);
  92  | });
  93  |
  94  | async function answerCurrentQuestion(page) {
  95  |   const card = page.getByTestId('question-card');
  96  |   await expect(card).toBeVisible({ timeout: 15_000 });
  97  |
  98  |   const mcOptions = card.getByTestId('mc-option');
  99  |   if (await mcOptions.count()) {
  100 |     await mcOptions.first().click();
  101 |   } else {
  102 |     await card.locator('input').fill('x');
  103 |   }
  104 |
  105 |   await page.getByRole('button', { name: /^submit$/i }).click();
  106 | }
  107 |
```