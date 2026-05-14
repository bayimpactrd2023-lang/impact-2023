/**
 * Cache Invalidation Utilities
 * Call these after admin updates to ensure users see fresh data
 */

import { invalidateCache, invalidateAllCaches } from '@/services/optimizedSupabaseService';

// Debug flag - only log in development
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG_CACHE === 'true';

/**
 * Invalidate cache after news operations
 */
export const invalidateNewsCache = () => {
  invalidateCache('news');
  DEBUG && console.log('[CacheInvalidation] News cache invalidated');
};

/**
 * Invalidate cache after highlights operations
 */
export const invalidateHighlightsCache = () => {
  invalidateCache('highlights');
  DEBUG && console.log('[CacheInvalidation] Highlights cache invalidated');
};

/**
 * Invalidate cache after publications operations
 */
export const invalidatePublicationsCache = () => {
  invalidateCache('publications');
  DEBUG && console.log('[CacheInvalidation] Publications cache invalidated');
};

/**
 * Invalidate cache after partners operations
 */
export const invalidatePartnersCache = () => {
  invalidateCache('partners');
  DEBUG && console.log('[CacheInvalidation] Partners cache invalidated');
};

/**
 * Invalidate cache after team operations
 */
export const invalidateTeamCache = () => {
  invalidateCache('team');
  DEBUG && console.log('[CacheInvalidation] Team cache invalidated');
};

/**
 * Invalidate cache after blog operations
 */
export const invalidateBlogCache = () => {
  invalidateCache('blog');
  DEBUG && console.log('[CacheInvalidation] Blog cache invalidated');
};

/**
 * Invalidate cache after project operations
 */
export const invalidateProjectsCache = () => {
  invalidateCache('projects');
  DEBUG && console.log('[CacheInvalidation] Projects cache invalidated');
};

/**
 * Invalidate cache after financial statements operations
 */
export const invalidateFinancialCache = () => {
  invalidateCache('financial');
  DEBUG && console.log('[CacheInvalidation] Financial statements cache invalidated');
};

/**
 * Invalidate cache after testimonial operations
 */
export const invalidateTestimonialsCache = () => {
  invalidateCache('testimonials');
  DEBUG && console.log('[CacheInvalidation] Testimonials cache invalidated');
};

/**
 * Invalidate cache after hero operations
 */
export const invalidateHeroCache = () => {
  invalidateCache('hero');
  DEBUG && console.log('[CacheInvalidation] Hero cache invalidated');
};

/**
 * Invalidate cache after about operations
 */
export const invalidateAboutCache = () => {
  invalidateCache('about');
  DEBUG && console.log('[CacheInvalidation] About cache invalidated');
};

/**
 * Invalidate all caches (use when making broad changes)
 */
export const invalidateAll = () => {
  invalidateAllCaches();
  DEBUG && console.log('[CacheInvalidation] All caches invalidated');
};

/**
 * Auto-invalidation wrapper for admin operations
 * Wraps an async function and invalidates cache on success
 */
export async function withCacheInvalidation<T>(
  operation: () => Promise<T>,
  cacheType: 'news' | 'highlights' | 'publications' | 'partners' | 'team' | 'blog' | 'projects' | 'financial' | 'testimonials' | 'hero' | 'about' | 'all'
): Promise<T> {
  const result = await operation();

  // Invalidate cache after successful operation
  switch (cacheType) {
    case 'news':
      invalidateNewsCache();
      break;
    case 'highlights':
      invalidateHighlightsCache();
      break;
    case 'publications':
      invalidatePublicationsCache();
      break;
    case 'partners':
      invalidatePartnersCache();
      break;
    case 'team':
      invalidateTeamCache();
      break;
    case 'blog':
      invalidateBlogCache();
      break;
    case 'projects':
      invalidateProjectsCache();
      break;
    case 'financial':
      invalidateFinancialCache();
      break;
    case 'testimonials':
      invalidateTestimonialsCache();
      break;
    case 'hero':
      invalidateHeroCache();
      break;
    case 'about':
      invalidateAboutCache();
      break;
    case 'all':
      invalidateAll();
      break;
  }

  return result;
}
