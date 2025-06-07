import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// --- Configuration & Constants ---
// Centralize navigation and potentially other global configs
const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Lessons', href: '/lessons' },
  { name: 'Profile', href: '/profile' },
  { name: 'Leagues', href: '/leagues' },
  { name: 'Shop', href: '/shop' },
];

// Tailwind-like color classes (for demonstration, assume these are in tailwind.config.js)
const colors = {
  duoGreenMain: 'bg-[#58CC02]',
  duoGreenDark: 'bg-[#4CAF00]',
  duoGreenLight: 'bg-[#8AF148]',
  duoYellow: 'bg-[#FFC800]',
  duoBlue: 'bg-[#1CB0F6]',
  duoRed: 'bg-[#FF4B4B]',
  duoPurple: 'bg-[#CE82FF]',
  duoTextDark: 'text-[#3C3C3C]',
  duoTextLight: 'text-[#FFFFFF]',
  duoBgLight: 'bg-[#F7F7F7]',
  duoBgDark: 'bg-[#1F2437]',
  duoBgDarker: 'bg-[#121626]', // For the main layout background
};

// --- Utility Components (more generic and reusable) ---

const IconButton = ({ children, onClick, label, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-full text-gray-500 dark:text-gray-300 hover:${colors.duoBgLight} dark:hover:bg-gray-700 hover:text-[#58CC02] dark:hover:text-[#8AF148] transition-all duration-200 transform hover:scale-110 ${className}`}
    aria-label={label}
  >
    {children}
  </button>
);

const NavLink = ({ item, location, onClick }) => (
  <Link
    key={item.name}
    to={item.href}
    className={`
      ${location.pathname === item.href
        ? `${colors.duoGreenMain} text-white shadow-md`
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }
      inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105
    `}
    onClick={onClick}
  >
    {item.name}
  </Link>
);

// --- Duolingo-inspired Display Components ---

const StreakDisplay = ({ streak }) => (
  <div className={`flex items-center space-x-1 p-2 ${colors.duoYellow} rounded-full text-white font-bold text-sm shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer`}>
    <span className="text-xl">🔥</span>
    <span>{streak}</span>
  </div>
);

const XPDisplay = ({ xp }) => (
  <div className={`flex items-center space-x-1 p-2 ${colors.duoBlue} rounded-full text-white font-bold text-sm shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer`}>
    <span className="text-xl">✨</span>
    <span>{xp} XP</span>
  </div>
);

// --- Main Layout Components ---

const Navbar = ({
  isDarkMode,
  toggleDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  location,
}) => (
  <nav className="bg-white dark:bg-[#1F2437] shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-3xl font-bold text-[#58CC02] dark:text-[#8AF148] tracking-tight transform hover:rotate-3 transition-transform duration-200 ease-in-out"
            >
              KoreanLearning
            </Link>
          </div>

          <div className="hidden md:ml-8 md:flex md:space-x-4 lg:space-x-6">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} location={location} />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <StreakDisplay streak={125} />
          <XPDisplay xp={1500} />

          <IconButton
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            className="md:hidden"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </IconButton>

          <IconButton onClick={toggleDarkMode} label="Toggle dark mode">
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </IconButton>

          <IconButton label="View notifications">
            <BellIcon className="h-5 w-5" />
          </IconButton>

          <select
            className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 border-0 focus:ring-0 rounded-lg py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>

          <div className="ml-3 relative">
            <Link to="/profile">
              <div className={`h-10 w-10 rounded-full ${colors.duoBlue} flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white dark:ring-gray-800 hover:scale-105 transition-transform duration-200`}>
                U
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const MobileMenu = ({ isMobileMenuOpen, location, setIsMobileMenuOpen }) => (
  <div
    className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-800 shadow-md`}
    id="mobile-menu"
  >
    <div className="pt-2 pb-3 space-y-1 px-2">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          item={item}
          location={location}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ))}
    </div>
  </div>
);

const Layout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Use useEffect for side effects, like DOM manipulation and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  return (
    <div className={`min-h-screen ${colors.duoBgLight} dark:${colors.duoBgDarker} font-sans`}>
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        location={location}
      />
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        location={location}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;