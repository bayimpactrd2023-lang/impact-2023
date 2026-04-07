/**
 * Content Grid Component
 * 
 * Reusable grid layout for displaying content cards.
 * Handles responsive columns and empty states.
 */

import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';

export interface ContentGridProps {
  /** Items to display */
  children: ReactNode;
  
  /** Number of columns for different screen sizes */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Whether grid is empty */
  isEmpty?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Grid container for content cards
 * 
 * Features:
 * - Responsive column layout
 * - Consistent gap spacing
 * - Empty state display
 * - Customizable columns
 */
export function ContentGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  emptyMessage = 'No items found',
  isEmpty = false,
  className = '',
}: ContentGridProps) {
  // Build grid classes based on column configuration
  const gridClasses = `
    grid
    gap-6
    grid-cols-${columns.mobile || 1}
    md:grid-cols-${columns.tablet || 2}
    lg:grid-cols-${columns.desktop || 3}
    ${className}
  `.trim();

  // Show empty state if no items
  if (isEmpty) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}
