/**
 * News Item Edit Modal
 * 
 * Specialized modal for editing news items.
 * Extends BaseEditModal with news-specific form fields.
 */

import { BaseEditModal } from './BaseEditModal';
import { NewsItem } from '../types/admin.types';
import { EntityValidator } from '../utils/adminHelpers';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: NewsItem | null;
  allItems: NewsItem[];
  onSave: (item: NewsItem) => void;
  onUpdateItem: (updates: Partial<NewsItem>) => void;
  onUpdateImages: (id: string, images: string[]) => void;
}

/**
 * Modal for editing news items
 */
export function NewsModal({
  isOpen,
  onClose,
  editingItem,
  allItems,
  onSave,
  onUpdateItem,
  onUpdateImages,
}: NewsModalProps) {
  return (
    <BaseEditModal
      isOpen={isOpen}
      onClose={onClose}
      editingItem={editingItem}
      allItems={allItems}
      onSave={onSave}
      title="Edit News Item"
      description="Update the details for this news item and click Save to persist changes."
      successMessage="News item saved!"
      validate={EntityValidator.validateNewsItem}
      onUpdateItem={onUpdateItem}
    >
      {(item, updateField) => (
        <>
          {/* Title Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Title</Label>
            <Input
              value={item.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="Enter news title"
              className="mt-1.5"
            />
          </div>

          {/* Date Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Date</Label>
            <Input
              type="date"
              value={item.date}
              onChange={e => updateField('date', e.target.value)}
              min="2000-01-01"
              max={new Date().toISOString().split('T')[0]}
              className="mt-1.5"
            />
          </div>

          {/* Content Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Content</Label>
            <Textarea
              value={item.content}
              onChange={e => updateField('content', e.target.value)}
              rows={8}
              className="resize-none mt-1.5"
              placeholder="Enter news content"
            />
          </div>

          {/* Main Image */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Main Image</Label>
            <ImageDropzone
              value={item.imageUrl || ''}
              onChange={url => updateField('imageUrl', url)}
              label="Drop news image here"
            />
          </div>

          {/* Gallery Images */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Gallery Images</Label>
            <MultiImageDropzone
              images={item.images || []}
              onChange={images => {
                updateField('images', images);
                onUpdateImages(item.id, images.filter((img): img is string => typeof img === 'string'));
              }}
              label="News Gallery Images"
            />
          </div>
        </>
      )}
    </BaseEditModal>
  );
}