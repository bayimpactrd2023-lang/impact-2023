/**
 * Cache Management Hook
 * Provides utilities for monitoring and managing cache
 */

import { useEffect, useState, useCallback } from 'react';
import { getCacheStats, clearAll } from '@/utils/cache';
import { invalidateAllCaches, invalidateCache } from '@/services/optimizedSupabaseService';

export function useCacheManagement() {
  const [stats, setStats] = useState({
    memoryEntries: 0,
    localStorageEntries: 0,
    totalSizeKB: 0,
    pendingRequests: 0,
  });

  const refreshStats = useCallback(() => {
    setStats(getCacheStats());
  }, []);

  useEffect(() => {
    refreshStats();

    // Refresh stats every 10 seconds
    const interval = setInterval(refreshStats, 10000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  const clearAllCaches = useCallback(() => {
    clearAll();
    invalidateAllCaches();
    refreshStats();
  }, [refreshStats]);

  const invalidateSpecificCache = useCallback((type: string) => {
    invalidateCache(type);
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearAllCaches,
    invalidateSpecificCache,
  };
}
