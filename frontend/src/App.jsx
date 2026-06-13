import React, { useEffect, useState } from 'react';
import EndlessPractice from './pages/EndlessPractice.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import Progress from './pages/Progress.jsx';
import Results from './pages/Results.jsx';
import Home from './pages/Home.jsx';
import Module from './pages/Module.jsx';
import Lesson from './pages/Lesson.jsx';
import About from './pages/About.jsx';
import AccountSettings from './components/AccountSettings.jsx';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { api } from './api.js';
import { authClient } from './lib/auth.js';

const BASE_TITLE = 'Baeu — Korean Practice';
function titleForPath(path) {
  const p = path || '/';
  if (p.startsWith('/progress')) return `Progress · ${BASE_TITLE}`;
  if (p.startsWith('/results')) return `Results · ${BASE_TITLE}`;
  if (p.startsWith('/practice')) return `Practice · ${BASE_TITLE}`;
  if (p.startsWith('/module/')) return `Module · ${BASE_TITLE}`;
  if (p.startsWith('/lesson/')) return `Lesson · ${BASE_TITLE}`;
  if (p.startsWith('/about')) return `About · ${BASE_TITLE}`;
  if (p.startsWith('/account')) return `Account · ${BASE_TITLE}`;
  if (p.startsWith('/admin')) return `Admin · ${BASE_TITLE}`;
  if (p.startsWith('/reset-password')) return `Reset password · ${BASE_TITLE}`;
  return BASE_TITLE;
}

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

  // A protected api.* call 401'd → the session expired mid-use. Clear it and
  // route to login once, rather than letting the page reissue calls that keep
  // 401'ing (toast loop). Guarded by `user` so a logged-out 401 is a no-op.
  useEffect(() => {
    const onUnauthorized = () => {
      if (!user) return;
      authClient.signOut().catch(() => {});
      window.location.hash = '#/';
    };
    window.addEventListener('baeu:unauthorized', onUnauthorized);
    return () => window.removeEventListener('baeu:unauthorized', onUnauthorized);
  }, [user?.id]);

  // Hash-router doesn't change document.title on its own, so every route shared
  // the static title. Keep the tab label in sync with the current page.
  useEffect(() => {
    document.title = titleForPath(route.path);
  }, [route.path]);

  if (isPending) {
    return <BootSplash />;
  }

  const { path, query } = route;
  const isAdmin = path.startsWith('/admin');
  const isProgress = path.startsWith('/progress');
  const isResults = path.startsWith('/results');
  const isPractice = path.startsWith('/practice');
  const isModule = path.startsWith('/module/');
  const isLesson = path.startsWith('/lesson/');
  const isAbout = path.startsWith('/about');
  const isAccount = path.startsWith('/account');
  const isResetPassword = path.startsWith('/reset-password');
  const moduleSlug = isModule ? path.slice('/module/'.length) : null;
  const lessonSlug = isLesson ? path.slice('/lesson/'.length) : null;
  const isKnownRoute =
    path === '/' ||
    isAdmin ||
    isProgress ||
    isResults ||
    isPractice ||
    isModule ||
    isLesson ||
    isAbout ||
    isAccount ||
    isResetPassword;

  const active = isAdmin
    ? 'admin'
    : isResults
      ? 'results'
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
          isResults,
          isPractice,
          isModule,
          isLesson,
          isAbout,
          isAccount,
          isKnownRoute,
        })}
      </main>
    </div>
  );
}

