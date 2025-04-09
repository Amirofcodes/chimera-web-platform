// src/components/shared/Button.tsx
import React from 'react';
import { Spinner } from './Spinner'; // Reusable spinner component for loading state
import { useTheme } from '../../context/ThemeContext'; // Hook to access current theme settings

// Define the properties (props) that the Button component accepts.
interface ButtonProps {
  variant?: 'primary' | 'success' | 'danger' | 'secondary'; // Determines button style
  size?: 'sm' | 'md' | 'lg'; // Determines button size
  isLoading?: boolean; // Flag to indicate loading state
  disabled?: boolean; // Flag to disable the button
  children: React.ReactNode; // Content inside the button (text, icons, etc.)
  className?: string; // Additional custom CSS classes
  onClick?: () => void; // Click handler function
  type?: 'button' | 'submit' | 'reset'; // Button type attribute
}

/**
 * Button Component
 *
 * This component renders a styled button that adapts its appearance based on
 * its variant, size, loading state, and the current theme. It also supports
 * additional custom classes and an onClick handler.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',  // Default variant is primary
  size = 'md',          // Default size is medium
  isLoading = false,    // Not loading by default
  disabled = false,     // Not disabled by default
  children,
  className = '',
  ...props              // Spread any additional properties onto the button element
}) => {
  const { theme } = useTheme(); // Retrieve the current theme from context
  
  // Base classes applied to every button.
  // Adjusts border-radius, font weight, focus, and transition properties.
  const baseClasses = theme === 'modern' 
    ? 'rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors'
    : 'rounded font-medium focus:outline-none focus:ring-2';
  
  // Define size-specific classes.
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',   // Small button styles
    md: 'px-4 py-2 text-base',    // Medium button styles
    lg: 'px-6 py-2.5 text-lg'       // Large button styles
  };
  
  // Define variant-specific classes for both modern and classic themes.
  const variantClasses = theme === 'modern' 
    ? {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
      }
    : {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      };

  // Classes to apply when the button is disabled.
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      // Combine all classes: base, size, variant, disabled, and any custom classes.
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabledClasses}
        ${className}
      `}
      // The button is disabled if it's loading or explicitly disabled.
      disabled={isLoading || disabled}
      {...props} // Spread any additional props onto the button element.
    >
      {/* If loading, show the Spinner; otherwise, show the children content */}
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
