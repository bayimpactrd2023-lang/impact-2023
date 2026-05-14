/**
 * Content Card Component
 * 
 * Reusable card component for displaying content items.
 * Used across blog, publications, highlights, etc.
 */

import type { ReactNode } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { FileText } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export interface ContentCardProps {
  /** Card title */
  title: string;
  
  /** Card description/excerpt */
  description?: string;
  
  /** Image URL */
  imageUrl?: string;
  
  /** Additional metadata (date, author, etc.) */
  metadata?: ReactNode;
  
  /** Footer content (actions, tags, etc.) */
  footer?: ReactNode;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Image height (default: 48) */
  imageHeight?: string;
  
  /** Whether to show hover effects */
  hoverable?: boolean;
}

/**
 * Generic content card component
 * 
 * Features:
 * - Consistent styling across pages
 * - Optional image with fallback
 * - Flexible metadata and footer
 * - Hover animations
 * - Responsive design
 */
export function ContentCard({
  title,
  description,
  imageUrl,
  metadata,
  footer,
  onClick,
  className = '',
  imageHeight = 'h-48',
  hoverable = true,
}: ContentCardProps) {
  const hoverClasses = hoverable
    ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer'
    : '';

  return (
    <Card
      className={`overflow-hidden ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {/* Image Section */}
      {imageUrl ? (
        <div className={`w-full ${imageHeight} overflow-hidden`}>
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`w-full ${imageHeight} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Content Section */}
      <CardContent className="p-4 sm:p-6">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
          {title}
        </h3>

        {/* Metadata (date, author, category, etc.) */}
        {metadata && (
          <div className="mb-3 text-sm text-gray-600">
            {metadata}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-700 text-sm line-clamp-3 mb-4">
            {description}
          </p>
        )}

        {/* Footer (actions, tags, etc.) */}
        {footer && (
          <div className="pt-3 border-t border-gray-100">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
