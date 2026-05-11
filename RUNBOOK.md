# Baeu Operator Runbook

Step-by-step for the manual provider actions that close the remaining P1s. Run each as needed, in any order.

---

## 1. Google OAuth ("Continue with Google" button)

Frontend already renders the button. Backend gates Google on both `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` being set — both unset right now.

1. **Create OAuth client** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Project: any (create a "Baeu Learning" project if you don't have one).
   - APIs & Services → Credentials → **Create Credentials → OAuth client ID** → **Web application**.
   - **Authorized JavaScript origins** (one):
     ```
     https://baeu-learning.vercel.app
     http://localhost:5173
     ```
   - **Authorized redirect URIs** (two):
     ```
     https://baeu-backend-production.up.railway.app/api/auth/callback/google
     http://localhost:3001/api/auth/callback/google
     ```
   - Save. Copy the **Client ID** + **Client secret**.

2. **Set Railway env vars** (from the repo root or `backend/`):
   ```sh
   railway variables \
     --set "GOOGLE_CLIENT_ID=<paste client id>" \
     --set "GOOGLE_CLIENT_SECRET=<paste client secret>"
   ```

3. **Redeploy backend**:
   ```sh
   cd backend && railway up --service baeu-backend --ci
   ```

4. **Smoke**: open `https://baeu-learning.vercel.app/`, click "Continue with Google", complete consent → you land back on the practice screen, signed in.

### Optional: OAuth consent screen

If your OAuth client is in "Testing" mode (Google's default), only test-list users can sign in. To unlock for everyone, go to OAuth consent screen → publish (User type "External"). Google will require basic branding (app name, logo, privacy policy URL). For an early-access free product the test mode is fine.

---

## 2. Railway GitHub source link (kill the manual `railway up`)

Today every backend release is `cd backend && railway up --service baeu-backend --ci`. Fix: link the GitHub repo to the Railway service so pushes to `main` auto-deploy (like Vercel already does for the frontend).

1. Railway dashboard → `baeu-learning` project → `baeu-backend` service → **Settings**.
2. **Source** section → "Connect Repo" → pick `JoaoAidar/baeu-learning`.
3. **Branch**: `main`.
4. **Root Directory**: `backend`.
5. **Watch Paths** (optional, recommended): `backend/**` — so frontend-only commits don't trigger backend redeploys.
6. Save. Next push to `main` should auto-deploy.

**Verify**: run `python3 ~/.agents/tools/service-wrappers/railway_service.py inventory --format json | grep -A2 baeu-backend` — `source.repo` should no longer be `null`.

Then push a no-op commit to confirm autodeploy fires. Once that works, **drop the manual `railway up` step from DEPLOY.md** (it'll still work as a fallback for emergencies).

---

## 3. Resend (transactional email for password reset)

Code is already shipped. Without `RESEND_API_KEY` set, the password-reset URL only logs to Railway stdout — the flow works but no email is sent.

1. **Sign up at [resend.com](https://resend.com)** (free tier: 3,000 emails/month, no credit card).
2. Dashboard → **API Keys** → **Create API Key** → name "Baeu prod", scope "Sending access only". Copy.
3. **Set Railway env var**:
   ```sh
   railway variables --set "RESEND_API_KEY=re_..."
   ```
4. **Redeploy**:
   ```sh
   cd backend && railway up --service baeu-backend --ci
   ```
5. **Smoke**: on the live site, click "Forgot password?", enter a real email you own, submit. Check inbox/spam. The link routes to `https://baeu-learning.vercel.app/#/reset-password?token=...`.

### Sender identity

Default sender is `Baeu <onboarding@resend.dev>` — Resend's universal test sender. Works without DNS, but lands in many spam folders. To use a custom sender:

1. Resend dashboard → **Domains** → **Add Domain** → enter the domain you own (e.g. `baeu.app`).
2. Add the SPF/DKIM/MX records Resend gives you (Cloudflare/Namecheap UI). Verify.
3. Once verified, set on Railway:
   ```sh
   railway variables --set "EMAIL_FROM=Baeu <noreply@baeu.app>"
   ```
4. Redeploy backend.

Deliverability jumps significantly once on a verified custom domain.

---

## 4. Content seed for the 3 empty modules

Three modules currently have zero grammar lessons: **greetings**, **vocab-daily**, **reading**. Symptom: when the practice engine surfaces an error tag tied to one of those modules, `findLessonForErrorTag` silently returns null → no recommended lesson.

Two paths:

- **Author by hand** (recommended for quality): write 3-5 lessons per module in Markdown matching the existing `grammar_lessons` schema (`slug`, `module_id`, `title`, `summary`, `body_md`, `related_error_tags`, `related_skill_tags`, `order_index`). Insert via `backend/src/db/grammarLessons.js` or a SQL script.
- **LLM-generate via admin endpoint**: the existing `POST /api/v1/admin/exercises/generate` covers exercise generation, NOT lessons. There's no lesson-generation endpoint yet. If you want one, that's a ~2h feature (LLMGenerator extension + new route + admin UI). Worth it once you have the email flow live and a few hundred users.

For now, the practice flow degrades gracefully (no toast, just no recommended-lesson card) so this is genuinely deferrable.

---

## Quick reference: env var matrix

| Var | Where | Required | Effect |
|---|---|---:|---|
| `BETTER_AUTH_SECRET` | Railway | ✅ | JWT/session signing. Already set. |
| `BETTER_AUTH_URL` | Railway | ✅ | Better Auth's base URL. Already set. |
| `CORS_ORIGIN` | Railway | ✅ | Comma-separated allowed origins. Already set. |
| `DATABASE_URL` | Railway | ✅ | Neon connection string. Already set. |
| `ADMIN_TOKEN` | Railway | ✅ | Operator x-admin-token. Already set. |
| `GOOGLE_CLIENT_ID` | Railway | — | Enables "Continue with Google". Empty = button toasts an error. |
| `GOOGLE_CLIENT_SECRET` | Railway | — | Pair of the above. |
| `RESEND_API_KEY` | Railway | — | Empty = password-reset URL only logged to stdout, no email sent. |
| `EMAIL_FROM` | Railway | — | Override the default `Baeu <onboarding@resend.dev>` sender. Use after verifying a custom domain on Resend. |
| `VITE_API_BASE_URL` | Vercel | ✅ | Backend canonical URL. Already set in `frontend/.env.example`. |

---

## Health-check one-liners

```sh
# Backend liveness
curl -s https://baeu-backend-production.up.railway.app/api/v1/health

# Better Auth handler mounted
curl -s -o /dev/null -w "%{http_code}\n" https://baeu-backend-production.up.railway.app/api/auth/ok

# Sign-up smoke (creates a synthetic learner; cleanup below)
EMAIL="audit-$(date +%s)@test.local"
curl -s -X POST -H "Origin: https://baeu-learning.vercel.app" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"audit1234\",\"name\":\"Smoke\"}" \
  -c /tmp/c.txt -o /dev/null \
  https://baeu-backend-production.up.railway.app/api/auth/sign-up/email
curl -s -b /tmp/c.txt -X POST -H "Origin: https://baeu-learning.vercel.app" \
  -H "Content-Type: application/json" -d '{}' \
  https://baeu-backend-production.up.railway.app/api/auth/delete-user
rm -f /tmp/c.txt

# Synthetic-account cleanup (deletes audit-%@test.local with cascade)
cd backend && DATABASE_URL=$(railway variables --json | python3 -c \
  "import sys,json; print(json.load(sys.stdin)['DATABASE_URL'])") \
  npm run cleanup:test-users -- --apply
```
