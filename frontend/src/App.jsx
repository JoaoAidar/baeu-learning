import React, { useEffect, useState } from 'react';
import EndlessPractice from './pages/EndlessPractice.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import Progress from './pages/Progress.jsx';
import { api, auth } from './api.js';

function useRoute() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export default function App() {
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
  }

  if (!bootChecked) return null;

  const isAdmin = route.startsWith('#/admin');
  const isProgress = route.startsWith('#/progress');
  const headerLabel = isAdmin ? 'Admin' : isProgress ? 'Progress' : 'Endless Practice';

  return (
    <div className="app">
      <header className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>Baeu — {headerLabel}</h1>
        <div className="row">
          {user && !isAdmin && (
            <>
              <a className="muted" href={isProgress ? '#/' : '#/progress'} style={{ textDecoration: 'none' }}>
                {isProgress ? '← practice' : 'progress →'}
              </a>
              <span className="muted">{user.displayName || user.email}</span>
              <button className="btn secondary" onClick={logout}>Log out</button>
            </>
          )}
          <a className="muted" href={isAdmin ? '#/' : '#/admin'} style={{ textDecoration: 'none' }}>
            {isAdmin ? '← practice' : 'admin →'}
          </a>
        </div>
      </header>

      {isAdmin
        ? <Admin />
        : isProgress
          ? (user ? <Progress /> : <Auth onAuthed={setUser} />)
          : (user ? <EndlessPractice /> : <Auth onAuthed={setUser} />)}
    </div>
  );
}
