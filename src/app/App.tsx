import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from '@/app/routes';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { initSentry } from '@/lib/sentry';

// Initialize Sentry error monitoring in production
initSentry();

// Main App Component
// Featured highlights and publications functionality fully implemented
// Database migration required: Run /supabase-migration-add-featured-to-highlights.sql
function App() {
  useEffect(() => {
    // Clear any corrupted cache entries on startup
    try {
      const cacheKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache:')) {
          cacheKeys.push(key);
        }
      }
      
      // Test and remove corrupted entries
      cacheKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            JSON.parse(item); // Will throw if corrupted
          }
        } catch (error) {
          console.debug(`[App] Removing corrupted cache: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.debug('[App] Cache cleanup failed:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;