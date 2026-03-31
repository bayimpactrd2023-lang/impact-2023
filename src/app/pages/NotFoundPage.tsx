import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-[#1887FC] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};
