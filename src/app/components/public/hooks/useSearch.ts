/**
 * Search Hook
 * 
 * Generic hook for managing search functionality.
 * Implements debouncing for performance.
 */

import { useState, useMemo, useEffect } from 'react';

export interface UseSearchProps<T> {
  /** Items to search through */
  items: T[];
  
  /** Search function - returns true if item matches */
  searchFn: (item: T, query: string) => boolean;
  
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

export interface UseSearchReturn<T> {
  /** Current search query */
  searchQuery: string;
  
  /** Set search query */
  setSearchQuery: (query: string) => void;
  
  /** Debounced search query */
  debouncedQuery: string;
  
  /** Filtered items based on search */
  searchResults: T[];
  
  /** Clear search */
  clearSearch: () => void;
  
  /** Whether search is active */
  isSearching: boolean;
}

/**
 * Hook for managing search with debouncing
 * 
 * @template T - Type of items being searched
 * @param props - Search configuration
 * @returns Search state and controls
 */
export function useSearch<T>({
  items,
  searchFn,
  debounceMs = 300,
}: UseSearchProps<T>): UseSearchReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  /**
   * Debounce search query
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  /**
   * Filter items based on debounced query
   */
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }
    return items.filter(item => searchFn(item, debouncedQuery));
  }, [items, debouncedQuery, searchFn]);

  /**
   * Clear search query
   */
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchResults,
    clearSearch,
    isSearching: !!debouncedQuery.trim(),
  };
}
