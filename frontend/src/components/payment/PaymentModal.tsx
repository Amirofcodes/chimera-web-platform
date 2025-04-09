import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Hook to access dark mode status for styling
import Button from '../../components/shared/Button'; // Reusable Button component
import { paymentService } from '../../services/paymentService'; // Service to interact with the backend payment API
import { loadStripe } from '@stripe/stripe-js'; // Stripe library for checkout

// Initialize Stripe using the publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

// Define props for the PaymentModal component
interface PaymentModalProps {
  tier: {
    name: string;    // Name of the donation tier (e.g., "Gold", "Silver")
    amount: number;  // Donation amount in USD
  };
  onClose: () => void; // Callback function to close the modal
}

/**
 * PaymentModal Component
 *
 * This component displays a modal for processing a donation payment.
 * It allows users to pay via Stripe, handles the payment processing
 * via our backend API, and provides feedback (loading, error, success).
 */
const PaymentModal: React.FC<PaymentModalProps> = ({ tier, onClose }) => {
  const { isDarkMode } = useTheme(); // Retrieve dark mode status for styling adjustments
  
  // Local state to manage payment flow
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Check Stripe initialization
  useEffect(() => {
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          console.error("Stripe failed to initialize");
          setError("Payment system is currently unavailable. Please try again later.");
        }
      } catch (err) {
        console.error("Error initializing Stripe:", err);
        setError("Payment system encountered an error. Please try again later.");
      }
    };
    
    checkStripe();
  }, []);
 
  /**
   * handlePayment: Processes the payment via Stripe.
   * - Sets loading state and clears previous errors
   * - Calls the API endpoint to create a checkout session
   * - Redirects the user to the Stripe checkout page
   * - Handles errors by displaying appropriate error messages
   */
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a Stripe checkout session via the backend API
      const response = await paymentService.createStripeCheckout(tier.amount, tier.name);

      // Check if we received a valid checkout URL
      if (!response.checkoutUrl) {
        throw new Error("Invalid response from payment server");
      }
      
      // Log for debugging purposes
      console.log("Redirecting to Stripe checkout:", response.checkoutUrl);
      
      // Redirect the user to the Stripe checkout URL
      window.location.href = response.checkoutUrl;
    } catch (err: any) {
      console.error('Payment error:', err);
      
      // Provide specific error messages based on the type of error
      if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Payment processing failed. Please try again later.");
      }
      
      setLoading(false);
    }
  };
  
  // Define dynamic classes based on dark mode
  const modalBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const overlayClass = isDarkMode ? 'bg-black/70' : 'bg-gray-500/70';
  
  // Render a success message if the payment is successful
  if (success) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass}`}>
        <div className={`${modalBgClass} p-8 rounded-lg max-w-md w-full shadow-xl`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
            <p className="mb-4">Your support helps us continue developing ChimeraStack.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the payment modal
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass}`}>
      <div className={`${modalBgClass} p-6 rounded-lg max-w-md w-full shadow-xl`}>
        {/* Header section with title and close button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Complete Your Donation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Information about the donation tier */}
        <div className="mb-6">
          <p className="mb-2">
            You are supporting ChimeraStack with a <strong>${tier.amount}</strong> donation as a <strong>{tier.name}</strong>.
          </p>
          <p className="text-sm opacity-70">
            You'll be redirected to Stripe to complete your payment securely.
          </p>
        </div>
        
        {/* Display error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        {/* Action buttons: Cancel and Proceed to Payment */}
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePayment} isLoading={loading}>
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;