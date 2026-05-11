import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { sendEmail, renderPasswordResetEmail } from '../src/services/EmailService.js';

before(() => {
  // Force the no-key fallback branch. Tests never call Resend for real.
  delete process.env.RESEND_API_KEY;
});

test('sendEmail returns no_api_key fallback when RESEND_API_KEY is unset', async () => {
  const res = await sendEmail({
    to: 'user@example.com',
    subject: 'Hi',
    text: 'hello',
    html: '<p>hello</p>',
  });
  assert.equal(res.ok, true);
  assert.equal(res.sent, false);
  assert.equal(res.reason, 'no_api_key');
});

test('renderPasswordResetEmail includes name, url, subject, text, html', () => {
  const { subject, text, html } = renderPasswordResetEmail({
    name: 'Alice',
    url: 'https://example.com/reset?token=abc123',
  });
  assert.match(subject, /Reset your Baeu password/);
  assert.match(text, /Alice/);
  assert.match(text, /https:\/\/example\.com\/reset\?token=abc123/);
  assert.match(html, /Alice/);
  assert.match(html, /https:\/\/example\.com\/reset\?token=abc123/);
});

test('renderPasswordResetEmail defaults missing name to "there"', () => {
  const { text, html } = renderPasswordResetEmail({ url: 'https://x.test/r' });
  assert.match(text, /Hi there/);
  assert.match(html, /Hi there/);
});

test('renderPasswordResetEmail escapes HTML in name to prevent injection', () => {
  const { html, text } = renderPasswordResetEmail({
    name: '<script>alert(1)</script>',
    url: 'https://x.test/r',
  });
  // The raw script tag must not appear unescaped in HTML output.
  assert.ok(!html.includes('<script>alert(1)</script>'), 'raw script tag leaked into html');
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  // The plaintext branch is allowed to keep the original characters — it
  // isn't rendered as markup. Just sanity-check it has the name in some form.
  assert.match(text, /script/);
});
