/**
 * Production-Ready Caching System
 * Reduces Supabase egress costs by implementing:
 * - Multi-layer caching (memory + localStorage)
 * - Stale-while-revalidate pattern
 * - Request deduplication
 * - Automatic cache invalidation
 * - Compression for large payloads
 */

import { LZString } from './compression';

// Debug flag - only log in development
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG_CACHE === 'true';
const log = DEBUG ? console.log : () => {};
const warn = DEBUG ? console.warn : () => {};

// Cache configuration
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh (default: true)
  compress?: boolean; // Compress data in localStorage (default: true for large data)
  maxSize?: number; // Max size in bytes before compression kicks in (default: 10KB)
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  compressed: boolean;
  version: string; // Cache version for invalidation
}

// In-memory cache for ultra-fast access during session
const memoryCache = new Map<string, CacheEntry<any>>();

// Pending requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<any>>();

// Cache version - increment this to invalidate all caches
const CACHE_VERSION = '1.0.0';

// Default configuration
const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true,
  compress: true,
  maxSize: 10 * 1024, // 10KB
};

/**
 * Generate a cache key from a function name and arguments
 */
export function generateCacheKey(prefix: string, ...args: unknown[]): string {
  const argsKey = args.length > 0 ? JSON.stringify(args) : '';
  return `cache:${prefix}:${argsKey}`;
}

/**
 * Check if cached data is still valid
 */
function isValid<T>(entry: CacheEntry<T>, ttl: number): boolean {
  if (entry.version !== CACHE_VERSION) return false;
  return Date.now() - entry.timestamp < ttl;
}

/**
 * Check if cached data is stale (expired but can be used temporarily)
 */
function isStale<T>(entry: CacheEntry<T>, ttl: number): boolean {
  if (entry.version !== CACHE_VERSION) return false;
  const age = Date.now() - entry.timestamp;
  // Consider stale if between TTL and 2x TTL
  return age >= ttl && age < ttl * 2;
}

/**
 * Get data from memory cache
 */
function getFromMemory<T>(key: string): CacheEntry<T> | null {
  return memoryCache.get(key) || null;
}

/**
 * Get data from localStorage
 */
function getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item) as CacheEntry<T>;

    // Decompress if needed
    if (parsed.compressed && typeof parsed.data === 'string') {
      const decompressed = LZString.decompress(parsed.data);
      parsed.data = decompressed ? JSON.parse(decompressed) : null;
      parsed.compressed = false;
    }

    return parsed;
  } catch (error) {
    // Corrupted cache data - remove it silently
    // Silently remove corrupted cache in production
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      // Ignore removal errors
    }
    return null;
  }
}

/**
 * Set data in memory cache
 */
function setInMemory<T>(key: string, entry: CacheEntry<T>): void {
  memoryCache.set(key, entry);
}

/**
 * Set data in localStorage
 */
function setInLocalStorage<T>(key: string, entry: CacheEntry<T>, config: Required<CacheConfig>): void {
  try {
    let dataToStore = entry.data;
    let compressed = false;

    // Compress if data is large
    if (config.compress) {
      const jsonStr = JSON.stringify(dataToStore);
      if (jsonStr.length > config.maxSize) {
        dataToStore = LZString.compress(jsonStr) as unknown as T;
        compressed = true;
      }
    }

    const entryToStore: CacheEntry<T> = {
      ...entry,
      data: dataToStore,
      compressed,
    };

    localStorage.setItem(key, JSON.stringify(entryToStore));
  } catch (error) {
    // localStorage might be full or disabled
    warn(`[Cache] Error writing to localStorage for key ${key}:`, error);

    // Try to free up space by clearing old entries
    try {
      clearOldEntries();
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (retryError) {
      warn('[Cache] Failed to write even after clearing old entries');
    }
  }
}

/**
 * Clear old/expired entries from localStorage
 */
function clearOldEntries(): void {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('cache:')) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item) as CacheEntry<any>;
          // Remove if older than 1 hour or wrong version
          if (now - parsed.timestamp > 60 * 60 * 1000 || parsed.version !== CACHE_VERSION) {
            keysToRemove.push(key);
          }
        }
      } catch (error) {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
    // Entry count logging removed for production
}

/**
 * Get cached data
 */
