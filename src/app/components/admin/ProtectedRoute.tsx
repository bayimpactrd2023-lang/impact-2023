/**
 * Protected Route Component
 * Ensures only authenticated admin users can access admin routes
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSkeletonLoader message="Authenticating..." />;
  }

  if (!user || !isAdmin) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
