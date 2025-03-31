// src/components/layout/Footer.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { theme, isDarkMode } = useTheme();

  // Determine the appropriate classes based on theme and dark mode
  const footerClasses = theme === 'modern'
    ? isDarkMode 
      ? 'bg-modern-secondary border-t border-gray-800 text-gray-400' 
      : 'bg-white border-t border-gray-100 text-gray-600'
    : 'bg-gray-50 border-t text-gray-600';

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            © {new Date().getFullYear()} ChimeraStack. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};