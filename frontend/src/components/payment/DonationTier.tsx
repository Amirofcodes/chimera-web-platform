import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../shared/Button';

// Define the props for the DonationTier component.
interface DonationTierProps {
  name: string;            // Name of the donation tier (e.g., "Gold", "Silver")
  amount: number;          // Donation amount in USD
  benefits: string[];      // List of benefits provided at this donation level
  icon?: string;           // Optional icon to display for the tier
  highlight?: boolean;     // Flag to visually highlight this tier
  onSelect: () => void;    // Callback function when the tier is selected
}

/**
 * DonationTier Component
 *
 * This component displays a donation tier card, including an icon, tier name,
 * donation amount, a list of benefits, and a button to initiate a donation.
 * It applies different styles based on the current theme and whether the tier is highlighted.
 */
const DonationTier: React.FC<DonationTierProps> = ({
  name,
  amount,
  benefits,
  icon,
  highlight = false,
  onSelect
}) => {
  // Retrieve dark mode status from the Theme context to adjust styling.
  const { isDarkMode } = useTheme();
  
  // Base CSS classes for the donation tier card.
  const baseClasses = 'p-6 rounded-lg transition-transform hover:scale-105';
  
  // Determine additional styling for highlighted tiers.
  // Different background and border styles are applied based on dark mode.
  const highlightClasses = highlight
    ? isDarkMode 
      ? 'border-2 border-indigo-500 bg-indigo-900/30'  // Dark mode: highlighted
      : 'border-2 border-indigo-500 bg-indigo-50'         // Light mode: highlighted
    : isDarkMode
      ? 'bg-gray-800'                                   // Dark mode: non-highlighted
      : 'bg-white shadow';                              // Light mode: non-highlighted
  
  return (
    <div className={`${baseClasses} ${highlightClasses}`}>
      {/* Header Section: Display icon, tier name, and donation amount */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{icon}</div>
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="text-2xl font-bold mt-2">
          ${amount}
          <span className="text-sm font-normal opacity-70"> USD</span>
        </div>
      </div>
      
      {/* List of benefits for this donation tier */}
      <ul className="mb-6 space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center">
            {/* Check icon for benefit */}
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>
      
      {/* Donate button to trigger the onSelect callback */}
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
