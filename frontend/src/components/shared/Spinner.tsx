import React from 'react';

// Define the properties for the Spinner component.
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // Spinner size: small, medium, or large.
  className?: string;       // Optional additional CSS classes.
}

/**
 * Spinner Component
 *
 * This component displays a spinning loader animation to indicate a loading state.
 * It applies dynamic sizing based on the provided size prop and uses Tailwind CSS
 * classes for styling and animation.
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  // Define size-specific CSS classes for width and height.
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    // The outer div applies the size classes, any additional classes, and sets the role for accessibility.
    <div className={`${sizeClasses[size]} ${className}`} role="status">
      {/* Animated spinner: a rounded element with border styling.
          Tailwind's animate-spin class applies the spin animation.
          The border classes style the spinner with a subtle gray border and a blue top border for contrast. */}
      <div className="animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 h-full w-full"/>
      {/* Screen-reader only text for accessibility */}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
