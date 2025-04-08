// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the available themes: 'classic' or 'modern'
type Theme = 'classic' | 'modern';

// Define the shape of the Theme context.
interface ThemeContextType {
  theme: Theme;                           // Current theme (classic or modern)
  setTheme: (theme: Theme) => void;         // Function to update the theme
  isDarkMode: boolean;                    // Flag indicating if dark mode is active
  toggleDarkMode: () => void;             // Function to toggle dark mode on/off
}

// Create the ThemeContext with an undefined default value.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider Component
 *
 * This component wraps the application and provides the theme context.
 * It checks for saved theme and dark mode preferences in localStorage and applies them.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the theme from localStorage or default to 'classic'
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'classic';
  });

  // Initialize dark mode state:
  // - Check localStorage first.
  // - Fallback to system preference using window.matchMedia.
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      return savedDarkMode === 'true';
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      return mq ? mq.matches : false;
    }
    return false;
  });

  // When the theme state changes, save it to localStorage.
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // When the dark mode state changes, save it to localStorage and update the document class.
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    // Add or remove the 'dark' class on the document root for Tailwind's dark mode.
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Function to toggle dark mode on and off.
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme: Custom hook to consume the Theme context.
 *
 * Ensures that the context is used within a ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
