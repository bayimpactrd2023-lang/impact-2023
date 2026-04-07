/**
 * News Tab Component
 * 
 * Tab for managing news items.
 */

import { FileText } from 'lucide-react';
import { ContentGridTab } from './ContentGridTab';
import { NewsItem } from '../types/admin.types';
import { CardContent } from '@/app/components/ui/card';
import { formatDate } from '../utils/adminHelpers';
import { getImageUrl } from '@/utils/r2Upload';

interface NewsTabProps {
  newsItems: NewsItem[];
  onAdd: () => void;
  onEdit: (item: NewsItem) => void;
  onDelete: (id: string) => void;
}

/**
 * News management tab
 */
export function NewsTab({ newsItems, onAdd, onEdit, onDelete }: NewsTabProps) {
  /**
   * Render a single news card
   */
  const renderNewsCard = (item: NewsItem) => (
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
          {item.content || 'No content'}
        </p>
        {item.date && (
          <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
        )}
      </CardContent>
    </>
  );

  return (
    <ContentGridTab
      title="Manage News & Updates"
      addButtonLabel="Add News"
      items={newsItems}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      renderCard={renderNewsCard}
    />
  );
}
