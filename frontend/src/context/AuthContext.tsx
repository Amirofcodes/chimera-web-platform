// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  profile_image?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUserProfile: (updates: Partial<User>) => void;
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
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('auth/profile');
          
          if (response.data && response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          // console.error('Authentication check failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // For register method:
  const register = async (data: { email: string; password: string; name?: string }) => {
    try {
      // console.log('Registering user:', data.email);
      const response = await api.post('auth/register', data);
      
      if (response.data && response.data.success) {
        const { user, access_token } = response.data;
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      // console.error('Registration error:', error);
      throw error;
    }
  };

  // Updated login method with enhanced error handling for the modular backend
  const login = async (credentials: { email: string; password: string }) => {
    try {
      // console.log('Logging in user:', credentials.email);
      const response = await api.post('auth/login', credentials);
      
      if (response.data && response.data.success) {
        const { user, access_token } = response.data;
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      // console.error('Login error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile data in context
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
