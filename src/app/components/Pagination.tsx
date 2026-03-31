import React from 'react';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  loading?: boolean;
  showAlways?: boolean; // New prop to show even on single page
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems,
  loading = false,
  showAlways = false, // Default to false for backward compatibility
}) => {
  const getPaginationRange = () => {
    const range = [];
    const maxButtons = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    
    // Ensure start is at least 1
    start = Math.max(1, start);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  };

  // Show if totalPages > 1 OR if showAlways is true
  if (totalPages <= 1 && !showAlways) return null;

  const handlePageChange = (page: number) => {
    if (!loading && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPaginationRange().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(page)}
            disabled={loading || currentPage === page}
            className={`${currentPage === page ? "bg-[#1887FC] hover:bg-[#0b5ab8]" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {itemsPerPage && totalItems && (
        <div className="text-center text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
      )}
    </div>
  );
};