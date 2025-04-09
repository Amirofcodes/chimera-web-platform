// src/components/layout/SideNav.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Get authentication data and actions
import { useTheme } from '../../context/ThemeContext'; // Get current theme and dark mode status
import { ThemeToggle } from '../shared/ThemeToggle'; // Component to toggle theme

const SideNav: React.FC = () => {
  // Retrieve user information and logout function from Auth context.
  const { user, logout } = useAuth();
  // Retrieve dark mode status from Theme context.
  const { isDarkMode } = useTheme();
  // Retrieve current route location.
  const location = useLocation();
  // Navigation hook for programmatic navigation.
  const navigate = useNavigate();
  
  // Define navigation items for the sidebar.
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Templates', path: '/templates', icon: 'template' },
    { name: 'Download CLI', path: '/download-cli', icon: 'download' },
    { name: 'Support Us', path: '/support', icon: 'heart' },
    { name: 'Profile', path: '/profile', icon: 'user' }
  ];
  
  // Handle logout: call the logout function and navigate to the home page.
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Set background color based on dark mode using Tailwind CSS classes.
  const bgColor = isDarkMode ? 'bg-modern-secondary border-r border-gray-800' : 'bg-white border-r border-gray-100';
  // Set text color based on dark mode.
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-700';
  
  return (
    <aside className={`w-64 min-h-screen ${bgColor} flex-shrink-0 hidden md:block`}>
      <div className="py-6 px-4 flex flex-col h-full">
        {/* Logo Section */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <span className="text-xl font-bold text-indigo-600">ChimeraStack</span>
        </Link>
        
        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.profile_image ? (
              // Display profile image if available.
              <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              // Otherwise, display the first letter of the user's name or email.
              <span className="text-3xl text-gray-400">{user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
            )}
          </div>
          <h3 className={`mt-3 font-medium ${textColor}`}>{user?.name || user?.email}</h3>
          <p className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>Developer</p>
        </div>
        
        {/* Theme Toggle Button */}
        <div className="mb-6 px-4">
          <ThemeToggle />
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-grow mt-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              // Check if the current route matches the navigation item's path.
              const isActive = location.pathname === item.path;
              // Set active class styles if the route is active; otherwise, use default styles.
              const activeClass = isActive 
                ? 'bg-indigo-600 text-white' 
                : `${textColor} hover:text-indigo-600 ${isDarkMode ? 'hover:bg-indigo-900/30' : 'hover:bg-indigo-50'}`;
              
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activeClass}`}
                  >
                    {/* Render the corresponding icon for the navigation item */}
                    <span className="mr-3">
                      {getIcon(item.icon)}
                    </span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
        >
          <span className="mr-3">
            {/* Logout icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
};

// Helper function to return the appropriate icon based on the provided name.
function getIcon(name: string) {
  switch (name) {
    case 'home':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'template':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      );
    case 'user':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'download':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default SideNav;
