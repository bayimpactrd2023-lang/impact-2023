import React from 'react';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  itemCount?: number;
  totalItems?: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  loading = false,
  onPageChange,
  onPrevious,
  onNext,
  itemCount,
  totalItems,
}) => {
  // Generate visible page numbers (show only 5 pages at a time)
  const getVisiblePages = (): number[] => {
    const maxVisible = 5;
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Dynamic window logic
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-gray-600">
        {itemCount !== undefined && totalItems !== undefined && 
          `Showing ${itemCount} of ${totalItems} items`
        }
      </div>
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrev || loading}
          className="h-8 w-20 px-3"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Prev
        </Button>

        {/* Page Numbers */}
        {visiblePages.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            disabled={loading || pageNum === currentPage}
            className={`h-8 w-8 p-0 ${
              pageNum === currentPage
                ? 'bg-[#1887FC] text-white hover:bg-[#1570d8]'
                : 'hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext || loading}
          className="h-8 w-20 px-3"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};