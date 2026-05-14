/**
 * Database Refresh Utilities
 * Helper functions to ensure immediate data refresh after CRUD operations
 */

import { toast } from 'sonner';

/**
 * Wrapper for CRUD operations that ensures database refresh
 */
export async function withDbRefresh<T>(
  operation: () => Promise<T>,
  refreshFn: () => Promise<void>,
  successMessage: string
): Promise<T | null> {
  try {
    const result = await operation();
    
    // Immediate refresh from database
    await refreshFn();
    
    toast.success(successMessage);
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    toast.error('Operation failed. Please try again.');
    throw error;
  }
}

/**
 * Retry mechanism for database refresh
 */
export async function retryRefresh(
  refreshFn: () => Promise<void>,
  maxRetries: number = 3,
  delay: number = 500
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await refreshFn();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
