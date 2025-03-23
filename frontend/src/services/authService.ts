// src/services/authService.ts
import api from './api';

export const authService = {
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/request-reset', { email });
  },
  
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password: newPassword });
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  }
};