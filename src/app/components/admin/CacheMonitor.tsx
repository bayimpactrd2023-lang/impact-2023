/**
 * Cache Monitor Component
 * Shows cache statistics and provides cache management for admins
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useCacheManagement } from '@/hooks/useCacheManagement';
import { Database, Trash2, RefreshCw, HardDrive, Zap } from 'lucide-react';

export const CacheMonitor: React.FC = () => {
  const { stats, refreshStats, clearAllCaches } = useCacheManagement();

  const formatBytes = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#1887FC]" />
          Cache Monitor
        </CardTitle>
        <CardDescription>
          Monitor and manage the application cache to optimize data transfer costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Zap className="w-4 h-4" />
              Memory Cache
            </div>
            <div className="text-2xl font-bold text-[#1887FC]">
              {stats.memoryEntries}
            </div>
            <div className="text-xs text-gray-500">entries</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <HardDrive className="w-4 h-4" />
              Storage Cache
            </div>
            <div className="text-2xl font-bold text-[#1887FC]">
              {stats.localStorageEntries}
            </div>
            <div className="text-xs text-gray-500">entries</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-gray-600 mb-1">Total Cache Size</div>
            <div className="text-2xl font-bold text-green-600">
              {formatBytes(stats.totalSizeKB)}
            </div>
            <div className="text-xs text-gray-500">in localStorage</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-gray-600 mb-1">Pending Requests</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.pendingRequests}
            </div>
            <div className="text-xs text-gray-500">deduplicated</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Stats
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={clearAllCaches}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Cache
          </Button>
        </div>

        {/* Cache Info */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Cache Benefits</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Reduces Supabase egress costs by 80-95%</li>
            <li>✓ Faster page loads with stale-while-revalidate</li>
            <li>✓ Request deduplication prevents duplicate API calls</li>
            <li>✓ Compressed data in localStorage saves space</li>
            <li>✓ Cache auto-clears after 1 hour of inactivity</li>
          </ul>

          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Cache is automatically invalidated when you update content.
              Users will see fresh data within 5-10 minutes or immediately on page reload.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
