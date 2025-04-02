import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../shared/Button';

interface DonationTierProps {
  name: string;
  amount: number;
  benefits: string[];
  icon?: string;
  highlight?: boolean;
  onSelect: () => void;
}

const DonationTier: React.FC<DonationTierProps> = ({
  name,
  amount,
  benefits,
  icon,
  highlight = false,
  onSelect
}) => {
  const { isDarkMode } = useTheme();
  
  const baseClasses = 'p-6 rounded-lg transition-transform hover:scale-105';
  const highlightClasses = highlight
    ? isDarkMode 
      ? 'border-2 border-indigo-500 bg-indigo-900/30' 
      : 'border-2 border-indigo-500 bg-indigo-50'
    : isDarkMode
      ? 'bg-gray-800'
      : 'bg-white shadow';
      
  return (
    <div className={`${baseClasses} ${highlightClasses}`}>
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{icon}</div>
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="text-2xl font-bold mt-2">
          ${amount}
          <span className="text-sm font-normal opacity-70"> USD</span>
        </div>
      </div>
      
      <ul className="mb-6 space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>
      
      <Button 
        variant={highlight ? "primary" : "secondary"} 
        className="w-full"
        onClick={onSelect}
      >
        Donate ${amount}
      </Button>
    </div>
  );
};

export default DonationTier;