function renderPage({ query, user, moduleSlug, lessonSlug, isAdmin, isProgress, isResults, isPractice, isModule, isLesson, isAbout, isAccount, isKnownRoute }) {
  if (isAbout) return <About />;
  if (isAdmin) return <Admin />;
  if (!isKnownRoute) return <NotFound />;
  if (!user) {
    // Deep-linking into a protected route while logged out dropped you on the
    // bare landing with no explanation. Tell you why you're seeing the login.
    const dest = isProgress
      ? 'your progress'
      : isResults
        ? 'your results'
        : isAccount
          ? 'your account'
          : isLesson || isModule || isPractice
            ? 'that practice'
            : null;
    return <Auth notice={dest ? `Log in to continue to ${dest}.` : null} />;
  }
  if (isAccount) return <AccountSettings user={user} />;
  if (isResults) return <Results />;
  if (isProgress) return <Progress />;
  if (isLesson && lessonSlug) {
    return <Lesson slug={lessonSlug} returnTo={query.from || '#/'} />;
  }
  if (isPractice) {
    return (
      <EndlessPractice
        key={`${query.module || 'global'}:${query.focus || 'all'}`}
        moduleSlug={query.module || null}
        initialFocus={query.focus === 'weak' ? 'weak' : null}
      />
    );
  }
  if (isModule && moduleSlug) return <Module slug={moduleSlug} />;
  return <Home />;
}

function BootSplash() {
  // The backend (Railway) sleeps and cold-starts in a few seconds. A bare
  // "Loading…" on a gray page reads as "broken site" in the first second, so
  // we show the Baeu brand mark + a spinner immediately (intentional, on-brand
  // wait) and surface the "server waking up" hint quickly (~1.2s) since the
  // cold start is the expected cause of any wait past the first moment.
  const [waking, setWaking] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaking(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-default px-4">
      <div className="text-center" role="status" aria-live="polite">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white font-heading font-bold text-2xl mb-4 animate-pulse">
          <span lang="ko">배</span>
        </div>
        <div className="font-heading text-lg font-bold text-gray-900">Baeu</div>
        <div className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <span
            className="inline-block w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"
            aria-hidden
          />
          <span>{waking ? 'Waking up the practice server…' : 'Loading…'}</span>
        </div>
        {waking && (
          <p className="mt-2 text-xs text-gray-400 max-w-xs mx-auto">
            First load after a while can take a few seconds. Hang tight.
          </p>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div data-testid="not-found-page" className="max-w-xl mx-auto bg-white rounded-xl shadow-card border border-gray-100 p-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-2">
        Page not found
      </p>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-3">
        This route does not exist.
      </h1>
      <p className="text-gray-600 mb-6">
        Head back to practice or use the navigation above.
      </p>
      <a
        href="#/"
        className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all no-underline"
      >
        Back to practice
      </a>
    </div>
  );
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
      <div className="container py-3 sm:py-4 flex flex-wrap items-center gap-2 sm:gap-4">
        <a href="#/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <span lang="ko" className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">배</span>
          <span className="font-heading font-bold text-xl text-gray-900 leading-none">Baeu</span>
          <span className="text-gray-400 text-sm hidden sm:inline">· Korean practice</span>
        </a>
        <nav className="w-full sm:w-auto sm:ml-auto flex flex-wrap items-center gap-1 sm:gap-3 text-sm">
          {user && (
            <>
              <NavLink href="#/" active={active === 'practice'}>Practice</NavLink>
              <NavLink href="#/progress" active={active === 'progress'}>Progress</NavLink>
              <NavLink href="#/results" active={active === 'results'}>Results</NavLink>
            </>
          )}
          <NavLink href="#/about" active={active === 'about'}>About</NavLink>
          {role === 'admin' && (
            <NavLink href="#/admin" active={active === 'admin'}>Admin</NavLink>
          )}
          {user && (
            <div className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-2 pl-2 sm:pl-3 border-l border-gray-200">
              <a
                href="#/account"
                data-testid="account-link"
                className={`px-2 py-1.5 rounded-md no-underline transition-colors whitespace-nowrap ${
                  active === 'account' ? 'text-primary-700 font-semibold' : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                Account
              </a>
              <span className="text-gray-300 hidden sm:inline">·</span>
              <button
                type="button"
                data-testid="logout-btn"
                onClick={onLogout}
                className="px-2 py-1.5 rounded-md text-gray-500 hover:text-primary-500 hover:bg-primary-50 transition-colors bg-transparent whitespace-nowrap"
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
      className={`px-2 sm:px-3 py-1.5 rounded-md no-underline transition-colors whitespace-nowrap ${
        active
          ? 'bg-primary-50 text-primary-700 font-semibold'
          : 'text-gray-600 hover:text-primary-500'
      }`}
    >
      {children}
    </a>
  );
}
