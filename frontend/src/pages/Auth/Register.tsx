// frontend/src/pages/Auth/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Hook to access authentication methods
import Button from '../../components/shared/Button'; // Reusable Button component
import { Card } from '../../components/shared/Card';   // Reusable Card component for layout

/**
 * RegisterPage Component
 *
 * This component renders the registration form for creating a new account.
 * It manages local state for email, password, name, and confirmation password,
 * validates that the passwords match, and calls the register method from the Auth context.
 * On successful registration, it navigates the user to the dashboard.
 */
const RegisterPage = () => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for tracking loading state and error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Access the register function from the Auth context
  const { register } = useAuth();
  // Hook to navigate programmatically after successful registration
  const navigate = useNavigate();
  
  /**
   * handleSubmit: Handles the registration form submission.
   *
   * - Prevents default form submission behavior.
   * - Validates that the password and confirmPassword fields match.
   * - Sets loading state, clears previous errors, and calls the register API.
   * - On success, navigates the user to the dashboard.
   * - On failure, displays an error message.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check if password and confirm password match.
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Attempt to register the user with provided email, password, and name.
      await register({ email, password, name });
      // On successful registration, navigate to the dashboard.
      navigate('/dashboard');
    } catch (err: any) {
      // Set error message based on API response or default message.
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Use Card component to wrap the registration form */}
      <Card className="max-w-md w-full">
        <h1 className="text-center text-2xl font-bold mb-6">Create your account</h1>
        
        {/* Display error message if present */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        
        {/* Registration form */}
        <form onSubmit={handleSubmit}>
          {/* Email field */}
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
          
          {/* Optional Name field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          {/* Password field */}
          <div className="mb-4">
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
              minLength={8}
            />
          </div>
          
          {/* Confirm Password field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
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
          
          {/* Submit button */}
          <Button
            variant="primary"
            className="w-full"
            isLoading={loading}
            type="submit"
          >
            Create Account
          </Button>
        </form>
        
        {/* Link to navigate to the login page if the user already has an account */}
        <div className="mt-4 text-center text-sm">
          <p>Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
