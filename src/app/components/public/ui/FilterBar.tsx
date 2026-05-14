/**
 * Filter Bar Component
 * 
 * Reusable filter/tab navigation for content pages.
 */

import { Button } from '@/app/components/ui/button';
import { FilterConfig } from '../types/page.types';

export interface FilterBarProps {
  /** Available filter options */
  filters: FilterConfig[];
  
  /** Currently active filter */
  activeFilter: string;
  
  /** Handler for filter change */
  onFilterChange: (value: string) => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Show item counts */
  showCounts?: boolean;
}

/**
 * Filter bar component
 * 
 * Features:
 * - Tab-style filter navigation
 * - Active state highlighting
 * - Optional item counts
 * - Responsive scrolling
 */
export function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  className = '',
  showCounts = true,
}: FilterBarProps) {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex gap-2 pb-2 min-w-max">
        {filters.map(filter => {
          const isActive = filter.value === activeFilter;
          
          return (
            <Button
              key={filter.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(filter.value)}
              className={`
                whitespace-nowrap
                ${isActive ? 'bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white' : ''}
              `}
            >
              {filter.label}
              {showCounts && filter.count !== undefined && (
                <span className={`ml-2 text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                  ({filter.count})
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
