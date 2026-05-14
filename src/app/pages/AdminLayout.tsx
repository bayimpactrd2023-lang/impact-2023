import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { Toaster } from '@/app/components/ui/sonner';
import { AuthProvider } from '@/app/context/AuthContext';
import { ContentProvider } from '@/app/context/ContentContext';
import { HeaderThemeProvider } from '@/app/context/HeaderThemeContext';

// Minimal loading fallback for admin (production - no spinner)
const AdminLoader: React.FC = () => (
  <div className="min-h-screen bg-gray-50" />
);

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  // Don't show loading fallback for login page - it should appear immediately
  const isLoginPage = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <AuthProvider>
      <ContentProvider>
        <HeaderThemeProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {isLoginPage ? (
                <Outlet />
              ) : (
                <React.Suspense fallback={<AdminLoader />}>
                  <Outlet />
                </React.Suspense>
              )}
            </main>
            <ScrollToTop />
            <Toaster />
          </div>
        </HeaderThemeProvider>
      </ContentProvider>
    </AuthProvider>
  );
};