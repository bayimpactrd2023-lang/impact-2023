import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for managing Quick Action save operations
 * Prevents multiple submissions and detects unchanged data
 */
export function useQuickActionSave<T>() {
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<T | null>(null);

  /**
   * Store the original data when editing starts
   */
  const storeOriginal = useCallback((data: T) => {
    setOriginalData(JSON.parse(JSON.stringify(data)));
  }, []);

  /**
   * Check if data has changed
   */
  const hasChanges = useCallback((currentData: T): boolean => {
    if (!originalData) return true;
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  }, [originalData]);

  /**
   * Wrap a save function with loading state and change detection
   */
  const withSaveProtection = useCallback(
    async (currentData: T, saveFunction: () => Promise<void>, options?: { skipChangeCheck?: boolean }) => {
      // Prevent multiple submissions
      if (isSaving) {
        return false;
      }

      // Check for changes (unless skipped for new items)
      if (!options?.skipChangeCheck && !hasChanges(currentData)) {
        toast.info('No changes made', {
          description: 'There are no changes to save.',
        });
        return false;
      }

      setIsSaving(true);
      try {
        await saveFunction();
        return true;
      } catch (error) {
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, hasChanges]
  );

  return {
    isSaving,
    storeOriginal,
    hasChanges,
    withSaveProtection,
  };
}
