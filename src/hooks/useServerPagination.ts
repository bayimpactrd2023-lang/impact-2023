import { useState, useEffect, useCallback, useRef } from 'react';

export interface ServerPaginationOptions<T> {
  fetchFunction: (page: number, itemsPerPage: number) => Promise<{
    data: T[];
    totalCount: number;
    page: number;
    itemsPerPage: number;
    totalPages: number;
  }>;
  itemsPerPage?: number;
  initialPage?: number;
}

export interface ServerPaginationResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  loading: boolean;
  error: Error | null;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  startIndex: number;
  endIndex: number;
  refresh: () => Promise<void>;
  // Alias for backwards compatibility
  paginatedItems: T[];
}

export function useServerPagination<T>({
  fetchFunction,
  itemsPerPage = 9,
  initialPage = 1,
}: ServerPaginationOptions<T>): ServerPaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track active request to prevent duplicates
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestedPageRef = useRef<number | null>(null);
  const isRequestActiveRef = useRef(false);

  const fetchData = useCallback(async (page: number) => {
    // Prevent duplicate requests for the same page
    if (isRequestActiveRef.current && lastRequestedPageRef.current === page) {
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    lastRequestedPageRef.current = page;
    isRequestActiveRef.current = true;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFunction(page, itemsPerPage);
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      setData(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalCount);
      setCurrentPage(response.page);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('[Pagination] Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      setData([]);
    } finally {
      // Only clear loading if this is still the active request
      if (!abortController.signal.aborted) {
        setLoading(false);
        isRequestActiveRef.current = false;
      }
    }
  }, [fetchFunction, itemsPerPage]);

  // Initial fetch
  useEffect(() => {
    fetchData(currentPage);

    // Cleanup: abort any pending requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const goToPage = useCallback((page: number) => {
    // Don't allow navigation if already loading
    if (loading) {
      console.log('[Pagination] Already loading, ignoring navigation request');
      return;
    }

    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchData(page);
    } else {
      console.log('[Pagination] Invalid page or same page requested');
    }
  }, [totalPages, currentPage, loading, fetchData]);

  const nextPage = useCallback(() => {
    if (loading) {
      console.log('[Pagination] Already loading, ignoring next page request');
      return;
    }

    if (currentPage < totalPages) {
      fetchData(currentPage + 1);
    }
  }, [currentPage, totalPages, loading, fetchData]);

  const prevPage = useCallback(() => {
    if (loading) {
      console.log('[Pagination] Already loading, ignoring previous page request');
      return;
    }

    if (currentPage > 1) {
      fetchData(currentPage - 1);
    }
  }, [currentPage, loading, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(currentPage);
  }, [currentPage, fetchData]);

  const canGoNext = currentPage < totalPages && !loading;
  const canGoPrev = currentPage > 1 && !loading;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    data,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
    refresh,
    // Alias for backwards compatibility
    paginatedItems: data,
  };
}