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
  let titleClasses = '';
  
  if (theme === 'modern') {
    // Modern theme with improved contrast
    if (isDarkMode) {
      cardClasses = 'bg-modern-card-dark text-gray-100 shadow-modern-card-dark rounded-modern';
      titleClasses = 'text-gray-100 font-semibold';
    } else {
      cardClasses = 'bg-white text-gray-800 shadow-modern-card rounded-modern';
      titleClasses = 'text-gray-800 font-semibold';
    }
  } else {
    // Classic theme
    cardClasses = 'bg-white rounded-lg shadow-sm';
    titleClasses = 'text-gray-800 font-semibold';
  }
  
  return (
    <div className={`${cardClasses} p-6 ${className}`}>
      {title && (
        <h2 className={`text-lg mb-4 ${titleClasses}`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};