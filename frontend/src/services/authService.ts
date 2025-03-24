// src/services/authService.ts
import api from './api';

export const authService = {
  requestPasswordReset: async (email: string): Promise<void> => {
    // console.log(`[API] Calling /auth/request-reset`, { email });
    await api.post('/auth/request-reset', { email });
  },
  
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    // console.log(`[API] Calling /auth/reset-password`, { token, password: newPassword });
    await api.post('/auth/reset-password', { token, password: newPassword });
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    // console.log(`[API] Calling /auth/change-password`, { currentPassword, newPassword });
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
  
  uploadProfilePicture: async (file: File): Promise<string> => {
    // console.log(`[API] Calling /auth/upload-profile-picture`, { file });
    const formData = new FormData();
    formData.append('profile_image', file);
  
    const response = await api.post('/auth/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  
    return response.data.image_url;
  }
};