export function get<T>(key: string, config?: CacheConfig): T | null {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Try memory cache first (fastest)
  let entry = getFromMemory<T>(key);

  // Fall back to localStorage
  if (!entry) {
    entry = getFromLocalStorage<T>(key);
    // Promote to memory cache if found
    if (entry) {
      setInMemory(key, entry);
    }
  }

  if (!entry) return null;

  // Check validity
  if (isValid(entry, cfg.ttl)) {
    return entry.data;
  }

  // Return stale data if configured (will be revalidated in background)
  if (cfg.staleWhileRevalidate && isStale(entry, cfg.ttl)) {
    return entry.data;
  }

  // Data is too old
  return null;
}

/**
 * Set cached data
 */
export function set<T>(key: string, data: T, config?: CacheConfig): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    compressed: false,
    version: CACHE_VERSION,
  };

  // Set in both caches
  setInMemory(key, entry);
  setInLocalStorage(key, entry, cfg);
}

/**
 * Remove cached data
 */
export function remove(key: string): void {
  memoryCache.delete(key);
  try {
    localStorage.removeItem(key);
  } catch (error) {
    warn(`[Cache] Error removing from localStorage:`, error);
  }
}

/**
 * Clear all cached data
 */
export function clearAll(): void {
  memoryCache.clear();

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache:')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    // Cache cleared silently in production
  } catch (error) {
    warn('[Cache] Error clearing localStorage:', error);
  }
}

/**
 * Cached fetch wrapper with request deduplication
 * This is the main function to use for all API calls
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config?: CacheConfig
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Check cache first
  const cached = get<T>(key, cfg);
  const wasCached = cached !== null;

  // If we have valid cached data and stale-while-revalidate is disabled, return it
  if (cached && !cfg.staleWhileRevalidate) {
    return cached;
  }

  // Check if there's already a pending request for this key
  const pending = pendingRequests.get(key);
  if (pending) {
    log(`[Cache] Deduplicating request for ${key}`);
    return pending;
  }

  // If we have stale data, return it immediately while fetching fresh data in background
  if (cached && cfg.staleWhileRevalidate) {
    log(`[Cache] Returning stale data for ${key}, revalidating in background`);

    // Fetch fresh data in background (don't await)
    const backgroundFetch = fetchFn()
      .then(data => {
        set(key, data, cfg);
        pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        warn(`[Cache] Background revalidation failed for ${key}:`, error);
        pendingRequests.delete(key);
        return cached; // Return cached data on error
      });

    pendingRequests.set(key, backgroundFetch);
    return cached;
  }

  // No cache hit - fetch fresh data silently
  const fetchPromise = fetchFn()
    .then(data => {
      set(key, data, cfg);
      pendingRequests.delete(key);
      return data;
    })
    .catch(error => {
      pendingRequests.delete(key);

      // If fetch fails but we have stale data, return it
      if (wasCached) {
        warn(`[Cache] Fetch failed for ${key}, returning stale data:`, error);
        return cached;
      }

      throw error;
    });

  pendingRequests.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Prefetch data and store in cache
 */
export async function prefetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config?: CacheConfig
): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Don't prefetch if we already have valid data
  const cached = get<T>(key, cfg);
  if (cached) {
    return;
  }

  try {
    const data = await fetchFn();
    set(key, data, cfg);
  } catch (error) {
    warn(`[Cache] Prefetch failed for ${key}:`, error);
  }
}

/**
 * Invalidate cache entries by prefix
 */
export function invalidateByPrefix(prefix: string): void {
  // Clear from memory
  const keysToDelete: string[] = [];
  memoryCache.forEach((_, key) => {
    if (key.startsWith(`cache:${prefix}:`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => memoryCache.delete(key));

  // Clear from localStorage
  try {
    const lsKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`cache:${prefix}:`)) {
        lsKeysToRemove.push(key);
      }
    }
    lsKeysToRemove.forEach(key => localStorage.removeItem(key));
    log(`[Cache] Invalidated ${keysToDelete.length + lsKeysToRemove.length} entries`);
  } catch (error) {
    warn('[Cache] Error invalidating by prefix:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const memorySize = memoryCache.size;
  let localStorageSize = 0;
  let totalBytes = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache:')) {
        localStorageSize++;
        const item = localStorage.getItem(key);
        if (item) {
          totalBytes += item.length * 2; // Rough estimate (UTF-16)
        }
      }
    }
  } catch (error) {
    warn('[Cache] Error getting stats:', error);
  }

  return {
    memoryEntries: memorySize,
    localStorageEntries: localStorageSize,
    totalSizeKB: Math.round(totalBytes / 1024),
    pendingRequests: pendingRequests.size,
  };
}