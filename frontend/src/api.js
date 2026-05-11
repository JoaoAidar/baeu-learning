const BASE = import.meta.env.VITE_API_BASE_URL || '';
const ADMIN_TOKEN_KEY = 'baeu_admin_token';

export const adminAuth = {
  getToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  set: (t) => localStorage.setItem(ADMIN_TOKEN_KEY, t),
  clear: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

async function call(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  // Always send the Better Auth session cookie cross-origin.
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
  });
  const text = await res.text();
  const body = text ? safeJson(text) : {};
  if (!res.ok) {
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return body;
}

async function adminCall(path, opts = {}) {
  const tok = adminAuth.getToken();
  if (!tok) throw new Error('admin_token_required');
  return call(path, {
    ...opts,
    headers: { ...(opts.headers || {}), 'x-admin-token': tok },
  });
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }

export const api = {
  modulesList: () => call('/api/v1/modules'),
  module: (slug) => call(`/api/v1/modules/${encodeURIComponent(slug)}`),
  lessonsList: (moduleSlug = null) =>
    call(`/api/v1/lessons${moduleSlug ? `?module=${encodeURIComponent(moduleSlug)}` : ''}`),
  lesson: (slug) => call(`/api/v1/lessons/${encodeURIComponent(slug)}`),
  startSession: (moduleSlug = null) =>
    call('/api/v1/practice/sessions', {
      method: 'POST',
      body: JSON.stringify(moduleSlug ? { moduleSlug } : {}),
    }),
  next: (sessionId, focus = null) => {
    const qs = new URLSearchParams({ sessionId });
    if (focus) qs.set('focus', focus);
    return call(`/api/v1/practice/next?${qs.toString()}`);
  },
  answer: (payload) => call('/api/v1/practice/answer', { method: 'POST', body: JSON.stringify(payload) }),
  summary: (sessionId) => call(`/api/v1/practice/sessions/${sessionId}/summary`),
  progressOverview: () => call('/api/v1/progress/overview'),
  progressSkills: () => call('/api/v1/progress/skills'),
  // Optional role lookup. Backend exposes (or will expose) /api/v1/me/role.
  // Treated as best-effort by callers; failure means "not admin".
  meRole: () => call('/api/v1/me/role'),
};

export const adminApi = {
  list: (status) =>
    adminCall(`/api/v1/admin/exercises${status ? `?status=${status}` : ''}`),
  importJson: (items) =>
    adminCall('/api/v1/admin/exercises/import', { method: 'POST', body: JSON.stringify(items) }),
  generate: (payload) =>
    adminCall('/api/v1/admin/exercises/generate', { method: 'POST', body: JSON.stringify(payload) }),
  setStatus: (id, status) =>
    adminCall(`/api/v1/admin/exercises/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  recentAttempts: ({ wrongOnly = true, limit = 50 } = {}) =>
    adminCall(
      `/api/v1/admin/attempts/recent?wrongOnly=${wrongOnly}&limit=${limit}`
    ),
};
