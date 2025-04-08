// src/pages/Auth/ResetPassword.tsx
import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Card } from '../../components/shared/Card'; // Reusable Card component for layout
import Button from '../../components/shared/Button'; // Reusable Button component
import { authService } from '../../services/authService'; // Service to handle authentication API calls

/**
 * ResetPasswordPage Component
 *
 * This page allows users to set a new password using a reset token.
 * It retrieves the token from the URL parameters, validates the form inputs,
 * and calls the backend API to reset the password.
 * On success, a confirmation message is shown, and the user is redirected to the login page.
 */
const ResetPasswordPage = () => {
  // Retrieve the reset token from URL parameters.
  const { token } = useParams<{ token: string }>();
  // Hook to navigate programmatically.
  const navigate = useNavigate();

  // Local state for new password, confirm password, loading state, error message, and success flag.
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  /**
   * handleSubmit: Handles the form submission.
   *
   * - Prevents the default form submission.
   * - Validates that the password and confirmPassword fields match.
   * - Ensures that a reset token is present.
   * - Calls the authService.resetPassword method to update the password.
   * - On success, sets the success flag and navigates to the login page after a short delay.
   * - On error, displays an error message.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that the passwords match.
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Ensure the reset token is available.
    if (!token) {
      setError('Reset token is missing');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call the reset password API with the token and new password.
      await authService.resetPassword(token, password);
      setSuccess(true);
      // After a delay, navigate to the login page.
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      // Set an error message based on the API response.
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Use Card component to wrap the reset password form */}
      <Card className="max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-6">Set New Password</h1>
        
        {success ? (
          // Display success message if password reset is successful.
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
            {/* Display error message if present */}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
            
            {/* Reset password form */}
            <form onSubmit={handleSubmit}>
              {/* New Password Field */}
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
              
              {/* Confirm New Password Field */}
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
              
              {/* Submit Button */}
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
