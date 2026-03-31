/**
 * Pagination Controls Component
 * 
 * Reusable pagination UI for navigating through pages.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export interface PaginationControlsProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Handler for page change */
  onPageChange: (page: number) => void;
  
  /** Whether on first page */
  isFirstPage?: boolean;
  
  /** Whether on last page */
  isLastPage?: boolean;
  
  /** Show page numbers (default: true) */
  showPageNumbers?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pagination controls component
 * 
 * Features:
 * - Previous/Next buttons
 * - Page number display
 * - Disabled states
 * - Responsive design
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isFirstPage = false,
  isLastPage = false,
  showPageNumbers = true,
  className = '',
}: PaginationControlsProps) {
  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Generate page number buttons
   */
  const renderPageNumbers = () => {
    const pages: JSX.Element[] = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust if near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(1)}
          className="min-w-[40px]"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(i)}
          className={`min-w-[40px] ${
            currentPage === i
              ? 'bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white'
              : ''
          }`}
        >
          {i}
        </Button>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="min-w-[40px]"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="min-w-[40px]"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className="hidden sm:flex items-center gap-2">
          {renderPageNumbers()}
        </div>
      )}

      {/* Current Page Indicator (mobile) */}
      {showPageNumbers && (
        <div className="sm:hidden text-sm text-gray-600">
          {currentPage} / {totalPages}
        </div>
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="min-w-[40px]"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
