import React, { useEffect, useState } from 'react';
import EndlessPractice from './pages/EndlessPractice.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import Progress from './pages/Progress.jsx';
import Home from './pages/Home.jsx';
import Module from './pages/Module.jsx';
import Lesson from './pages/Lesson.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { api, auth } from './api.js';

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
  const [user, setUser] = useState(auth.getUser());
  const [bootChecked, setBootChecked] = useState(false);
  const route = useRoute();

  useEffect(() => {
    if (!auth.getToken()) { setBootChecked(true); return; }
    api.me()
      .then((u) => setUser(u))
      .catch(() => { auth.clear(); setUser(null); })
      .finally(() => setBootChecked(true));
  }, []);

  function logout() {
    auth.clear();
    setUser(null);
    window.location.hash = '#/';
  }

  if (!bootChecked) {
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
  const moduleSlug = isModule ? path.slice('/module/'.length) : null;
  const lessonSlug = isLesson ? path.slice('/lesson/'.length) : null;

  return (
    <div className="min-h-screen bg-background-default">
      <Header
        user={user}
        active={isAdmin ? 'admin' : isProgress ? 'progress' : 'practice'}
        onLogout={logout}
      />
      <main className="container py-8">
        {renderPage({
          path,
          query,
          user,
          setUser,
          moduleSlug,
          lessonSlug,
          isAdmin,
          isProgress,
          isPractice,
          isModule,
          isLesson,
        })}
      </main>
    </div>
  );
}

function renderPage({ query, user, setUser, moduleSlug, lessonSlug, isAdmin, isProgress, isPractice, isModule, isLesson }) {
  if (isAdmin) return <Admin />;
  if (!user) return <Auth onAuthed={setUser} />;
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

function Header({ user, active, onLogout }) {
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
          <NavLink href="#/admin" active={active === 'admin'}>Admin</NavLink>
          {user && (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
              <span className="text-gray-600 hidden sm:inline">
                {user.displayName || user.email}
              </span>
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
