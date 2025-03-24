// src/services/api.ts
import axios from "axios";

// Debug logs commented out for production
// console.log("API Configuration:");
// console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
// console.log("Effective API URL:", process.env.REACT_APP_API_URL || "/api");

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Commented out request logging
api.interceptors.request.use((config) => {
  // const fullURL = (config.baseURL || "") + (config.url || "");
  // console.log(`[API] Request: ${config.method?.toUpperCase()} ${fullURL}`, config.data ? JSON.stringify(config.data) : "none");
  return config;
});

// Commented out response logging
api.interceptors.response.use(
  (response) => {
    // console.log(`[API] Response: ${response.status} ${response.statusText}`, JSON.stringify(response.data));
    return response;
  },
  (error) => {
    // Structured error handling for modular backend
    // if (error.response?.data?.error) {
    //   console.error("API Error:", error.response.data.error);
    // } else {
    //   console.error("API Error:", error.response?.status, error.response?.statusText, error.message);
    // }
    return Promise.reject(error);
  }
);

export default api;
