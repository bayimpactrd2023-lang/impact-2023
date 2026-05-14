/**
 * RLS Error Alert Component
 * Shows when Row Level Security errors are detected
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { ShieldAlert, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface RLSErrorAlertProps {
  error?: any;
  onDismiss?: () => void;
}

export const RLSErrorAlert: React.FC<RLSErrorAlertProps> = ({ error, onDismiss }) => {
  // Check if error is RLS related
  const isRLSError = error?.code === '42501' || 
                     error?.message?.includes('row-level security') ||
                     error?.message?.includes('RLS');

  if (!isRLSError) return null;

  const copyFix = () => {
    const fixSQL = `-- Quick Fix: Disable RLS on all tables
ALTER TABLE hero_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;
ALTER TABLE highlights DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE publications DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;`;

    navigator.clipboard.writeText(fixSQL);
    toast.success('SQL fix copied to clipboard!');
  };

  return (
    <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50">
      <ShieldAlert className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">Row Level Security Error Detected</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">
          Your database operations are being blocked by Row Level Security (RLS) policies.
          This prevents creating, updating, or deleting content.
        </p>

        <div className="bg-red-100 p-3 rounded border border-red-200 font-mono text-xs">
          <strong>Error:</strong> {error?.message || 'new row violates row-level security policy'}
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-sm">Quick Fix (Choose one):</p>
          
          {/* Option 1: Run SQL */}
          <div className="bg-white p-3 rounded border border-red-200">
            <p className="text-sm font-medium mb-2">Option 1: Run SQL in Supabase</p>
            <ol className="text-xs space-y-1 list-decimal ml-4">
              <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
              <li>Open <strong>SQL Editor</strong></li>
              <li>Copy and run the SQL fix below</li>
            </ol>
            <div className="mt-2 flex gap-2">
              <Button
                onClick={copyFix}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy SQL Fix
              </Button>
              <Button
                onClick={() => window.open('/database_rls_policies_fixed.sql', '_blank')}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Full Script
              </Button>
            </div>
          </div>

          {/* Option 2: Use file */}
          <div className="bg-white p-3 rounded border border-red-200">
            <p className="text-sm font-medium mb-2">Option 2: Use Fixed Policy File</p>
            <ol className="text-xs space-y-1 list-decimal ml-4">
              <li>Open <code className="bg-gray-100 px-1 rounded">/database_rls_policies_fixed.sql</code></li>
              <li>Copy the entire file contents</li>
              <li>Paste in Supabase SQL Editor</li>
              <li>Click <strong>Run</strong></li>
            </ol>
            <div className="mt-2">
              <Button
                onClick={() => window.open('/FIX_RLS_ERROR.md', '_blank')}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Full Instructions
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded border border-yellow-300 text-xs">
          <strong>⚠️ Note:</strong> This fix disables RLS for development. 
          For production, see <code>/FIX_RLS_ERROR.md</code> for proper security setup.
        </div>

        {onDismiss && (
          <div className="flex justify-end">
            <Button
              onClick={onDismiss}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              Dismiss
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
