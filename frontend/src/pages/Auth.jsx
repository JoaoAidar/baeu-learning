import React, { useEffect, useState } from 'react';
import { api, auth } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login');
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
      const fn = mode === 'login' ? api.login : api.signup;
      const res = await fn({ email, password, displayName });
      auth.set(res);
      onAuthed?.(res.user);
      toast.push(mode === 'login' ? 'Welcome back!' : 'Account created. 환영합니다!', 'success');
    } catch (e) {
      toast.push(humanize(e.message), 'error');
    } finally {
      setLoading(false);
    }
  }

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
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'login' ? 'Log in to continue practicing.' : 'Free. Takes about 30 seconds.'}
            </p>
          </div>

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

            <button
              disabled={loading}
              className="w-full mt-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary-600 hover:text-primary-700 font-medium bg-transparent p-0"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
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

const HUMAN = {
  invalid_email: 'Email looks invalid.',
  weak_password: 'Password must be at least 8 characters.',
  email_taken: 'Email already registered.',
  invalid_credentials: 'Wrong email or password.',
  rate_limited: 'Too many attempts. Try again in a few minutes.',
  unauthorized: 'Session expired. Log in again.',
};

function humanize(code) {
  return HUMAN[code] || code || 'Something went wrong.';
}
