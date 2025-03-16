// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  // Don't append /api at the end of the base URL
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Add an interceptor to add /api prefix to all requests
api.interceptors.request.use(config => {
  // If the URL doesn't already start with /api, add it
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api/${config.url}`;
  }
  return config;
});

export default api;