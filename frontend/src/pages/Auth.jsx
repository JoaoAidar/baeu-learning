import React, { useState } from 'react';
import { api, auth } from '../api.js';

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn = mode === 'login' ? api.login : api.signup;
      const res = await fn({ email, password, displayName });
      auth.set(res);
      onAuthed?.(res.user);
    } catch (e) {
      setError(humanize(e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>
        {mode === 'login' ? 'Log in' : 'Create account'}
      </h2>
      <form onSubmit={submit}>
        {mode === 'signup' && (
          <input
            className="input"
            style={{ marginBottom: 12 }}
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}
        <input
          className="input"
          style={{ marginBottom: 12 }}
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          style={{ marginBottom: 12 }}
          type="password"
          placeholder="Password (min 8 chars)"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
        <div className="row">
          <button className="btn" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Need an account?' : 'Have an account?'}
          </button>
        </div>
      </form>
    </div>
  );
}

const HUMAN = {
  invalid_email: 'Email looks invalid.',
  weak_password: 'Password must be at least 8 characters.',
  email_taken: 'Email already registered.',
  invalid_credentials: 'Wrong email or password.',
  unauthorized: 'Session expired. Log in again.',
};

function humanize(code) {
  return HUMAN[code] || code || 'Something went wrong.';
}
