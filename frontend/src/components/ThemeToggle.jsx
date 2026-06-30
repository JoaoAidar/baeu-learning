import React, { useEffect, useState } from 'react';
import { getActiveTheme, toggleTheme } from '../utils/theme.js';

// Sun/moon toggle. Stays in sync with the active theme (including OS-driven
// changes while no explicit choice is stored) by polling the <html> class on
// the lightweight `theme` matchMedia event the manager already wires up.
export default function ThemeToggle({ className = '', testId = 'theme-toggle' }) {
  const [theme, setTheme] = useState(() => getActiveTheme());

  useEffect(() => {
    const sync = () => setTheme(getActiveTheme());
    // Catch OS-driven changes applied by initTheme's matchMedia listener.
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mq?.addEventListener) mq.addEventListener('change', sync);
    return () => {
      if (mq?.removeEventListener) mq.removeEventListener('change', sync);
    };
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme())}
      data-testid={testId}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative w-11 h-11 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-primary-500 hover:bg-primary-50 transition-colors bg-transparent ${className}`}
    >
      {isDark ? (
        // Sun
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
