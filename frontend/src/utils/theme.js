// Theme manager — class-based dark mode on <html>.
//
// First-visit default follows the OS (prefers-color-scheme). Once the user
// picks a theme it's pinned in localStorage and the OS no longer overrides it.
// An inline script in index.html applies the resolved theme before first paint
// (no flash); this module keeps it in sync and powers the in-app toggle.

const STORAGE_KEY = 'baeu-theme';

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
}

export function systemPrefersDark() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function resolveTheme() {
  return getStoredTheme() || (systemPrefersDark() ? 'dark' : 'light');
}

export function applyTheme(theme) {
  const dark = theme === 'dark';
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#0f1115' : '#d62828');
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode / storage blocked — apply for the session anyway */
  }
  applyTheme(theme);
}

export function getActiveTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function toggleTheme() {
  const next = getActiveTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

// Idempotent init: re-asserts the resolved theme and enables CSS transitions
// after first paint so the load itself doesn't animate.
export function initTheme() {
  applyTheme(resolveTheme());
  requestAnimationFrame(() => {
    document.documentElement.classList.add('theme-ready');
  });

  // Track OS changes only while the user hasn't made an explicit choice.
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      if (!getStoredTheme()) applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
}
