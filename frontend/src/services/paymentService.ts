import api from './api';

interface StripeResponse {
  success: boolean;
  checkoutUrl: string;
  sessionId: string;
}

interface PaypalResponse {
  success: boolean;
  approvalUrl: string;
  paymentId: string;
}

export const paymentService = {
  createStripeCheckout: async (amount: number, tierName: string): Promise<StripeResponse> => {
    const response = await api.post('/payment/stripe/create-checkout', {
      amount,
      tierName
    });
    return response.data;
  },
  
  createPaypalCheckout: async (amount: number, tierName: string): Promise<PaypalResponse> => {
    const response = await api.post('/payment/paypal/create-payment', {
      amount,
      tierName
    });
    return response.data;
  },
  
  verifyPayment: async (paymentId: string, paymentType: 'stripe' | 'paypal'): Promise<any> => {
    const response = await api.post(`/payment/${paymentType}/verify`, {
      paymentId
    });
    return response.data;
  }
};