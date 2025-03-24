// frontend/src/pages/Auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or use dashboard as default
  const from = (location.state as any)?.from || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login({ email, password });
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-6">Sign in to your account</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Button
            variant="primary"
            className="w-full"
            isLoading={loading}
            type="submit"
          >
            Sign in
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;