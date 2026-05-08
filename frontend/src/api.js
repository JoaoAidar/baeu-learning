const BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'baeu_token';
const USER_KEY = 'baeu_user';
const ADMIN_TOKEN_KEY = 'baeu_admin_token';

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

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
  const token = auth.getToken();
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  const body = text ? safeJson(text) : {};
  if (!res.ok) {
    if (res.status === 401) auth.clear();
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
  signup: (payload) => call('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login:  (payload) => call('/api/v1/auth/login',  { method: 'POST', body: JSON.stringify(payload) }),
  me:     () => call('/api/v1/auth/me'),
  startSession: () => call('/api/v1/practice/sessions', { method: 'POST' }),
  next: (sessionId, focus = null) => {
    const qs = new URLSearchParams({ sessionId });
    if (focus) qs.set('focus', focus);
    return call(`/api/v1/practice/next?${qs.toString()}`);
  },
  answer: (payload) => call('/api/v1/practice/answer', { method: 'POST', body: JSON.stringify(payload) }),
  summary: (sessionId) => call(`/api/v1/practice/sessions/${sessionId}/summary`),
  progressOverview: () => call('/api/v1/progress/overview'),
  progressSkills: () => call('/api/v1/progress/skills'),
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
