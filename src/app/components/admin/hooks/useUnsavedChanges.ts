/**
 * Hook for detecting unsaved changes in forms
 * 
 * Tracks when form data has been modified and provides
 * utilities to check for unsaved changes before closing.
 */

import { useState, useEffect } from 'react';

export function useUnsavedChanges<T>(initialData: T | null) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<T | null>(initialData);

  // Reset when initial data changes (modal opens with new data)
  useEffect(() => {
    setOriginalData(initialData);
    setHasUnsavedChanges(false);
  }, [initialData]);

  /**
   * Mark that changes have been made
   */
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  /**
   * Mark changes as saved
   */
  const markAsSaved = () => {
    setHasUnsavedChanges(false);
  };

  /**
   * Check if the current data differs from the original
   */
  const checkForChanges = (currentData: T | null): boolean => {
    if (!originalData || !currentData) return false;
    
    // Deep comparison of objects
    return JSON.stringify(originalData) !== JSON.stringify(currentData);
  };

  return {
    hasUnsavedChanges,
    markAsChanged,
    markAsSaved,
    checkForChanges,
  };
}
