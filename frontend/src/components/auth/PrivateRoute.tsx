import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../shared/Spinner';

const PrivateRoute = () => {
  // Get authentication status and loading state from the Auth context.
  const { isAuthenticated, loading } = useAuth();
  // Get the current location to redirect back after login.
  const location = useLocation();

  // While authentication status is loading, display a spinner.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // If the user is not authenticated, redirect them to the login page.
  // The current location is passed in state for redirection after successful login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes using Outlet.
  return <Outlet />;
};

export default PrivateRoute;
