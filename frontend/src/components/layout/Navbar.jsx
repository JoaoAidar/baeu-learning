import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!user;
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="text-xl font-bold text-teal-400">
            BAEU Learning
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-x-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link 
              to="/lessons" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Lessons
            </Link>
            <Link 
              to="/profile" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Profile
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-x-4">
            {/* Language Selector */}
            <select 
              className="bg-gray-800 text-gray-200 border border-gray-700 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>

            {/* User Avatar */}
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white hover:bg-gray-500 transition-colors duration-200">
                <span>JD</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 