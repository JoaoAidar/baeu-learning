import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { colors } from '../../styles/designSystem';
import '../../styles/responsive.css';
import './Layout.css';

// --- Configuration & Constants ---
const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Lessons', href: '/lessons' },
  { name: 'Profile', href: '/profile' },
  { name: 'Leagues', href: '/leagues' },
  { name: 'Shop', href: '/shop' },
];

// --- Utility Components (responsive and accessible) ---

const IconButton = ({ children, onClick, label, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      p-3 rounded-xl 
      text-gray-600 dark:text-gray-300 
      hover:bg-red-50 dark:hover:bg-red-900/20
      hover:text-red-600 dark:hover:text-red-400 
      transition-all duration-200 ease-in-out
      transform hover:scale-105 active:scale-95
      focus:outline-none focus:ring-2 focus:ring-red-500/20
      ${className}
    `}
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
        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
      }
      inline-flex items-center px-4 py-2.5 rounded-xl 
      text-sm font-semibold transition-all duration-200 ease-in-out 
      transform hover:scale-105 active:scale-95
      focus:outline-none focus:ring-2 focus:ring-blue-500/20
      no-underline
    `}
    onClick={onClick}
  >
    {item.name}
  </Link>
);

// --- Enhanced Display Components with new color scheme ---

const StreakDisplay = ({ streak }) => (
  <div className="
    flex items-center space-x-2 px-3 py-2 
    bg-gradient-to-r from-orange-400 to-yellow-400 
    rounded-full text-white font-bold text-sm 
    shadow-lg hover:shadow-xl
    transform hover:scale-105 active:scale-95
    transition-all duration-200 ease-in-out
    cursor-pointer
  ">
    <span className="text-lg">🔥</span>
    <span>{streak}</span>
  </div>
);

const XPDisplay = ({ xp }) => (
  <div className="
    flex items-center space-x-2 px-3 py-2 
    bg-gradient-to-r from-secondary-500 to-secondary-600 
    rounded-full text-white font-bold text-sm 
    shadow-lg hover:shadow-xl
    transform hover:scale-105 active:scale-95
    transition-all duration-200 ease-in-out
    cursor-pointer
  ">
    <span className="text-lg">✨</span>
    <span>{xp} XP</span>
  </div>
);

// --- Main Layout Components with responsive design ---

const Navbar = ({
  isDarkMode,
  toggleDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  location,
}) => (
  <nav className="
    bg-white dark:bg-gray-800 
    shadow-lg border-b border-gray-100 dark:border-gray-700
    sticky top-0 z-50 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95
  ">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="
        flex justify-between items-center h-16 sm:h-18 lg:h-20
        responsive-navbar
      ">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="
                text-2xl sm:text-3xl font-bold 
                text-red-600 dark:text-red-400 
                tracking-tight font-inter
                transform hover:scale-105 active:scale-95
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-red-500/20
                rounded-lg px-2 py-1
              "
            >
              BaeU Learning
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:space-x-2 xl:space-x-4">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} location={location} />
            ))}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Stats - hidden on very small screens */}
          <div className="hidden xs:flex items-center space-x-2 sm:space-x-3">
            <StreakDisplay streak={125} />
            <XPDisplay xp={1500} />
          </div>

          {/* Mobile menu button */}
          <IconButton
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            className="lg:hidden"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </IconButton>

          {/* Action buttons */}
          <div className="hidden sm:flex items-center space-x-1">
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
          </div>

          {/* Language selector */}
          <select
            className="
              bg-transparent text-sm font-medium 
              text-gray-600 dark:text-gray-300 
              border-0 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
              rounded-lg py-2 px-3 cursor-pointer 
              hover:bg-gray-50 dark:hover:bg-gray-700 
              transition-colors duration-200
              hidden sm:block
            "
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>

          {/* Profile */}
          <Link to="/profile" className="ml-2">
            <div className="
              h-9 w-9 sm:h-10 sm:w-10 rounded-full 
              bg-gradient-to-br from-secondary-500 to-secondary-600 
              flex items-center justify-center 
              text-white font-bold text-sm sm:text-lg 
              shadow-lg ring-2 ring-white dark:ring-gray-800 
              hover:shadow-xl hover:scale-105 active:scale-95
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
            ">
              U
            </div>
          </Link>
        </div>
      </div>
    </div>
  </nav>
);
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

const MobileMenu = ({ isMobileMenuOpen, location, setIsMobileMenuOpen, isDarkMode, toggleDarkMode }) => (
  <div
    className={`
      ${isMobileMenuOpen ? 'block animate-fade-in' : 'hidden'} 
      lg:hidden bg-white dark:bg-gray-800 
      shadow-xl border-t border-gray-100 dark:border-gray-700
      backdrop-blur-md bg-opacity-95 dark:bg-opacity-95
    `}
    id="mobile-menu"
  >
    <div className="responsive-mobile-menu px-4 py-4">
      {/* Mobile stats - show on small screens */}
      <div className="flex justify-center space-x-4 mb-4 xs:hidden">
        <StreakDisplay streak={125} />
        <XPDisplay xp={1500} />
      </div>

      {/* Navigation links */}
      <div className="space-y-2 mb-4">
        {navigation.map((item) => (
          <div key={item.name} className="block">
            <NavLink
              item={item}
              location={location}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        ))}
      </div>

      {/* Mobile-only controls */}
      <div className="flex justify-center space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700 sm:hidden">
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
          className="
            bg-transparent text-sm font-medium 
            text-gray-600 dark:text-gray-300 
            border border-gray-200 dark:border-gray-600
            focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
            rounded-lg py-2 px-3 cursor-pointer 
            hover:bg-gray-50 dark:hover:bg-gray-700 
            transition-colors duration-200
          "
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="ko">한국어</option>
        </select>
      </div>
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

  // Theme management
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="
      min-h-screen 
      bg-gray-50 dark:bg-gray-900 
      font-inter text-gray-900 dark:text-gray-100
      transition-colors duration-200
    ">
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
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main content with responsive grid layout */}
      <main className="
        responsive-main-content
        max-w-7xl mx-auto 
        px-4 sm:px-6 lg:px-8 
        py-6 sm:py-8 lg:py-10
        grid gap-6
        grid-cols-1 lg:grid-cols-12
      ">
        {/* Content area */}
        <div className="lg:col-span-12">
          <div className="
            bg-white dark:bg-gray-800 
            rounded-xl shadow-sm border border-gray-100 dark:border-gray-700
            overflow-hidden
            transition-all duration-200
            hover:shadow-md
          ">
            <div className="p-6 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer spacer */}
      <div className="h-16"></div>
    </div>
  );
};

export default Layout;