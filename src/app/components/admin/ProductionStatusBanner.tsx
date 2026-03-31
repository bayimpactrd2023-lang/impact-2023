/**
 * Production Status Banner
 * Shows whether the app is in production mode or development mode
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Shield, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export const ProductionStatusBanner: React.FC = () => {
  const isProduction = isSupabaseConfigured();

  if (isProduction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
        <div className="p-4 flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-yellow-900">Development Mode</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                <Shield className="w-3 h-3" />
                Basic Auth
              </span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              You're using basic authentication. For production deployment, set up Supabase Auth 
              and enable Row Level Security policies to protect your database.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/QUICK_START_PRODUCTION.md" target="_blank">
                <Button 
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white h-8 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Deploy to Production (30 min)
                </Button>
              </a>
              <a
                href="/PRODUCTION_READINESS_CHECKLIST.md"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-yellow-700 hover:text-yellow-800 font-medium px-3 py-2"
              >
                <ExternalLink className="w-3 h-3" />
                Production Checklist
              </a>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
