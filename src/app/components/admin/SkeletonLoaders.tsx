/**
 * Skeleton Loading Components for Admin Panel
 * 
 * Provides skeleton loading states that match admin panel layouts
 * Updated: 2026-03-20
 */

import React from 'react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Card, CardContent } from '@/app/components/ui/card';

/**
 * Card Skeleton - Matches the structure of admin content cards
 */
export const AdminCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      {/* Image placeholder - matches the card image structure */}
      <Skeleton className="w-full h-48 rounded-t-lg rounded-b-none bg-blue-50/50" />
      
      {/* Content placeholder */}
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-gray-100" />
        <Skeleton className="h-4 w-full bg-gray-100" />
        <Skeleton className="h-4 w-5/6 bg-gray-100" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-3 w-3 rounded-full bg-blue-100" />
          <Skeleton className="h-3 w-20 bg-blue-50" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Grid Skeleton - Shows a grid of skeleton cards
 */
export const AdminGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AdminCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Table Row Skeleton - For table-based admin sections
 */
export const AdminTableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <Skeleton className="h-12 w-12 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
};

/**
 * Table Skeleton - Multiple table rows
 */
export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <AdminTableRowSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Modal Content Skeleton - For loading states in modals
 */
export const AdminModalSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-3/4 mb-6" />
      
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

/**
 * Full Page Loading Skeleton - For initial page load
 */
export const AdminPageSkeleton: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-gray-100/50 shadow-sm backdrop-blur-sm">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative flex flex-col items-center gap-6 w-full max-w-md">
          {/* Main skeleton bars */}
          <div className="w-64 h-10 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 rounded-2xl animate-pulse" />
          <div className="w-48 h-6 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl animate-pulse" />
          
          {/* Pulsing dots */}
          <div className="flex justify-center gap-3 pt-2">
            <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="h-3 w-3 bg-blue-400/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="h-3 w-3 bg-blue-400/30 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
      
      {message && (
        <p className="text-base font-semibold text-blue-600/80 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

/**
 * Inline Loading Skeleton - Small inline loading indicator
 */
export const AdminInlineSkeleton: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Skeleton className="h-6 w-6 rounded-full" />
      {message && (
        <Skeleton className="h-4 w-32" />
      )}
    </div>
  );
};

/**
 * List Item Skeleton - For list views
 */
export const AdminListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <Skeleton className="h-16 w-16 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
};

/**
 * List Skeleton - Multiple list items
 */
export const AdminListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <AdminListItemSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Form Skeleton - For form loading states
 */
export const AdminFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Title field */}
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Description field */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      {/* Two column fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      {/* Image upload */}
      <div>
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Dashboard Stats Skeleton
 */
export const AdminStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
};