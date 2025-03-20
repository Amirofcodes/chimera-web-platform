// src/services/api.ts - Updated with explicit debugging
import axios from "axios";

// Enhanced debugging
console.log("API Configuration:");
console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL); 
console.log("Effective API URL:", process.env.REACT_APP_API_URL || "/api");

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Add detailed request logging
api.interceptors.request.use((config) => {
  const fullURL = (config.baseURL || "") + (config.url || "");
  console.log(
    "API Request:",
    config.method?.toUpperCase(),
    fullURL,
    "Headers:",
    JSON.stringify(config.headers),
    "Data:",
    config.data ? JSON.stringify(config.data) : "none"
  );
  return config;
});

// Add detailed response logging
api.interceptors.response.use(
  (response) => {
    console.log(
      "API Response:",
      response.status,
      response.statusText,
      "Data:",
      JSON.stringify(response.data)
    );
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.statusText,
      error.message,
      "Response:",
      error.response?.data ? JSON.stringify(error.response.data) : "none"
    );
    return Promise.reject(error);
  }
);

export default api;