// src/components/shared/Card.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  const { theme, isDarkMode } = useTheme();
  
  // Apply different styles based on theme and dark mode
  let cardClasses = '';
  
  if (theme === 'modern') {
    cardClasses = isDarkMode
      ? 'bg-modern-card text-modern-text shadow-modern-card-dark rounded-modern'
      : 'bg-white text-gray-900 shadow-modern-card rounded-modern';
  } else {
    cardClasses = 'bg-white rounded-lg shadow-sm';
  }
  
  return (
    <div className={`${cardClasses} p-6 ${className}`}>
      {title && (
        <h2 className={`text-lg font-semibold mb-4 ${
          theme === 'modern' && isDarkMode ? 'text-modern-text' : ''
        }`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};