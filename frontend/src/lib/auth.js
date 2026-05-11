import { createAuthClient } from 'better-auth/react';

// The auth client must point at the BACKEND base URL, not the frontend origin.
// In dev, when VITE_API_BASE_URL is empty, Vite proxies /api to the local
// backend, so falling back to window.location.origin works there too.
const backendBase =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export const authClient = createAuthClient({
  baseURL: backendBase, // Better Auth client will call ${backendBase}/api/auth/...
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
} = authClient;
