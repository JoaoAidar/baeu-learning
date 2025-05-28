import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// --- Duolingo-inspired Colors (Ideally in tailwind.config.js) ---
// For demonstration, I'm using arbitrary values like `bg-[#58CC02]`
// In your tailwind.config.js, it might look like this:
/*
module.exports = {
  theme: {
    extend: {
      colors: {
        'duo-green-main': '#58CC02',
        'duo-green-dark': '#4CAF00',
        'duo-green-light': '#8AF148',
        'duo-yellow': '#FFC800',
        'duo-blue': '#1CB0F6', // Used for XP display
        'duo-red': '#FF4B4B',
        'duo-purple': '#CE82FF',
        'duo-text-dark': '#3C3C3C',
        'duo-text-light': '#FFFFFF',
        'duo-bg-light': '#F7F7F7',
        'duo-bg-dark': '#1F2437',
      },
      fontFamily: {
        // You'd import specific fonts (e.g., 'Fredoka One' for headings, 'Nunito' for body)
        // heading: ['Fredoka One', 'cursive'],
        // body: ['Nunito', 'sans-serif'],
      }
    }
  }
}
*/

// --- Sub-components ---

// Mock Streak Display component for gamification feel
const StreakDisplay = ({ streak }) => (
  <div className="flex items-center space-x-1 p-2 bg-[#FFC800] rounded-full text-white font-bold text-sm shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
    <span className="text-xl">🔥</span> {/* Fire icon */}
    <span>{streak}</span>
  </div>
);

// New Mock XP Display component
const XPDisplay = ({ xp }) => (
  <div className="flex items-center space-x-1 p-2 bg-[#1CB0F6] rounded-full text-white font-bold text-sm shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
    <span className="text-xl">✨</span> {/* Star or Sparkle icon */}
    <span>{xp} XP</span>
  </div>
);


const Navbar = ({
  isDarkMode,
  toggleDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navigation,
  location,
}) => (
  <nav className="bg-white dark:bg-[#1F2437] shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          {/* Logo - More Duolingo-like bold text with playful hover */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-3xl font-bold text-[#58CC02] dark:text-[#8AF148] tracking-tight 
                         transform hover:rotate-3 transition-transform duration-200 ease-in-out"
            >
              KoreanLearning
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:ml-8 md:flex md:space-x-4 lg:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  ${location.pathname === item.href
                    ? 'bg-[#58CC02] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                  inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side buttons & User Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mock Streak Display */}
          <StreakDisplay streak={125} /> {/* Example streak */}

          {/* Mock XP Display */}
          <XPDisplay xp={1500} /> {/* Example XP */}

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-[#58CC02] dark:hover:text-[#8AF148] hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#58CC02] transition-all duration-200 transform hover:scale-110"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">
              {isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            </span>
            {isMobileMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#58CC02] dark:hover:text-[#8AF148] transition-all duration-200 transform hover:scale-110"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#58CC02] dark:hover:text-[#8AF148] transition-all duration-200 transform hover:scale-110"
            aria-label="View notifications"
          >
            <BellIcon className="h-5 w-5" />
          </button>

          {/* Language Selector - Styled to blend in and be rounded */}
          <select
            className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 border-0 focus:ring-0 rounded-lg py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>

          {/* User Avatar - More prominent & rounded with hover */}
          <div className="ml-3 relative">
            <Link to="/profile">
              <div className="h-10 w-10 rounded-full bg-[#1CB0F6] flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white dark:ring-gray-800 hover:scale-105 transition-transform duration-200">
                U
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const MobileMenu = ({ isMobileMenuOpen, navigation, location, setIsMobileMenuOpen }) => (
  <div
    className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-800 shadow-md`}
    id="mobile-menu"
  >
    <div className="pt-2 pb-3 space-y-1 px-2">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`
            ${location.pathname === item.href
              ? 'bg-[#58CC02] text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }
            block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200
          `}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {item.name}
        </Link>
      ))}
    </div>
  </div>
);

// --- Main Layout Component ---

const Layout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode based on system preference or saved setting
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false; // Default to light mode on server-side render
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Apply dark mode class on initial render and when isDarkMode changes
  useState(() => { // Using useState as a useEffect for side effect, common in simple cases
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

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Lessons', href: '/lessons' },
    { name: 'Profile', href: '/profile' },
    { name: 'Leagues', href: '/leagues' },
    { name: 'Shop', href: '/shop' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#121626] font-sans"> {/* Updated background colors, general font */}
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigation={navigation}
        location={location}
      />
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        navigation={navigation}
        location={location}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
