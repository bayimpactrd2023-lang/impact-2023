import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';

/**
 * AdminPage Component (Legacy)
 * 
 * This component is now deprecated and redirects to the appropriate page:
 * - Authenticated users → /admin/dashboard
 * - Unauthenticated users → /admin (login page)
 * 
 * Use AdminLoginPage and AdminDashboardPage directly instead.
 */
export const AdminPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1887FC]"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};
