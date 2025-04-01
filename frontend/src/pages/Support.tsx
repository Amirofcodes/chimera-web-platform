import React, { useState } from 'react';
import { Card } from '../components/shared/Card';
import Button from '../components/shared/Button';
import { useTheme } from '../context/ThemeContext';
import DonationTier from '../components/payment/DonationTier';
import PaymentModal from '../components/payment/PaymentModal';

const SupportPage = () => {
  const { theme, isDarkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<null | { name: string; amount: number }>(null);
  
  const donationTiers = [
    {
      name: 'Basic Supporter',
      amount: 5,
      benefits: ['Support ChimeraStack development', 'Your name in our supporters list'],
      icon: '🌱'
    },
    {
      name: 'Premium Supporter',
      amount: 20,
      benefits: ['Basic benefits', '2 Premium templates', 'Early access to new templates'],
      icon: '🚀',
      highlight: true
    },
    {
      name: 'Enterprise Sponsor',
      amount: 50,
      benefits: ['All Premium benefits', 'Custom template request', 'Priority support'],
      icon: '💎'
    }
  ];

  const handleDonationSelect = (tier: { name: string; amount: number }) => {
    setSelectedTier(tier);
    setShowModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Support ChimeraStack
      </h1>
      
      <Card className="mb-8">
        <h2 className="text-xl font-bold mb-4">Help Us Grow</h2>
        <p className="mb-6">
          ChimeraStack is an open-source project created to help developers simplify their
          workflow. Your donations directly support our development efforts and help us
          create more templates and features for the community.
        </p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {donationTiers.map((tier, index) => (
          <DonationTier
            key={index}
            name={tier.name}
            amount={tier.amount}
            benefits={tier.benefits}
            icon={tier.icon}
            highlight={tier.highlight}
            onSelect={() => handleDonationSelect(tier)}
          />
        ))}
      </div>
      
      <Card>
        <h2 className="text-xl font-bold mb-4">Other Ways to Support</h2>
        <p className="mb-4">
          Beyond donations, you can help ChimeraStack in several ways:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Star our repository on GitHub</li>
          <li>Report bugs and suggest features</li>
          <li>Contribute to our code</li>
          <li>Share ChimeraStack with other developers</li>
        </ul>
      </Card>
      
      {showModal && selectedTier && (
        <PaymentModal
          tier={selectedTier}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SupportPage;