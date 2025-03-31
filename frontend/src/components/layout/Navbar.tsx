// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../shared/ThemeToggle';
import Button from '../shared/Button';
import { useWindowSize } from '../../hooks/useWindowSize';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine classes based on theme and dark mode
  const navClasses = theme === 'modern'
    ? isDarkMode 
      ? 'bg-modern-secondary border-b border-gray-800 text-modern-text-dark' 
      : 'bg-white text-gray-900 shadow-sm'
    : 'bg-white shadow-sm';

  const logoClasses = theme === 'modern' 
    ? 'text-xl font-bold text-indigo-600' 
    : 'text-xl font-bold text-blue-600';

  const linkClasses = theme === 'modern'
    ? isDarkMode
      ? 'text-gray-300 hover:text-indigo-400'
      : 'text-gray-700 hover:text-indigo-600'
    : 'text-gray-700 hover:text-blue-600';

  const logoutClasses = theme === 'modern'
    ? isDarkMode
      ? 'text-red-400 hover:text-red-300'
      : 'text-red-600 hover:text-red-800'
    : 'text-red-600 hover:text-red-800';

  // Only show logo in classic theme or on mobile in modern theme
  const shouldShowLogo = theme !== 'modern' || isMobile;

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {shouldShowLogo ? (
            <Link to="/" className="flex items-center">
              <span className={logoClasses}>ChimeraStack</span>
            </Link>
          ) : (
            <div></div> // Empty div for spacing when logo is hidden
          )}
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            <Link to="/download-cli" className={linkClasses}>
              Download CLI
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/templates" className={linkClasses}>
                  Templates
                </Link>
                <Link to="/dashboard" className={linkClasses}>
                  Dashboard
                </Link>
                <div className="relative ml-3 flex items-center">
                  <Link 
                    to="/profile" 
                    className={`flex items-center ${linkClasses} mr-3`}
                  >
                    <div className={`w-8 h-8 rounded-full ${theme === 'modern' ? 'rounded-md' : ''} 
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
                    className={`${logoutClasses} text-sm`}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className={linkClasses}>
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
              className={`${linkClasses} focus:outline-none`}
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
              className={`block py-2 ${linkClasses}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Download CLI
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/templates" 
                  className={`block py-2 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Templates
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`block py-2 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`block py-2 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile ({user?.name || user?.email})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2 ${logoutClasses}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`block py-2 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`block py-2 ${linkClasses}`}
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