/**
 * Filter Hook
 * 
 * Generic hook for managing filter state and logic.
 * Reusable across all pages that need filtering.
 */

import { useState, useMemo } from 'react';

export interface UseFilterProps<T> {
  /** Initial items to filter */
  items: T[];
  
  /** Filter function */
  filterFn: (item: T, filterValue: string) => boolean;
  
  /** Initial filter value */
  initialFilter?: string;
}

export interface UseFilterReturn<T> {
  /** Current filter value */
  filterValue: string;
  
  /** Set filter value */
  setFilterValue: (value: string) => void;
  
  /** Filtered items */
  filteredItems: T[];
  
  /** Clear filter */
  clearFilter: () => void;
}

/**
 * Hook for managing filtering
 * 
 * @template T - Type of items being filtered
 * @param props - Filter configuration
 * @returns Filter state and controls
 */
export function useFilter<T>({
  items,
  filterFn,
  initialFilter = 'all',
}: UseFilterProps<T>): UseFilterReturn<T> {
  const [filterValue, setFilterValue] = useState(initialFilter);

  /**
   * Apply filter to items
   */
  const filteredItems = useMemo(() => {
    if (filterValue === 'all' || !filterValue) {
      return items;
    }
    return items.filter(item => filterFn(item, filterValue));
  }, [items, filterValue, filterFn]);

  /**
   * Clear filter (reset to 'all')
   */
  const clearFilter = () => {
    setFilterValue('all');
  };

  return {
    filterValue,
    setFilterValue,
    filteredItems,
    clearFilter,
  };
}
