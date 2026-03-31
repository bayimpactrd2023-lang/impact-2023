import { useRef, useEffect } from 'react';

/**
 * Production-ready scroll-to-top hook using native browser APIs
 * 
 * Features:
 * - Uses native browser scrollIntoView() API (zero-cost)
 * - Smooth scrolling with configurable behavior
 * - TypeScript support
 * - Automatic scroll on page changes
 * - Ref-based anchor for precise positioning
 * 
 * @param dependencies - Array of values that trigger scroll (e.g., currentPage)
 * @param options - Scroll behavior options
 * @returns ref object to attach to scroll anchor element
 * 
 * @example
 * ```tsx
 * const scrollRef = useScrollToTop([currentPage]);
 * 
 * return (
 *   <div>
 *     <div ref={scrollRef} /> // Scroll anchor
 *     // Your content
 *   </div>
 * );
 * ```
 */
export const useScrollToTop = (
  dependencies: any[] = [],
  options: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  }
) => {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only scroll if dependencies have changed (not on initial mount)
    if (dependencies.length === 0) return;

    // Use native browser scrollIntoView API
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView(options);
    }
  }, dependencies);

  return scrollAnchorRef;
};

/**
 * Alternative implementation using window.scrollTo
 * Useful when you want to scroll to absolute position
 * 
 * @example
 * ```tsx
 * useScrollToPosition([currentPage], { top: 0, behavior: 'smooth' });
 * ```
 */
export const useScrollToPosition = (
  dependencies: any[] = [],
  options: ScrollToOptions = {
    top: 0,
    left: 0,
    behavior: 'smooth'
  }
) => {
  useEffect(() => {
    if (dependencies.length === 0) return;

    // Use native browser scrollTo API
    window.scrollTo(options);
  }, dependencies);
};

/**
 * Hook for smooth scroll with offset (e.g., for fixed headers)
 * 
 * @param dependencies - Array of values that trigger scroll
 * @param offset - Pixels to offset from top (default: 0)
 * @returns ref object to attach to scroll anchor element
 * 
 * @example
 * ```tsx
 * const scrollRef = useScrollToTopWithOffset([currentPage], 80); // 80px offset for header
 * ```
 */
export const useScrollToTopWithOffset = (
  dependencies: any[] = [],
  offset: number = 0
) => {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dependencies.length === 0) return;

    if (scrollAnchorRef.current) {
      const elementPosition = scrollAnchorRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, dependencies);

  return scrollAnchorRef;
};
