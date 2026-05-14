import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, useRouteError } from 'react-router';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const error = useRouteError() as Error;

  console.error('Route error:', error);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mb-6">
          <AlertTriangle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          We encountered an unexpected error. This might be a temporary issue.
        </p>

        {error?.message && (
          <div className="bg-white border border-red-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm font-mono text-red-700">{error.message}</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')} className="bg-[#1887FC] hover:bg-[#0b5ab8]">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          If this problem persists, please contact support.
        </p>
      </motion.div>
    </div>
  );
};
