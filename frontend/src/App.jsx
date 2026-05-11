import React, { useEffect, useState } from 'react';
import EndlessPractice from './pages/EndlessPractice.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import Progress from './pages/Progress.jsx';
import Home from './pages/Home.jsx';
import Module from './pages/Module.jsx';
import Lesson from './pages/Lesson.jsx';
import About from './pages/About.jsx';
import AccountSettings from './components/AccountSettings.jsx';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { api } from './api.js';
import { authClient } from './lib/auth.js';

function parseHash(hash) {
  // e.g. "#/practice?module=greetings" → { path: '/practice', query: { module: 'greetings' } }
  const raw = (hash || '#/').replace(/^#/, '');
  const [path, qs] = raw.split('?');
  const query = {};
  if (qs) {
    for (const part of qs.split('&')) {
      const [k, v] = part.split('=');
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
  }
  return { path: path || '/', query };
}

function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}

function Shell() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user || null;
  const route = useRoute();
  const [role, setRole] = useState(null);

  // Best-effort role fetch. If the backend hasn't exposed /me/role yet, this
  // fails silently and the Admin link stays hidden.
  // TODO(admin-gating): confirm exact endpoint with backend agent. Until then,
  // any failure keeps the user as non-admin.
  useEffect(() => {
    let cancelled = false;
    if (!user) { setRole(null); return; }
    api.meRole()
      .then((r) => { if (!cancelled) setRole(r?.role || null); })
      .catch(() => { if (!cancelled) setRole(null); });
    return () => { cancelled = true; };
  }, [user?.id]);

  async function logout() {
    try { await authClient.signOut(); } catch { /* ignore */ }
    window.location.hash = '#/';
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-default">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  const { path, query } = route;
  const isAdmin = path.startsWith('/admin');
  const isProgress = path.startsWith('/progress');
  const isPractice = path.startsWith('/practice');
  const isModule = path.startsWith('/module/');
  const isLesson = path.startsWith('/lesson/');
  const isAbout = path.startsWith('/about');
  const isAccount = path.startsWith('/account');
  const isResetPassword = path.startsWith('/reset-password');
  const moduleSlug = isModule ? path.slice('/module/'.length) : null;
  const lessonSlug = isLesson ? path.slice('/lesson/'.length) : null;

  const active = isAdmin
    ? 'admin'
    : isProgress
      ? 'progress'
      : isAbout
        ? 'about'
        : isAccount
          ? 'account'
          : 'practice';

  // Reset-password is reachable WITHOUT a session (you hit it from the email link).
  if (isResetPassword) {
    return (
      <div className="min-h-screen bg-background-default">
        <Header user={user} role={role} active={active} onLogout={logout} />
        <main className="container py-8">
          <ResetPassword query={query} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-default">
      <Header user={user} role={role} active={active} onLogout={logout} />
      <main className="container py-8">
        {renderPage({
          path,
          query,
          user,
          moduleSlug,
          lessonSlug,
          isAdmin,
          isProgress,
          isPractice,
          isModule,
          isLesson,
          isAbout,
          isAccount,
        })}
      </main>
    </div>
  );
}

function renderPage({ query, user, moduleSlug, lessonSlug, isAdmin, isProgress, isPractice, isModule, isLesson, isAbout, isAccount }) {
  if (isAbout) return <About />;
  if (isAdmin) return <Admin />;
  if (!user) return <Auth />;
  if (isAccount) return <AccountSettings user={user} />;
  if (isProgress) return <Progress />;
  if (isLesson && lessonSlug) {
    return <Lesson slug={lessonSlug} returnTo={query.from || '#/'} />;
  }
  if (isPractice) {
    return (
      <EndlessPractice
        key={query.module || 'global'}
        moduleSlug={query.module || null}
      />
    );
  }
  if (isModule && moduleSlug) return <Module slug={moduleSlug} />;
  return <Home />;
}

function ResetPassword({ query }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Better Auth puts the reset token in ?token=...; the email link redirects
  // here via callbackURL configured in forgetPassword.
  const token =
    query.token ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('token')
      : null);

  async function submit(e) {
    e.preventDefault();
    if (!token) {
      toast.push('Missing reset token. Open the link from your email again.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) throw new Error(error.message || error.code || 'reset_failed');
      toast.push('Password updated. You can log in now.', 'success');
      window.location.hash = '#/';
    } catch (err) {
      toast.push(err.message || 'Could not reset password.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-7">
      <h1 className="font-heading text-xl font-bold text-gray-900 mb-2">Choose a new password</h1>
      <p className="text-gray-500 text-sm mb-4">At least 8 characters.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="New password"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        />
        <button
          disabled={submitting}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

function Header({ user, role, active, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container py-4 flex items-center justify-between">
        <a href="#/" className="flex items-center gap-2 no-underline">
          <span className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm">배</span>
          <span className="font-heading font-bold text-xl text-gray-900">Baeu</span>
          <span className="text-gray-400 text-sm hidden sm:inline">· Korean practice</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          {user && (
            <>
              <NavLink href="#/" active={active === 'practice'}>Practice</NavLink>
              <NavLink href="#/progress" active={active === 'progress'}>Progress</NavLink>
            </>
          )}
          <NavLink href="#/about" active={active === 'about'}>About</NavLink>
          {role === 'admin' && (
            <NavLink href="#/admin" active={active === 'admin'}>Admin</NavLink>
          )}
          {user && (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
              <a
                href="#/account"
                data-testid="account-link"
                className={`no-underline transition-colors ${
                  active === 'account' ? 'text-primary-700 font-semibold' : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                Account
              </a>
              <span className="text-gray-300">·</span>
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-primary-500 transition-colors bg-transparent"
              >
                Log out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-md no-underline transition-colors ${
        active
          ? 'bg-primary-50 text-primary-700 font-semibold'
          : 'text-gray-600 hover:text-primary-500'
      }`}
    >
      {children}
    </a>
  );
}
