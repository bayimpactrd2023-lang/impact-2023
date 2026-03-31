import React from 'react';
import { motion } from 'motion/react';

interface AdminSkeletonLoaderProps {
  section?: string;
}

export const AdminSkeletonLoader: React.FC<AdminSkeletonLoaderProps> = ({ 
  section = 'content' 
}) => {
  return (
    <div className="w-full space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 animate-pulse" />
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex gap-3">
        <div className="h-10 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg w-32 animate-pulse" />
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-32 animate-pulse" />
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-xl p-6 space-y-4 bg-white"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-5/6 animate-pulse" />
              </div>
              <div className="flex gap-2 ml-4">
                <div className="h-9 w-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
                <div className="h-9 w-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Card Content */}
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 animate-pulse" />
            </div>

            {/* Card Footer */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="h-8 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg w-24 animate-pulse" />
              <div className="h-8 bg-gradient-to-r from-red-200 via-red-100 to-red-200 rounded-lg w-24 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-10 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg animate-pulse" />
        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Floating Shimmer Effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(24, 135, 252, 0.03), transparent)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

// Compact version for smaller sections
export const AdminSkeletonLoaderCompact: React.FC<AdminSkeletonLoaderProps> = ({ 
  section = 'content' 
}) => {
  return (
    <div className="w-full space-y-4 p-4">
      <div className="space-y-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.08 }}
            className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white"
          >
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5 animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Form skeleton for edit dialogs
export const AdminFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 animate-pulse" />
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-full animate-pulse" />
        </div>
      ))}
      
      <div className="flex gap-3 pt-4">
        <div className="h-10 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg w-24 animate-pulse" />
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-24 animate-pulse" />
      </div>
    </div>
  );
};
