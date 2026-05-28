/**
 * Page Skeleton Loader
 * 
 * Provides skeleton loading states for public-facing pages
 */

import React from 'react';
import { Skeleton } from '@/app/components/ui/skeleton';

interface PageSkeletonLoaderProps {
  message?: string;
}

/**
 * Full page skeleton loader for public pages
 */
export const PageSkeletonLoader: React.FC<PageSkeletonLoaderProps> = ({ 
  message = 'Loading content...' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      {/* Hero Section Skeleton */}
      <div className="relative h-[400px] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-96 mx-auto bg-white/30" />
            <Skeleton className="h-6 w-64 mx-auto bg-white/20" />
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Section Title */}
          <div className="text-center space-y-3">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          {/* Grid of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <p className="text-center mt-8 text-sm text-gray-500 animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Simple inline skeleton loader
 */
export const InlineSkeletonLoader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        
        <div className="flex justify-center gap-2 pt-4">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
      </div>
      
      {message && (
        <p className="mt-6 text-sm text-gray-500 text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
