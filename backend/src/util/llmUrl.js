// Resolve the chat-completions endpoint from LLM_BASE_URL. The env var is
// commonly set to the provider BASE (e.g. https://openrouter.ai/api/v1) — the
// form most SDKs expect — but our raw fetch needs the full /chat/completions
// path. Accept either: append the path when it's missing so a base-URL env
// value doesn't POST to a non-JSON endpoint (which returns an HTML error page).
const DEFAULT = 'https://openrouter.ai/api/v1/chat/completions';

export function chatCompletionsUrl() {
  const base = (process.env.LLM_BASE_URL || '').trim();
  if (!base) return DEFAULT;
  if (/\/chat\/completions\/?$/.test(base)) return base;
  return `${base.replace(/\/+$/, '')}/chat/completions`;
}
