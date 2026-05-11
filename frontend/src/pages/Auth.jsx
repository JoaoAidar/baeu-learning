import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { authClient } from '../lib/auth.js';
import { useToast } from '../components/Toast.jsx';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [totalPublished, setTotalPublished] = useState(0);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    api.modulesList()
      .then((r) => {
        if (cancelled) return;
        setModules(r.modules || []);
        setTotalPublished(r.total_published || 0);
      })
      .catch(() => { /* preview is best-effort; auth still works without it */ });
    return () => { cancelled = true; };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(humanize(error.code || error.message));
        toast.push('Welcome back!', 'success');
      } else if (mode === 'signup') {
        const name = displayName || email.split('@')[0];
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) throw new Error(humanize(error.code || error.message));
        toast.push('Account created. 환영합니다!', 'success');
      }
      // useSession in App.jsx re-renders automatically.
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/',
      });
    } catch (err) {
      toast.push(err?.message || 'Google sign-in failed.', 'error');
    }
  }

  async function submitForgot(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: window.location.origin + '/#/reset-password',
      });
      if (error) throw new Error(humanize(error.code || error.message));
      toast.push('If that email exists, a reset link is on its way.', 'success');
      setMode('login');
    } catch (err) {
      // Avoid leaking enumeration — message stays generic on failure too.
      toast.push('If that email exists, a reset link is on its way.', 'success');
      setMode('login');
      // (We still log to console for debugging.)
      // eslint-disable-next-line no-console
      console.warn('forgetPassword error', err);
    } finally {
      setLoading(false);
    }
  }

  const isForgot = mode === 'forgot';

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <section className="lg:col-span-3 space-y-6 animate-fade-in" data-testid="landing-hero">
        <div>
          <p className="text-primary-600 font-semibold text-sm tracking-wide uppercase mb-2">
            Korean practice, daily
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Build real Korean fluency one question at a time.
          </h1>
          <p className="text-gray-600 mt-3 text-base sm:text-lg max-w-xl">
            Mixed questions across Hangul, grammar, and vocabulary. The selector
            prioritizes your weak skills and items due for review — so every
            session targets what you actually need.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 gap-3 text-sm">
          <Bullet>Hangul, grammar, and vocabulary in one queue.</Bullet>
          <Bullet>Adaptive review based on your mastery.</Bullet>
          <Bullet>Per-module practice when you want to drill.</Bullet>
          <Bullet>Progress tracking with skill-tag breakdowns.</Bullet>
        </ul>

        {modules.length > 0 && (
          <div>
            <h3 className="font-heading text-base font-bold text-gray-900 mb-2">
              What's inside
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modules.slice(0, 4).map((m) => (
                <div
                  key={m.slug}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary-50 text-secondary-700 font-heading font-bold flex items-center justify-center flex-shrink-0">
                    {m.icon || '·'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{m.title}</div>
                    <div className="text-xs text-gray-500">{m.exercise_count} questions</div>
                  </div>
                </div>
              ))}
            </div>
            {totalPublished > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {totalPublished} questions published across {modules.length} module{modules.length === 1 ? '' : 's'}.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-7 animate-fade-in">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 text-primary-600 mb-2">
              <span className="font-heading font-bold text-lg">배</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900">
              {isForgot
                ? 'Reset your password'
                : mode === 'login'
                  ? 'Welcome back'
                  : 'Create your account'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isForgot
                ? "Enter your email and we'll send a reset link."
                : mode === 'login'
                  ? 'Log in to continue practicing.'
                  : 'Free. Takes about 30 seconds.'}
            </p>
          </div>

          {isForgot ? (
            <form onSubmit={submitForgot} className="space-y-3">
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
              />
              <button
                disabled={loading}
                className="w-full mt-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
              >
                {loading ? 'Please wait…' : 'Send reset link'}
              </button>
              <div className="text-center text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary-600 hover:text-primary-700 font-medium bg-transparent p-0"
                >
                  Back to log in
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={submit} className="space-y-3">
                {mode === 'signup' && (
                  <Field
                    label="Display name (optional)"
                    value={displayName}
                    onChange={setDisplayName}
                    autoComplete="name"
                  />
                )}
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
                />

                {mode === 'login' && (
                  <div className="text-right -mt-1">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium bg-transparent p-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full mt-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
                </button>
              </form>

              <div className="my-4 flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-200" />
                <span>or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={googleSignIn}
                disabled={loading}
                data-testid="google-signin-btn"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-semibold py-2.5 rounded-lg transition-all bg-white"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-primary-600 hover:text-primary-700 font-medium bg-transparent p-0"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2 text-gray-700">
      <span className="text-primary-500 mt-0.5" aria-hidden>✓</span>
      <span>{children}</span>
    </li>
  );
}

function Field({ label, type = 'text', value, onChange, hint, ...rest }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        {...rest}
      />
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
    </svg>
  );
}

const HUMAN = {
  invalid_email: 'Email looks invalid.',
  weak_password: 'Password must be at least 8 characters.',
  email_taken: 'Email already registered.',
  USER_ALREADY_EXISTS: 'Email already registered.',
  invalid_credentials: 'Wrong email or password.',
  INVALID_EMAIL_OR_PASSWORD: 'Wrong email or password.',
  rate_limited: 'Too many attempts. Try again in a few minutes.',
  unauthorized: 'Session expired. Log in again.',
};

function humanize(code) {
  if (!code) return 'Something went wrong.';
  return HUMAN[code] || code;
}
