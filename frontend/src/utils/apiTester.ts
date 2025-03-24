// src/utils/apiTester.ts
import api from '../services/api';

// This utility helps verify if endpoints are working with the refactored backend
export const verifyEndpoint = async (endpoint: string): Promise<boolean> => {
  try {
    await api.get(endpoint);
    return true;
  } catch (error) {
    console.error(`Endpoint ${endpoint} failed:`, error);
    return false;
  }
};