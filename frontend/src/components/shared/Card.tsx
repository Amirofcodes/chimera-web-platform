// src/components/shared/Card.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// Define the properties for the Card component.
interface CardProps {
  children: React.ReactNode;   // Content inside the card.
  className?: string;          // Optional additional CSS classes.
  title?: string;              // Optional title for the card.
}

/**
 * Card Component
 *
 * This component wraps content in a styled container (card). It adjusts its styling
 * based on the current theme and dark mode settings.
 */
export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  // Retrieve the current theme and dark mode flag from the Theme context.
  const { theme, isDarkMode } = useTheme();
  
  // Variables to store the dynamic CSS classes for the card and its title.
  let cardClasses = '';
  let titleClasses = '';
  
  // Determine the CSS classes based on the selected theme.
  if (theme === 'modern') {
    // Modern theme styling.
    if (isDarkMode) {
      // Modern theme in dark mode.
      cardClasses = 'bg-modern-card-dark text-gray-100 shadow-modern-card-dark rounded-modern';
      titleClasses = 'text-gray-100 font-semibold';
    } else {
      // Modern theme in light mode.
      cardClasses = 'bg-white text-gray-800 shadow-modern-card rounded-modern';
      titleClasses = 'text-gray-800 font-semibold';
    }
  } else {
    // Classic theme styling.
    cardClasses = 'bg-white rounded-lg shadow-sm';
    titleClasses = 'text-gray-800 font-semibold';
  }
  
  return (
    // Combine dynamic card classes with any additional classes provided via props.
    <div className={`${cardClasses} p-6 ${className}`}>
      {/* Render the title if provided */}
      {title && (
        <h2 className={`text-lg mb-4 ${titleClasses}`}>
          {title}
        </h2>
      )}
      {/* Render the child content inside the card */}
      {children}
    </div>
  );
};
