import { useState, useCallback, useEffect } from 'react';
import { CursorPaginationResponse } from '@/services/supabaseService';

export interface UseCursorPaginationOptions<T> {
  fetchFunction: (cursor: string | null, limit: number, direction: 'next' | 'prev') => Promise<CursorPaginationResponse<T>>;
  itemsPerPage?: number;
  autoFetch?: boolean; // Whether to fetch on mount
}

export interface UseCursorPaginationResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  loadNext: () => Promise<void>;
  loadPrev: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
  canLoadNext: boolean;
  canLoadPrev: boolean;
  currentPage: number;
  pageNumbers: number[];
  // Aliases for compatibility
  paginatedItems: T[];
  totalPages: number;
  totalItems: number;
}

export function useCursorPagination<T>({
  fetchFunction,
  itemsPerPage = 6,
  autoFetch = true,
}: UseCursorPaginationOptions<T>): UseCursorPaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPageReached, setMaxPageReached] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<Map<number, string | null>>(new Map([[1, null]]));
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchData = useCallback(async (cursor: string | null, direction: 'next' | 'prev' = 'next', targetPage?: number) => {
    // Prevent duplicate fetches
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction(cursor, itemsPerPage, direction);
      setData(response.data);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      setPrevCursor(response.prevCursor);
      setCurrentCursor(cursor);
      
      // Update page number
      if (targetPage !== undefined) {
        setCurrentPage(targetPage);
        if (targetPage > maxPageReached) {
          setMaxPageReached(targetPage);
        }
      } else if (direction === 'next' && cursor !== null) {
        setCurrentPage(prev => {
          const newPage = prev + 1;
          setMaxPageReached(max => Math.max(max, newPage));
          return newPage;
        });
      } else if (direction === 'prev' && cursor !== null) {
        setCurrentPage(prev => Math.max(1, prev - 1));
      } else if (cursor === null) {
        setCurrentPage(1); // Reset to first page
        setMaxPageReached(1);
      }

      // Store cursor for this page
      if (response.nextCursor && direction === 'next') {
        setCursorHistory(prev => {
          const newMap = new Map(prev);
          const nextPageNum = targetPage !== undefined ? targetPage + 1 : (cursor === null ? 2 : currentPage + 1);
          newMap.set(nextPageNum, response.nextCursor);
          return newMap;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, itemsPerPage, currentPage]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && !isInitialized) {
      setIsInitialized(true);
      fetchData(null, 'next');
    }
  }, [autoFetch, isInitialized, fetchData]);

  const loadNext = useCallback(async () => {
    if (loading) return; // Prevent double-click
    if (hasMore && nextCursor) {
      await fetchData(nextCursor, 'next');
    }
  }, [hasMore, nextCursor, fetchData, loading]);

  const loadPrev = useCallback(async () => {
    if (loading) return; // Prevent double-click
    if (prevCursor && currentCursor) {
      await fetchData(prevCursor, 'prev');
    }
  }, [prevCursor, currentCursor, fetchData, loading]);

  const goToPage = useCallback(async (page: number) => {
    if (loading) return; // Prevent double-click
    if (page < 1) return;
    if (page === currentPage) return; // Already on this page
    
    if (page > currentPage) {
      // Going forward
      if (page === currentPage + 1 && nextCursor) {
        await fetchData(nextCursor, 'next', page);
      }
    } else {
      // Going backward
      if (page === currentPage - 1 && prevCursor) {
        await fetchData(prevCursor, 'prev', page);
      }
    }
  }, [currentPage, nextCursor, prevCursor, fetchData, loading]);

  const refresh = useCallback(async () => {
    if (loading) return; // Prevent double-click
    // Refresh from the beginning
    setMaxPageReached(1);
    setCursorHistory(new Map([[1, null]]));
    await fetchData(null, 'next');
  }, [fetchData, loading]);

  const canLoadNext = hasMore && nextCursor !== null && !loading;
  const canLoadPrev = currentCursor !== null && prevCursor !== null && !loading;

  const pageNumbers = Array.from({ length: maxPageReached }, (_, i) => i + 1);

  return {
    data,
    loading,
    error,
    hasMore,
    nextCursor,
    prevCursor,
    loadNext,
    loadPrev,
    goToPage,
    refresh,
    canLoadNext,
    canLoadPrev,
    currentPage,
    pageNumbers,
    // Aliases for compatibility
    paginatedItems: data,
    totalPages: maxPageReached,
    totalItems: data.length,
  };
}