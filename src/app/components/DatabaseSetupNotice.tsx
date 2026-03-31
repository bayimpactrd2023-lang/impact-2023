import React, { useState } from 'react';
import { AlertCircle, Database, FileCode, Wifi, WifiOff, X } from 'lucide-react';

interface DatabaseSetupNoticeProps {
  error: string | null;
}

export const DatabaseSetupNotice: React.FC<DatabaseSetupNoticeProps> = ({ error }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Don't show if no error or dismissed
  if (!error || isDismissed) return null;

  // Check if it's a connection error vs table error
  const isConnectionError = error.toLowerCase().includes('connection') || 
                           error.toLowerCase().includes('fetch') ||
                           error.toLowerCase().includes('network');
  const isTableError = error.includes('Database tables') || error.includes('database tables');

  // Don't show if it's not one of our known errors
  if (!isConnectionError && !isTableError) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-white shadow-lg ${
      isConnectionError 
        ? 'bg-gradient-to-r from-red-600 to-pink-600' 
        : 'bg-gradient-to-r from-orange-500 to-red-500'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          {isConnectionError ? (
            <WifiOff className="w-6 h-6 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {isConnectionError ? (
              <>
                <h3 className="font-bold text-lg mb-1">Supabase Connection Error</h3>
                <p className="text-sm mb-3">
                  Unable to connect to your Supabase project. Please check:
                </p>
                <ol className="text-sm space-y-2 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Your Supabase project is <strong>active and running</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>You have a <strong>stable internet connection</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>
                      Credentials in <code className="bg-white/20 px-1.5 py-0.5 rounded">/utils/supabase/info.tsx</code> are <strong>correct</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Your Supabase project hasn't been <strong>paused due to inactivity</strong></span>
                  </li>
                </ol>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
                  >
                    <Database className="w-4 h-4" />
                    Open Supabase Dashboard
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors text-sm"
                  >
                    <Wifi className="w-4 h-4" />
                    Retry Connection
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-1">Database Setup Required</h3>
                <p className="text-sm mb-3">
                  The database tables haven't been created yet. Follow these steps to set up your database:
                </p>
                <ol className="text-sm space-y-2 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>
                      Open <code className="bg-white/20 px-1.5 py-0.5 rounded">/database_schema.sql</code> in your code editor
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Go to your Supabase Dashboard → <strong>SQL Editor</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Click <strong>"New Query"</strong> and paste the entire SQL file</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Click <strong>"Run"</strong> to create all tables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">5.</span>
                    <span>Refresh this page</span>
                  </li>
                </ol>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/SECURITY_SETUP_GUIDE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
                  >
                    <FileCode className="w-4 h-4" />
                    View Setup Guide
                  </a>
                  <a
                    href="/database_schema.sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors text-sm"
                  >
                    <Database className="w-4 h-4" />
                    View SQL Schema
                  </a>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};