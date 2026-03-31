import React from 'react';
import { Outlet } from 'react-router';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { Toaster } from '@/app/components/ui/sonner';
import { AuthProvider } from '@/app/context/AuthContext';
import { ContentProvider, useContent } from '@/app/context/ContentContext';
import { HeaderThemeProvider } from '@/app/context/HeaderThemeContext';
import { DatabaseSetupNotice } from '@/app/components/DatabaseSetupNotice';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';

const LayoutContent: React.FC = () => {
  const { error } = useContent();
  
  return (
    <HeaderThemeProvider>
      <div className="min-h-screen flex flex-col overflow-x-hidden max-w-[100vw]">
        <DatabaseSetupNotice error={error} />
        <Header />
        <main className="flex-grow overflow-x-hidden w-full">
          <React.Suspense fallback={<PageSkeletonLoader />}>
            <Outlet />
          </React.Suspense>
        </main>
        <Footer />
        <ScrollToTop />
        <Toaster />
      </div>
    </HeaderThemeProvider>
  );
};

export const Layout: React.FC = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <LayoutContent />
      </ContentProvider>
    </AuthProvider>
  );
};