import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { Footer } from '@/app/components/Footer';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { Toaster } from '@/app/components/ui/sonner';
import { AuthProvider } from '@/app/context/AuthContext';
import { ContentProvider } from '@/app/context/ContentContext';
import { HeaderThemeProvider } from '@/app/context/HeaderThemeContext';

// Loading fallback for admin
const AdminLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1887FC]"></div>
      <p className="mt-4 text-gray-600">Loading Admin Panel...</p>
    </div>
  </div>
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