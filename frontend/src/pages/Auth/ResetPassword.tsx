// src/pages/Auth/ResetPassword.tsx
import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { authService } from '../../services/authService';

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setError('Reset token is missing');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-6">Set New Password</h1>
        
        {success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-600 p-4 rounded mb-4">
              Your password has been reset successfully! Redirecting to login...
            </div>
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              
              <Button
                variant="primary"
                className="w-full"
                isLoading={loading}
                type="submit"
              >
                Reset Password
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;