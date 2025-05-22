import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SunIcon, MoonIcon, BellIcon } from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
    const location = useLocation();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Lessons', href: '/lessons' },
    { name: 'Profile', href: '/profile' },
  ];

    return (
    <div className="min-h-screen bg-background-default dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-heading font-bold text-primary-main">
                  Korean Learning
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-primary-main text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-0.5 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <SunIcon className="h-2 w-2" />
                ) : (
                  <MoonIcon className="h-2 w-2" />
                )}
              </button>

              <button className="p-0.5 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <BellIcon className="h-2 w-2" />
              </button>

              {/* Language Selector */}
              <select className="bg-transparent text-sm font-medium text-gray-500 dark:text-gray-300 border-0 focus:ring-0">
                <option value="en">English</option>
                <option value="ko">한국어</option>
              </select>

              {/* User Avatar */}
              <div className="ml-3 relative">
                <Link to="/profile">
                  <div className="h-8 w-8 rounded-full bg-primary-main flex items-center justify-center text-white font-medium">
                    U
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
    );
};

export default Layout; 