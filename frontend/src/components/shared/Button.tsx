import React from 'react';
import { Spinner } from './Spinner';

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
  // Using our design system colors
  const baseClasses = 'rounded font-medium focus:outline-none focus:ring-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2.5 text-lg'
  };
  
  const variantClasses = {
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