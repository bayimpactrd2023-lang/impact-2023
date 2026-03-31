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
    <Card className="overflow-hidden">
      {/* Image placeholder - matches the card image structure */}
      <Skeleton className="w-full h-48 rounded-t-lg rounded-b-none" />
      
      {/* Content placeholder */}
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
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