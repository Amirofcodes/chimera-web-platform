// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../shared/ThemeToggle';
import Button from '../shared/Button';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine the appropriate classes based on theme and dark mode
  const navClasses = theme === 'modern' 
    ? `${isDarkMode ? 'bg-modern-card text-modern-text' : 'bg-white text-gray-900'} shadow-sm` 
    : 'bg-white shadow-sm';

  const logoClasses = theme === 'modern' 
    ? 'text-xl font-bold text-indigo-600' 
    : 'text-xl font-bold text-blue-600';

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className={logoClasses}>ChimeraStack</span>
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            <Link to="/download-cli" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              Download CLI
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/templates" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Templates
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Dashboard
                </Link>
                <div className="relative ml-3 flex items-center">
                  <Link 
                    to="/profile" 
                    className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 mr-3"
                  >
                    <div className={`w-8 h-8 rounded-full ${theme === 'modern' ? 'rounded-modern' : ''} 
                      bg-gray-200 flex items-center justify-center mr-2 overflow-hidden`}>
                      {user?.profile_image ? (
                        <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <span>{user?.name || user?.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm`}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle className="mr-2" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t dark:border-gray-700">
            <Link 
              to="/download-cli" 
              className="block py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Download CLI
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/templates" 
                  className="block py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Templates
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="block py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile ({user?.name || user?.email})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};