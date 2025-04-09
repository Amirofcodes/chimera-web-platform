// frontend/src/pages/Auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Hook to access authentication functions and state
import Button from '../../components/shared/Button'; // Reusable Button component
import { Card } from '../../components/shared/Card'; // Reusable Card component for layout

/**
 * LoginPage Component
 *
 * This component renders the login page where users can enter their email and password.
 * It handles form submission, calls the login function from Auth context, and navigates
 * to the intended page on successful login.
 */
const LoginPage = () => {
  // Local state for email, password, loading status, and error message.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Retrieve the login function from Auth context.
  const { login } = useAuth();
  // Hook to programmatically navigate to different routes.
  const navigate = useNavigate();
  // Retrieve current location; useful to redirect back after login.
  const location = useLocation();
  
  // Determine the redirection path after login.
  // If location state contains a "from" property, use it; otherwise, default to '/dashboard'.
  const from = (location.state as any)?.from || '/dashboard';
  
  /**
   * handleSubmit: Handles the form submission.
   *
   * - Prevents the default form submission behavior.
   * - Sets loading state and clears previous errors.
   * - Calls the login function from the Auth context.
   * - Navigates to the 'from' path on success.
   * - Catches and displays any errors from the login attempt.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Attempt to log in the user with the provided credentials.
      await login({ email, password });
      // On successful login, navigate to the original page or dashboard.
      navigate(from);
    } catch (err: any) {
      // Set error message based on API response, or use a default error message.
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      // Turn off the loading state regardless of the outcome.
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Card component wraps the login form for a styled container */}
      <Card className="max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-6">Sign in to your account</h1>
        
        {/* If an error occurred, display it here */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        
        {/* Login form */}
        <form onSubmit={handleSubmit}>
          {/* Email input field */}
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
          
          {/* Password input field */}
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
          
          {/* Link to the Forgot Password page */}
          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
          
          {/* Submit button using the Button component */}
          <Button
            variant="primary"
            className="w-full"
            isLoading={loading}
            type="submit"
          >
            Sign in
          </Button>
        </form>
        
        {/* Link to navigate to the registration page */}
        <div className="mt-4 text-center text-sm">
          <p>Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
