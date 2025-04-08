// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Access authentication state and actions
import { useTheme } from '../../context/ThemeContext'; // Access theme (modern/classic) and dark mode status
import { ThemeToggle } from '../shared/ThemeToggle'; // Button to toggle theme
import Button from '../shared/Button'; // Reusable Button component
import { useWindowSize } from '../../hooks/useWindowSize'; // Hook to determine window size for responsive behavior

export const Navbar: React.FC = () => {
  // Retrieve authentication data: whether user is logged in, current user data, and logout function.
  const { isAuthenticated, user, logout } = useAuth();
  // Retrieve current theme and dark mode status.
  const { theme, isDarkMode } = useTheme();
  // Navigation hook for programmatic navigation.
  const navigate = useNavigate();
  // State to control the visibility of the mobile menu.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Determine the window width to decide if we're in mobile view.
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  // Handle logout: call logout function and navigate to home.
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Dynamically set the navigation bar classes based on theme and dark mode.
  const navClasses = theme === 'modern'
    ? isDarkMode 
      ? 'bg-modern-secondary border-b border-gray-800 text-modern-text-dark'
      : 'bg-white text-gray-900 shadow-sm'
    : 'bg-white shadow-sm';

  // Set logo text classes based on theme.
  const logoClasses = theme === 'modern' 
    ? 'text-xl font-bold text-indigo-600'
    : 'text-xl font-bold text-blue-600';

  // Set link styling classes based on theme and dark mode.
  const linkClasses = theme === 'modern'
    ? isDarkMode
      ? 'text-gray-300 hover:text-indigo-400'
      : 'text-gray-700 hover:text-indigo-600'
    : 'text-gray-700 hover:text-blue-600';

  // Set logout button classes based on theme and dark mode.
  const logoutClasses = theme === 'modern'
    ? isDarkMode
      ? 'text-red-400 hover:text-red-300'
      : 'text-red-600 hover:text-red-800'
    : 'text-red-600 hover:text-red-800';

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top section of the navbar: logo and menu items */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className={logoClasses}>ChimeraStack</span>
          </Link>
          
          {/* Desktop Menu: hidden on mobile devices */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle button */}
            <ThemeToggle />
            
            {/* Navigation links */}
            <Link to="/download-cli" className={linkClasses}>
              Download CLI
            </Link>
            
            <Link to="/support" className={linkClasses}>
              Support Us
            </Link>
            
            {/* If the user is authenticated, show additional links and profile info */}
            {isAuthenticated ? (
              <>
                <Link to="/templates" className={linkClasses}>
                  Templates
                </Link>
                <Link to="/dashboard" className={linkClasses}>
                  Dashboard
                </Link>
                <div className="relative ml-3 flex items-center">
                  {/* Profile link with user avatar */}
                  <Link 
                    to="/profile" 
                    className={`flex items-center ${linkClasses} mr-3`}
                  >
                    <div className={`w-8 h-8 rounded-full ${theme === 'modern' ? 'rounded-md' : ''} 
                      bg-gray-200 flex items-center justify-center mr-2 overflow-hidden`}>
                      {user?.profile_image ? (
                        // Display user profile image if available
                        <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        // Otherwise, display the first letter of the user's name or email
                        <span className="text-sm">{user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <span>{user?.name || user?.email}</span>
                  </Link>
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className={`${logoutClasses} text-sm`}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // If not authenticated, show Login and Register options.
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
          
          {/* Mobile Menu Button: visible only on smaller screens */}
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
                {/* Toggle between hamburger and close icon based on menu state */}
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
        
        {/* Mobile Menu: renders only if mobileMenuOpen is true */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t dark:border-gray-700">
            <Link 
              to="/download-cli" 
              className={`block py-2 ${linkClasses}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Download CLI
            </Link>
            <Link 
              to="/support" 
              className={`block py-2 ${linkClasses}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Support Us
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
