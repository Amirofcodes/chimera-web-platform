// src/services/api.ts
import axios from 'axios';

// For debugging - remove in production
console.log('API URL:', process.env.REACT_APP_API_URL || '/api');

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add request logging
api.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
  return config;
});

// Add response logging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.statusText);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.statusText, error.message);
    return Promise.reject(error);
  }
);

export default api;