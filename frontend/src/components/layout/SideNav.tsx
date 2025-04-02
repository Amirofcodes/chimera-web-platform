// src/components/layout/SideNav.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../shared/ThemeToggle';

const SideNav: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Templates', path: '/templates', icon: 'template' },
    { name: 'Download CLI', path: '/download-cli', icon: 'download' },
    { name: 'Support Us', path: '/support', icon: 'heart' },
    { name: 'Profile', path: '/profile', icon: 'user' }
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Background color based on dark mode
  const bgColor = isDarkMode ? 'bg-modern-secondary border-r border-gray-800' : 'bg-white border-r border-gray-100';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-700';
  
  return (
    <aside className={`w-64 min-h-screen ${bgColor} flex-shrink-0 hidden md:block`}>
      <div className="py-6 px-4 flex flex-col h-full">
        <Link to="/" className="flex items-center justify-center mb-8">
          <span className="text-xl font-bold text-indigo-600">ChimeraStack</span>
        </Link>
        
        {/* User profile section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-400">{user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
            )}
          </div>
          <h3 className={`mt-3 font-medium ${textColor}`}>{user?.name || user?.email}</h3>
          <p className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>Developer</p>
        </div>
        
        {/* Theme toggle */}
        <div className="mb-6 px-4">
          <ThemeToggle />
        </div>
        
        {/* Navigation */}
        <nav className="flex-grow mt-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const activeClass = isActive 
                ? 'bg-indigo-600 text-white' 
                : `${textColor} hover:text-indigo-600 ${isDarkMode ? 'hover:bg-indigo-900/30' : 'hover:bg-indigo-50'}`;
              
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activeClass}`}
                  >
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
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
        >
          <span className="mr-3">
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

// Helper function to render the appropriate icon
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