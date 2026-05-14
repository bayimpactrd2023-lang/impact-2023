/**
 * Highlights Tab Component
 * 
 * Tab for managing highlights.
 */

import { FileText } from 'lucide-react';
import { ContentGridTab } from './ContentGridTab';
import { Highlight } from '../types/admin.types';
import { CardContent } from '@/app/components/ui/card';
import { getImageUrl } from '@/utils/r2Upload';

interface HighlightsTabProps {
  highlights: Highlight[];
  onAdd: () => void;
  onEdit: (item: Highlight) => void;
  onDelete: (id: string) => void;
}

/**
 * Highlights management tab
 */
export function HighlightsTab({
  highlights,
  onAdd,
  onEdit,
  onDelete,
}: HighlightsTabProps) {
  /**
   * Render a single highlight card
   */
  const renderHighlightCard = (item: Highlight) => (
    <>
      {/* Image */}
      {item.imageUrl ? (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <CardContent className="p-4">
        <h4 className="font-semibold text-sm line-clamp-2 mb-2">
          {item.title || 'Untitled'}
        </h4>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {item.description || 'No description'}
        </p>
      </CardContent>
    </>
  );

  return (
    <ContentGridTab
      title="Manage Highlights"
      addButtonLabel="Add Highlight"
      items={highlights}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      renderCard={renderHighlightCard}
    />
  );
}
