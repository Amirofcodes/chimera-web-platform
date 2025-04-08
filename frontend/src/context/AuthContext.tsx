// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Axios instance for making API calls

// Define the User interface with optional properties.
interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  profile_image?: string;
}

// Define the structure of the authentication context.
interface AuthContextType {
  isAuthenticated: boolean; // Indicates if the user is logged in
  user: User | null;        // Stores the logged-in user's data, if available
  login: (credentials: { email: string; password: string }) => Promise<void>; // Function to log in a user
  register: (data: { email: string; password: string; name?: string }) => Promise<void>; // Function to register a new user
  logout: () => void;       // Function to log out the current user
  loading: boolean;         // Indicates whether the authentication status is still loading
  updateUserProfile: (updates: Partial<User>) => void; // Function to update the user's profile in the context
}

// Create the AuthContext with an undefined default value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 *
 * This component provides authentication state and actions to the entire application.
 * It checks for an existing session on load, manages user data, and exposes login, register,
 * logout, and profile update methods.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to hold the current user.
  const [user, setUser] = useState<User | null>(null);
  // State to indicate if the user is authenticated.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to track whether the authentication check is still loading.
  const [loading, setLoading] = useState(true);

  // useEffect to check for an existing user session when the component mounts.
  useEffect(() => {
    const checkAuth = async () => {
      // Retrieve the token from localStorage.
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set the Authorization header for all subsequent API calls.
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Fetch the user's profile data from the backend.
          const response = await api.get('auth/profile');
          
          // If the response indicates success, update the user state.
          if (response.data && response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // If the profile fetch fails, clear the token and headers.
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          // On error, remove the token and clear the header.
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      // Authentication check is complete.
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  /**
   * register: Registers a new user.
   *
   * Sends a POST request to the backend with the registration data.
   * On success, it stores the access token, updates the user state, and sets the authentication flag.
   */
  const register = async (data: { email: string; password: string; name?: string }) => {
    try {
      const response = await api.post('auth/register', data);
      
      if (response.data && response.data.success) {
        const { user, access_token } = response.data;
        // Save the access token to localStorage for session persistence.
        localStorage.setItem('token', access_token);
        // Set the Authorization header for subsequent API calls.
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        // Update the user state and authentication flag.
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      // Pass the error up to the caller.
      throw error;
    }
  };

  /**
   * login: Logs in an existing user.
   *
   * Sends a POST request with user credentials. On a successful response, stores the token,
   * updates the user state, and marks the user as authenticated.
   */
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('auth/login', credentials);
      
      if (response.data && response.data.success) {
        const { user, access_token } = response.data;
        // Save token and set default Authorization header.
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      // If the error response contains an error message, throw it.
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  };

  /**
   * logout: Logs out the current user.
   *
   * Clears the user data, removes the token from localStorage,
   * and deletes the Authorization header.
   */
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * updateUserProfile: Updates the user's profile data in the context.
   *
   * This function merges the new updates with the existing user data.
   */
  const updateUserProfile = (updates: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      register, 
      logout, 
      loading,
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth: Custom hook to access the Auth context.
 *
 * This hook throws an error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
