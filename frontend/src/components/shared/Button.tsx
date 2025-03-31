// src/components/shared/Button.tsx
import React from 'react';
import { Spinner } from './Spinner';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  
  // Base classes for all buttons
  const baseClasses = theme === 'modern' 
    ? 'rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors' 
    : 'rounded font-medium focus:outline-none focus:ring-2';
  
  // Size classes remain same for both themes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2.5 text-lg'
  };
  
  // Variant classes differ by theme
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

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabledClasses}
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;