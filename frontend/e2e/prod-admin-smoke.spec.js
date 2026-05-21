// Production admin smoke. Opt-in because it writes to the real backend.
//
// Run with:
//   E2E_ADMIN_TOKEN=<token> npm run e2e:prod-admin-smoke
//
// The token is never printed. The imported exercise is archived before the
// test exits so it does not stay visible to learners.

import { test, expect } from '@playwright/test';

const SHOULD_RUN = process.env.E2E_PROD_ADMIN_SMOKE === '1';
const ADMIN_TOKEN = process.env.E2E_ADMIN_TOKEN || '';

test.skip(!SHOULD_RUN, 'set E2E_PROD_ADMIN_SMOKE=1 to run');
test.skip(!ADMIN_TOKEN, 'set E2E_ADMIN_TOKEN to run production admin smoke');

test('prod admin: import, list, publish visibility, archive', async ({ request }) => {
  const marker = `prod-admin-${Date.now()}`;

  const importRes = await request.post('/api/v1/admin/exercises/import', {
    headers: { 'x-admin-token': ADMIN_TOKEN, 'Content-Type': 'application/json' },
    data: [
      {
        type: 'translation',
        difficulty: 'easy',
        prompt: `${marker} Korean admin smoke`,
        correct_answer: '안녕',
        accepted_answers: ['안녕'],
        skill_tags: ['greetings'],
        status: 'published',
      },
    ],
  });
  expect(importRes.ok()).toBeTruthy();
  const imported = await importRes.json();
  const exerciseId = imported?.ids?.[0];

  const publishedRes = await request.get('/api/v1/admin/exercises?status=published', {
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  expect(publishedRes.ok()).toBeTruthy();
  const published = await publishedRes.json();
  const hit = (published.exercises || []).find((e) => (e.prompt || '').includes(marker));
  expect(hit, 'imported exercise should appear in published admin list').toBeTruthy();

  const id = exerciseId || hit.id;
  const archiveRes = await request.patch(`/api/v1/admin/exercises/${id}/status`, {
    headers: { 'x-admin-token': ADMIN_TOKEN, 'Content-Type': 'application/json' },
    data: { status: 'archived' },
  });
  expect(archiveRes.ok()).toBeTruthy();

  const archivedRes = await request.get('/api/v1/admin/exercises?status=archived', {
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  expect(archivedRes.ok()).toBeTruthy();
  const archived = await archivedRes.json();
  expect((archived.exercises || []).some((e) => (e.prompt || '').includes(marker))).toBeTruthy();
});
