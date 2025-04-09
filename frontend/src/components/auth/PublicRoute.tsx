// src/components/auth/PublicRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute: React.FC = () => {
  // Retrieve the authentication status from the Auth context.
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, redirect them to the dashboard.
  // The "replace" prop prevents adding a new entry to the browser's history stack.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If the user is not authenticated, render the child routes.
  return <Outlet />;
};

export default PublicRoute;
