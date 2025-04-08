// src/pages/Auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/shared/Card'; // Reusable Card component for consistent layout
import Button from '../../components/shared/Button'; // Reusable Button component
import { authService } from '../../services/authService'; // Service to handle authentication-related API calls

/**
 * ForgotPasswordPage Component
 *
 * This page allows users to request a password reset by entering their email address.
 * On form submission, it sends a request to the backend via authService.
 * Depending on the response, it conditionally renders a success message or error.
 */
const ForgotPasswordPage = () => {
  // Local state to manage the email input, loading, success, and error messages.
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  /**
   * handleSubmit: Handles form submission for password reset.
   * - Prevents the default form submission behavior.
   * - Sets loading state and clears any previous errors.
   * - Calls authService.requestPasswordReset with the entered email.
   * - Updates the success state on a successful request.
   * - Catches errors and displays an error message.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the password reset API endpoint.
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      // Set error message if the request fails.
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Card component to wrap the content in a styled container */}
      <Card className="max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-6">Reset Your Password</h1>
        
        {success ? (
          // Render success message if the request was successful.
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
            {/* Display error message if one exists */}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
            
            <p className="mb-4 text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {/* Password reset form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label 
                  className="block text-gray-700 text-sm font-bold mb-2" 
                  htmlFor="email"
                >
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
              
              {/* Submit button that shows a spinner when loading */}
              <Button
                variant="primary"
                className="w-full"
                isLoading={loading}
                type="submit"
              >
                Send Reset Link
              </Button>
            </form>
            
            {/* Link to navigate back to the login page */}
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
