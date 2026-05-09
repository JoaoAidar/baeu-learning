import React, { useState } from 'react';
import { api, auth } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-3">
            <span className="font-heading font-bold text-xl">배</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back' : 'Start learning Korean'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Log in to continue practicing.' : 'Create an account to track your mastery.'}
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

        <div className="mt-5 text-center text-sm text-gray-500">
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
