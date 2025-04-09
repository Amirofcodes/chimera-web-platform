import api from './api';

interface StripeResponse {
  success: boolean;
  checkoutUrl: string;
  sessionId: string;
}

export const paymentService = {
  /**
   * Creates a Stripe checkout session for donation payment
   * 
   * @param amount - The donation amount in USD
   * @param tierName - The name of the donation tier 
   * @returns Promise with checkout URL and session ID
   */
  createStripeCheckout: async (amount: number, tierName: string): Promise<StripeResponse> => {
    try {
      const response = await api.post('/payment/stripe/create-checkout', {
        amount,
        tierName
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create checkout session');
      }

      return response.data;
    } catch (error: any) {
      console.error('Stripe checkout creation error:', error);
      
      // Rethrow the error with the response data if available, or use the original error
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },
  
  /**
   * Verifies a Stripe payment after completion
   * 
   * @param sessionId - The Stripe session ID to verify
   * @returns Promise with payment verification result
   */
  verifyStripePayment: async (sessionId: string): Promise<any> => {
    try {
      const response = await api.post('/payment/stripe/verify', {
        sessionId
      });
      
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },
  
  /**
   * Gets payment history for the current user
   * 
   * @returns Promise with the user's payment history
   */
  getPaymentHistory: async (): Promise<any> => {
    try {
      const response = await api.get('/payment/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
};