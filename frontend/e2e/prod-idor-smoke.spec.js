// Production IDOR smoke. Proves at the DEPLOYED boundary that an authenticated
// user (B) cannot read or mutate another user's (A) practice session — the
// two-account proof repeatedly requested by audits, complementing the in-process
// route test (backend/tests/practiceRoutes.test.js).
//
// Run with:
//   npm run e2e:prod-idor-smoke
//
// Opt-in via E2E_PROD_IDOR_SMOKE=1 because it writes to the real backend: it
// creates TWO synthetic learners and deletes both before exiting (best-effort).

import { test, expect } from '@playwright/test';

const SHOULD_RUN = process.env.E2E_PROD_IDOR_SMOKE === '1';
const API_BASE =
  process.env.E2E_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  'https://baeu-backend-production.up.railway.app';

test.skip(!SHOULD_RUN, 'set E2E_PROD_IDOR_SMOKE=1 to run');

const api = (p) => `${API_BASE}${p}`;

// Each user gets its own request context so the Better Auth session cookie
// (http-only) is isolated per learner — exactly two distinct identities.
async function newUser(playwright, label) {
  const ctx = await playwright.request.newContext({ baseURL: API_BASE });
  const email = `audit-idor-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@test.local`;
  const res = await ctx.post(api('/api/auth/sign-up/email'), {
    headers: { 'Content-Type': 'application/json' },
    data: { email, password: 'audit-idor-1234', name: `IDOR ${label}` },
  });
  expect(res.ok(), `signup ${label} should succeed (${res.status()})`).toBeTruthy();
  return { ctx, email };
}

async function deleteSelf(user) {
  try {
    await user.ctx.post(api('/api/auth/delete-user'), {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
  } catch (e) {
    console.warn(`[prod-idor] cleanup ${user.email} failed (non-fatal):`, e?.message);
  } finally {
    await user.ctx.dispose();
  }
}

test('prod: user B cannot read or mutate user A practice session (IDOR)', async ({ playwright }) => {
  const userA = await newUser(playwright, 'a');
  const userB = await newUser(playwright, 'b');

  try {
    // A owns a session and pulls a real question from it (positive control).
    const sessionRes = await userA.ctx.post(api('/api/v1/practice/sessions'), {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(sessionRes.ok(), 'A creates a session').toBeTruthy();
    const sessionId = (await sessionRes.json()).id;
    expect(sessionId, 'session id present').toBeTruthy();

    const aNext = await userA.ctx.get(api(`/api/v1/practice/next?sessionId=${encodeURIComponent(sessionId)}`));
    expect(aNext.status(), 'A can read its own next question (200)').toBe(200);
    const exerciseId = (await aNext.json()).id;
    expect(exerciseId, 'exercise id present').toBeTruthy();

    // B attacks A's session on all three ownership-guarded routes.
    const bNext = await userB.ctx.get(api(`/api/v1/practice/next?sessionId=${encodeURIComponent(sessionId)}`));
    expect(bNext.status(), 'B next on A session => 403').toBe(403);
    expect(await bNext.json()).toEqual({ error: 'session_forbidden' });

    const bAnswer = await userB.ctx.post(api('/api/v1/practice/answer'), {
      headers: { 'Content-Type': 'application/json' },
      data: { sessionId, exerciseId, answer: 'x' },
    });
    expect(bAnswer.status(), 'B answer on A session => 403').toBe(403);
    expect(await bAnswer.json()).toEqual({ error: 'session_forbidden' });

    const bSummary = await userB.ctx.get(api(`/api/v1/practice/sessions/${encodeURIComponent(sessionId)}/summary`));
    expect(bSummary.status(), 'B summary on A session => 403').toBe(403);
    expect(await bSummary.json()).toEqual({ error: 'session_forbidden' });

    // Positive control: A still owns its session after B's failed attacks.
    const aSummary = await userA.ctx.get(api(`/api/v1/practice/sessions/${encodeURIComponent(sessionId)}/summary`));
    expect(aSummary.status(), 'A can read its own summary (200)').toBe(200);

    console.log(`[prod-idor] proved isolation. A=${userA.email} B=${userB.email}`);
  } finally {
    await deleteSelf(userA);
    await deleteSelf(userB);
  }
});
