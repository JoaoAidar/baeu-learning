const BASE = import.meta.env.VITE_API_BASE_URL || '';
const ADMIN_TOKEN_KEY = 'baeu_admin_token';
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_GET_RETRIES = 2;

export class ApiError extends Error {
  constructor(message, { kind = 'unknown', status = null, code = null, retried = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.code = code || message;
    this.retried = retried;
  }
}

export const adminAuth = {
  getToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  set: (t) => localStorage.setItem(ADMIN_TOKEN_KEY, t),
  clear: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

async function call(path, opts = {}) {
  const method = (opts.method || 'GET').toUpperCase();
  const retries = opts.retries ?? (method === 'GET' ? DEFAULT_GET_RETRIES : 0);
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetchWithTimeout(`${BASE}${path}`, {
        ...opts,
        method,
        headers,
        credentials: 'include',
        timeoutMs,
      });
      const text = await res.text();
      const body = text ? safeJson(text) : {};
      if (!res.ok) {
        const code = body.error || `HTTP ${res.status}`;
        const err = new ApiError(humanizeApiError(code, res.status), {
          kind: 'http',
          status: res.status,
          code,
          retried: attempt > 0,
        });
        if (shouldRetryHttp(res.status, method) && attempt < retries) {
          lastError = err;
          await wait(backoffMs(attempt));
          continue;
        }
        throw err;
      }
      return body;
    } catch (err) {
      const apiErr = normalizeFetchError(err, attempt > 0);
      if (apiErr.kind === 'network' && attempt < retries) {
        lastError = apiErr;
        await wait(backoffMs(attempt));
        continue;
      }
      throw apiErr;
    }
  }

  throw lastError || new ApiError('The server is temporarily unavailable.', { kind: 'network' });
}

async function adminCall(path, opts = {}) {
  const tok = adminAuth.getToken();
  if (!tok) throw new Error('admin_token_required');
  return call(path, {
    ...opts,
    headers: { ...(opts.headers || {}), 'x-admin-token': tok },
  });
}

async function fetchWithTimeout(url, opts) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function shouldRetryHttp(status, method) {
  if (method !== 'GET') return false;
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function normalizeFetchError(err, retried) {
  if (err instanceof ApiError) return err;
  if (err?.name === 'AbortError') {
    return new ApiError('The server took too long to respond. Please try again.', {
      kind: 'network',
      code: 'timeout',
      retried,
    });
  }
  return new ApiError('The server is temporarily unavailable. Please try again.', {
    kind: 'network',
    code: 'network_unavailable',
    retried,
  });
}

function humanizeApiError(code, status) {
  if (code === 'unauthorized') return 'Please log in again.';
  if (code === 'forbidden') return 'You do not have access to this action.';
  if (code === 'cors_not_allowed') return 'This app origin is not allowed by the API.';
  if (code === 'no_exercises_in_module') return 'This module has no published exercises yet.';
  if (code === 'no_published_exercises') return 'No published exercises are available yet.';
  if (status >= 500) return 'The server had a problem. Please try again.';
  return code || `HTTP ${status}`;
}

function backoffMs(attempt) {
  return 350 * (attempt + 1);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  // Deep learner results (per-exercise difficulty, response-time trend, error
  // breakdown). Auth via session cookie.
  results: (days = 30) => call(`/api/v1/analytics/results?days=${days}`),
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
  metrics: (sinceMin = null) =>
    adminCall(`/api/v1/admin/metrics${sinceMin ? `?sinceMin=${sinceMin}` : ''}`),
  analytics: (days = 30) =>
    adminCall(`/api/v1/admin/analytics?days=${days}`),
};
