/**
 * Protected Route Component
 * Ensures only authenticated admin users can access admin routes
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Production: Don't show loading spinner - auth check happens in background
  // If not authenticated, redirect to login
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
