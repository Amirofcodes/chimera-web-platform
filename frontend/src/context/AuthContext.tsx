// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile using the relative path
          const response = await api.get('auth/profile');
          
          if (response.data && response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // If profile fetch fails, clear token
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Remove the leading slash so the baseURL concatenates properly
      const response = await api.post('auth/login', credentials);
      
      if (response.data && response.data.success) {
        const { user, access_token } = response.data;
        
        // Store token
        localStorage.setItem('token', access_token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; name?: string }) => {
    try {
      // Use relative path to properly append to the baseURL
      const response = await api.post('auth/register', data);
      
      if (response.data && response.data.success) {
        const { user, access_token } = response.data;
        
        // Store token
        localStorage.setItem('token', access_token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
