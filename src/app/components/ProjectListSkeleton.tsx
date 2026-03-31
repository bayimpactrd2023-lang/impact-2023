import React from 'react';

export const ProjectListSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section Skeleton */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-blue-200 animate-pulse">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="h-12 bg-white/30 rounded-lg w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-white/20 rounded-lg w-1/2 mx-auto"></div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden p-6 animate-pulse">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-64 flex-shrink-0">
                    <div className="w-full h-48 md:h-40 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
