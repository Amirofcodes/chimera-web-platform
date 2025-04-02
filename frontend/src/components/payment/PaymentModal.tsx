import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../shared/Button';
import { paymentService } from '../../services/paymentService';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentModalProps {
 tier: {
   name: string;
   amount: number;
 };
 onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ tier, onClose }) => {
 const { isDarkMode } = useTheme();
 const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);
 
 const handlePayment = async () => {
   if (!paymentMethod) {
     setError('Please select a payment method');
     return;
   }
   
   setLoading(true);
   setError(null);
   
   try {
     if (paymentMethod === 'stripe') {
       // Create checkout session via our backend API
       const response = await paymentService.createStripeCheckout(tier.amount, tier.name);
       
       // Redirect to Stripe Checkout
       window.location.href = response.checkoutUrl;
     } else {
       // Create PayPal payment
       const response = await paymentService.createPaypalCheckout(tier.amount, tier.name);
       
       // Redirect to PayPal
       window.location.href = response.approvalUrl;
     }
   } catch (err: any) {
     console.error('Payment error:', err);
     setError(err.message || 'Payment processing failed');
     setLoading(false);
   }
 };
 
 const modalBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
 const overlayClass = isDarkMode ? 'bg-black/70' : 'bg-gray-500/70';
 
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
 
 return (
   <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass}`}>
     <div className={`${modalBgClass} p-6 rounded-lg max-w-md w-full shadow-xl`}>
       <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-bold">Complete Your Donation</h3>
         <button
           onClick={onClose}
           className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
         >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>
       
       <div className="mb-6">
         <p className="mb-2">
           You are supporting ChimeraStack with a <strong>${tier.amount}</strong> donation as a <strong>{tier.name}</strong>.
         </p>
         <p className="text-sm opacity-70">
           Choose your preferred payment method below.
         </p>
       </div>
       
       <div className="space-y-4 mb-6">
         <button
           className={`w-full p-4 border rounded-lg flex items-center justify-between transition-colors ${
             paymentMethod === 'stripe' 
               ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
               : 'border-gray-200 dark:border-gray-700'
           }`}
           onClick={() => setPaymentMethod('stripe')}
         >
           <div className="flex items-center">
             <span className="font-medium">Pay with Credit Card</span>
           </div>
           <svg className="w-8" viewBox="0 0 60 25" fill="none">
             <path d="M59.4 14.3c0-4.2-2.1-7.6-6-7.6-3.8 0-6 3.4-6 7.5 0 5 2.7 7.4 6.5 7.4 1.9 0 3.3-.4 4.4-1v-2.9c-1.1.5-2.3.8-3.9.8-1.5 0-2.9-.5-3.1-2.5h8c0-.2.1-1 .1-1.7zm-8.1-1.6c0-1.9 1.2-2.7 2.2-2.7s2.2.8 2.2 2.7h-4.4zM40.8 6.8c-1.6 0-2.6.7-3.2 1.2l-.2-1h-3.5v20.4l4-.8v-5c.6.4 1.4.9 2.8.9 2.9 0 5.5-2.3 5.5-7.9-.1-5-2.7-7.8-5.4-7.8zm-1 12.6c-.9 0-1.5-.3-1.9-.7v-7.2c.4-.4 1-.6 1.9-.6 1.5 0 2.5 1.7 2.5 4.2 0 2.6-1 4.3-2.5 4.3zm-8.2-10.1h-4v12.5h4V9.3zm-2-1.4c1.2 0 2.2-1 2.2-2.2s-1-2.2-2.2-2.2-2.2 1-2.2 2.2 1 2.2 2.2 2.2zM24.1 6.3l-3.8.7v2.2h-2.2v3.3h2.2v6.7c0 2.5 1.9 3.7 4.4 3.7 1.2 0 2-.2 2.5-.4v-3.3c-.3.1-.7.2-1.3.2-.9 0-1.7-.3-1.7-1.8v-5h3.1V9.3h-3.1l-.1-3zM13.9 15.7c0 .9-.8 1.3-1.6 1.3-1 0-1.7-.5-1.7-1.3 0-.9.7-1.3 1.7-1.3.9 0 1.6.5 1.6 1.3zm-3.3-9c0-.9.8-1.3 1.7-1.3.9 0 1.6.5 1.6 1.3 0 .9-.7 1.3-1.6 1.3-1 0-1.7-.4-1.7-1.3zm7.6 3.2c-.7-.8-1.7-1.2-3-1.2-2.3 0-3.6 1.1-3.6 2.8 0 1.4.9 2.3 2.6 2.7l1.7.4c.8.2 1.1.5 1.1.9 0 .6-.6.9-1.7.9-1.2 0-2.1-.5-2.7-1.1l-1.6 2c1 1 2.3 1.5 4.3 1.5 2.6 0 4-1.2 4-2.9 0-1.5-1.1-2.4-2.7-2.7l-1.5-.4c-.9-.2-1.1-.5-1.1-.8 0-.5.6-.9 1.5-.9.9 0 1.9.5 2.3.8l1.4-2zM4.3 15.7c0 .9-.8 1.3-1.6 1.3-1 0-1.7-.5-1.7-1.3 0-.9.7-1.3 1.7-1.3.9 0 1.6.5 1.6 1.3zm-3.3-9c0-.9.8-1.3 1.7-1.3.9 0 1.6.5 1.6 1.3 0 .9-.7 1.3-1.6 1.3-1 0-1.7-.4-1.7-1.3z" fill="#635BFF"/>
           </svg>
         </button>
         
         <button
           className={`w-full p-4 border rounded-lg flex items-center justify-between transition-colors ${
             paymentMethod === 'paypal' 
               ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
               : 'border-gray-200 dark:border-gray-700'
           }`}
           onClick={() => setPaymentMethod('paypal')}
         >
           <div className="flex items-center">
             <span className="font-medium">Pay with PayPal</span>
           </div>
           <svg className="w-16" viewBox="0 0 101.6 32" fill="none">
             <path d="M94.4 7.7h-5.4c-.4 0-.7.3-.8.7l-2.3 14.7c0 .3.2.5.4.5h2.8c.3 0 .5-.2.5-.5l.6-4.1c0-.4.4-.7.8-.7h1.7c3.7 0 5.9-1.8 6.4-5.4.2-1.6 0-2.8-.7-3.7-.8-1-.2.1-3.4-1.5zm.6 5.2c-.3 2-1.8 2-3.3 2h-.8l.6-3.7c0-.2.2-.4.4-.4h.4c1 0 2 0 2.4.6.3.4.4.9.3 1.5zm15.6-5.2h-5.4c-.4 0-.7.3-.8.7l-2.3 14.7c0 .3.2.5.4.5h2.6c.4 0 .7-.3.8-.7l.6-3.8c0-.4.4-.7.8-.7h1.7c3.7 0 5.9-1.8 6.4-5.4.2-1.6 0-2.8-.7-3.7-.8-1-2.1-1.6-4.1-1.6zm.7 5.2c-.3 2-1.8 2-3.3 2h-.8l.6-3.7c0-.2.2-.4.4-.4h.4c1 0 2 0 2.4.6.3.4.4.9.3 1.5zM76.7 13h-2.7c-.2 0-.4.2-.4.4l-.1.6-.2-.2c-.5-.7-1.6-1-2.7-1-2.6 0-4.7 2-5.2 4.7-.2 1.4.1 2.7.8 3.7.7.8 1.6 1.2 2.8 1.2 2 0 3.1-.9 3.1-.9l-.1.5c0 .3.2.5.4.5h2.4c.4 0 .7-.3.8-.7l1.5-9.3c.1-.2-.1-.5-.4-.5zm-3.8 5.3c-.2 1.2-1.2 2.1-2.5 2.1-.6 0-1.2-.2-1.5-.6-.3-.4-.4-.9-.3-1.5.2-1.2 1.2-2.1 2.4-2.1.6 0 1.1.2 1.5.6.3.4.5 1 .4 1.5zm20-10.5l-2.3 14.8c0 .3.2.5.4.5h2.3c.4 0 .7-.3.8-.7l2.3-14.7c0-.3-.2-.5-.4-.5h-2.6c-.2 0-.4.1-.5.6zM35.2 13h-2.7c-.2 0-.4.2-.4.4l-.1.6-.2-.2c-.5-.7-1.6-1-2.7-1-2.6 0-4.7 2-5.2 4.7-.2 1.4.1 2.7.8 3.7.7.8 1.6 1.2 2.8 1.2 2 0 3.1-.9 3.1-.9l-.1.5c0 .3.2.5.4.5h2.4c.4 0 .7-.3.8-.7l1.5-9.3c.1-.2-.1-.5-.4-.5zm-3.8 5.3c-.2 1.2-1.2 2.1-2.5 2.1-.6 0-1.2-.2-1.5-.6-.3-.4-.4-.9-.3-1.5.2-1.2 1.2-2.1 2.4-2.1.6 0 1.1.2 1.5.6.4.4.5 1 .4 1.5zm10.3-10.1c-1.6 0-2.9.4-3.9 1.3-1 .9-1.5 2.1-1.7 3.5-.8 5.2 2.6 6.1 4.7 6.1.1 0 2.3.1 4.1-1l.3-.2c0 0 .1 0 .1-.1l.1-.1v-.2l.1-.1.4-2.3v-.1-.1L45.8 15.2c-.4 0-1.1.5-2.4.5-.9 0-2.9-.4-2.7-2.1h5.3c.8 0 1.5-.6 1.7-1.3.3-1.9.6-3.2-.4-4.3-.9-1-2.3-1.5-4.1-1.5v.5-.5c0 .1 0 .1 0 0zm-.3 3.6c.2-1.1 1.3-1.3 2-1.3.8 0 1.6.9 1.5 1.3h-3.5zm-27.1 1.2h-2.7c-.2 0-.4.2-.4.4l-.1.6-.2-.2c-.5-.7-1.6-1-2.7-1-2.6 0-4.7 2-5.2 4.7-.2 1.4.1 2.7.8 3.7.7.8 1.6 1.2 2.8 1.2 2 0 3.1-.9 3.1-.9l-.1.5c0 .3.2.5.4.5h2.4c.4 0 .7-.3.8-.7l1.5-9.3c.1-.2-.1-.5-.4-.5zm-3.7 5.3c-.2 1.2-1.2 2.1-2.5 2.1-.6 0-1.2-.2-1.5-.6-.3-.4-.4-.9-.3-1.5.2-1.2 1.2-2.1 2.4-2.1.6 0 1.1.2 1.5.6.3.4.4 1 .4 1.5zm20-10.5l-2.3 14.8c0 .3.2.5.4.5h2.3c.4 0 .7-.3.8-.7l2.3-14.7c0-.3-.2-.5-.4-.5h-2.6c-.2 0-.4.1-.5.6z" fill="#253B80"/>
             <path d="M6.4 22.1l.5-3L5.7 19H1.9l2.5-15.8c0-.2.2-.3.4-.3h7.1c2.4 0 4 .5 4.8 1.5.4.5.6 1 .7 1.5.1.6 0 1.2-.1 2v.6c-.4 2.1-1.6 3.8-3.5 5-1 .6-2.1 1-3.4 1.1-1 .1-1.9 0-2.7-.2-.2 0-.4-.1-.6-.2-.2-.1-.4-.2-.5-.3l-.3 2.1.1.1z" fill="#179BD7"/>
             <path d="M17.5 8.5h-3.3c-.2 0-.4.1-.5.3L11.5 19c0 .2.1.3.3.3h1.7c.2 0 .4-.1.5-.3l.6-3.8c0-.2.3-.3.5-.3h1c2.2 0 3.5-1.1 3.8-3.2.1-.9 0-1.7-.4-2.2-.5-.6-1.3-1-2-1zm.4 3.2c-.2 1.2-1.1 1.2-2 1.2h-.5l.4-2.3c0-.1.1-.2.2-.2h.2c.6 0 1.2 0 1.5.3.2.2.2.6.2 1z" fill="#253B80"/>
             <path d="M29.2 8.5h-3.3c-.2 0-.4.1-.5.3L23.2 19c0 .2.1.3.3.3h1.5c.2 0 .4-.1.5-.3l.4-2.6c0-.2.3-.3.5-.3h1c2.2 0 3.5-1.1 3.8-3.2.1-.9 0-1.7-.4-2.2-.5-.6-1.3-1-2.6-1.2zm.4 3.2c-.2 1.2-1.1 1.2-2 1.2h-.5l.4-2.3c0-.1.1-.2.2-.2h.2c.6 0 1.2 0 1.5.3.2.3.2.6.2 1zm3.8-6h-1.6c-.1 0-.2.1-.2.2L29.2 19c0 .1.1.2.2.2h1.6c.1 0 .2-.1.2-.2l2.3-13.2c.1-.1-.1-.2-.1-.1z" fill="#179BD7"/>
           </svg>
         </button>
       </div>
       
       {error && (
         <div className="mb-4 p-3 bg-red-50 text-red-600 rounded dark:bg-red-900/30 dark:text-red-400">
           {error}
         </div>
       )}
       
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