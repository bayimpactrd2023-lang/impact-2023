/**
 * Pagination Hook
 * 
 * Generic hook for managing pagination state and logic.
 * Reusable across all pages that need pagination.
 */

import { useState, useMemo } from 'react';

export interface UsePaginationProps {
  /** Total number of items */
  totalItems: number;
  
  /** Items per page */
  itemsPerPage?: number;
  
  /** Initial page (default: 1) */
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  /** Current page number (1-indexed) */
  currentPage: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Navigate to specific page */
  goToPage: (page: number) => void;
  
  /** Go to next page */
  nextPage: () => void;
  
  /** Go to previous page */
  previousPage: () => void;
  
  /** Get paginated items from array */
  getPaginatedItems: (items: T[]) => T[];
  
  /** Check if on first page */
  isFirstPage: boolean;
  
  /** Check if on last page */
  isLastPage: boolean;
}

/**
 * Hook for managing pagination
 * 
 * @template T - Type of items being paginated
 * @param props - Pagination configuration
 * @returns Pagination state and controls
 */
export function usePagination<T>({
  totalItems,
  itemsPerPage = 12,
  initialPage = 1,
}: UsePaginationProps): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  /**
   * Calculate total pages based on items and page size
   */
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  /**
   * Navigate to specific page (with bounds checking)
   */
  const goToPage = (page: number) => {
    const validPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(validPage);
  };

  /**
   * Navigate to next page
   */
  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  /**
   * Navigate to previous page
   */
  const previousPage = () => {
    goToPage(currentPage - 1);
  };

  /**
   * Get paginated subset of items
   */
  const getPaginatedItems = (items: T[]): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    getPaginatedItems,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}
