// src/components/layout/Footer.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  // Retrieve the current theme and dark mode status from the Theme context.
  const { theme, isDarkMode } = useTheme();

  // Determine the CSS classes for the footer based on the active theme.
  // If the theme is "modern", different classes are applied based on dark mode.
  // Otherwise, a default style is used.
  const footerClasses = theme === 'modern'
    ? isDarkMode 
      ? 'bg-modern-secondary border-t border-gray-800 text-gray-400' // Dark mode styling for modern theme
      : 'bg-white border-t border-gray-100 text-gray-600'            // Light mode styling for modern theme
    : 'bg-gray-50 border-t text-gray-600';                             // Default styling for other themes

  return (
    <footer className={footerClasses}>
      {/* Container for centering content and setting padding */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Display the current year and copyright information */}
          <div className="text-sm">
            © {new Date().getFullYear()} ChimeraStack. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
