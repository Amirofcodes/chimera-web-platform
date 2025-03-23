// src/pages/Auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { authService } from '../../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-6">Reset Your Password</h1>
        
        {success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-600 p-4 rounded mb-4">
              If an account exists with this email, you'll receive password reset instructions.
            </div>
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
            
            <p className="mb-4 text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
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
              
              <Button
                variant="primary"
                className="w-full"
                isLoading={loading}
                type="submit"
              >
                Send Reset Link
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to login
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;