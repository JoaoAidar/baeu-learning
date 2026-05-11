// backend/src/services/EmailService.js
import { Resend } from 'resend';

const DEFAULT_FROM = process.env.EMAIL_FROM || 'Baeu <onboarding@resend.dev>';
// onboarding@resend.dev is Resend's universally-allowed test sender — it
// works without a verified domain so we can ship the flow before Joao
// provisions DNS. Swap to noreply@<verified-domain> by setting EMAIL_FROM.

let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const client = getResend();
  if (!client) {
    // Graceful fallback: log to stdout so the operator can still copy/paste
    // the link manually if needed. Don't throw — Better Auth's flow continues.
    console.log(`[email] (no RESEND_API_KEY) to=${to} subject=${subject} text=${text}`);
    return { ok: true, sent: false, reason: 'no_api_key' };
  }
  try {
    const res = await client.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text,
      replyTo,
    });
    if (res.error) {
      console.error('[email] resend error', res.error);
      return { ok: false, sent: false, error: res.error };
    }
    return { ok: true, sent: true, id: res.data?.id };
  } catch (err) {
    console.error('[email] send exception', err);
    return { ok: false, sent: false, error: err.message || String(err) };
  }
}

export function renderPasswordResetEmail({ name, url }) {
  const safeName = name || 'there';
  const subject = 'Reset your Baeu password';
  const text = `Hi ${safeName},\n\nReset your Baeu password by clicking the link below. The link expires in 1 hour.\n\n${url}\n\nIf you didn't request this, ignore this email.\n\n— Baeu`;
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1f2937">
<h1 style="font-size:20px;margin-bottom:16px">Reset your Baeu password</h1>
<p>Hi ${escapeHtml(safeName)},</p>
<p>Click the button below to reset your password. The link expires in 1 hour.</p>
<p><a href="${url}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a></p>
<p style="font-size:13px;color:#6b7280">Or copy this URL into your browser: <br><span style="word-break:break-all">${escapeHtml(url)}</span></p>
<p style="font-size:13px;color:#6b7280">If you didn't request this, you can safely ignore this email.</p>
<p style="margin-top:24px;font-size:13px;color:#6b7280">— Baeu</p>
</body></html>`;
  return { subject, text, html };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
