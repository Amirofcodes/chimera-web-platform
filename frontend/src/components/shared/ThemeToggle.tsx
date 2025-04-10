// src/components/shared/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// Define the props for ThemeToggle; optionally accept additional CSS classes.
interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle Component
 *
 * This component provides two main controls:
 * 1. A toggle between "Classic" and "Modern" themes.
 * 2. A dark/light mode toggle (visible only when Modern theme is active).
 *
 * It uses the Theme context to get and update the current theme and dark mode status.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // Retrieve current theme, dark mode status, and updater functions from the Theme context.
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Theme Toggle Buttons (Classic/Modern) */}
      <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
        {/* Button to set Classic theme */}
        <button
          onClick={() => setTheme('classic')}
          className={`px-3 py-1.5 text-sm font-medium ${
            theme === 'classic'
              ? 'bg-blue-600 text-white'
              : 'bg-transparent dark:text-gray-300'
          }`}
        >
          Classic
        </button>
        {/* Button to set Modern theme */}
        <button
          onClick={() => setTheme('modern')}
          className={`px-3 py-1.5 text-sm font-medium ${
            theme === 'modern'
              ? 'bg-indigo-600 text-white'
              : 'bg-transparent dark:text-gray-300'
          }`}
        >
          Modern
        </button>
      </div>

      {/* Dark/Light Mode Toggle: Only display when Modern theme is active */}
      {theme === 'modern' && (
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-full focus:outline-none bg-gray-100 dark:bg-gray-700 shadow-sm"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {/* Render sun icon for dark mode, moon icon for light mode */}
          {isDarkMode ? (
            // Sun icon: indicates the current mode is dark and clicking will switch to light.
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            // Moon icon: indicates the current mode is light and clicking will switch to dark.
            <svg
              className="w-5 h-5 text-gray-700"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};
