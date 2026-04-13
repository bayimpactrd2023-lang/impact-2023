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
import { VisualRichEditor } from '@/app/components/admin/VisualRichEditor';
import { Label } from '@/app/components/ui/label';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { Newspaper } from 'lucide-react';

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
      icon={<Newspaper className="w-5 h-5" />}
    >
      {(item, updateField) => (
        <>
          {/* Title Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              Title <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              value={item.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="Enter news title"
            />
          </div>

          {/* Date Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              Date <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              type="date"
              value={item.date}
              onChange={e => updateField('date', e.target.value)}
              min="2000-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Content Field */}
          <VisualRichEditor
            id="news-content"
            label="Content"
            value={item.content}
            onChange={(value: string) => updateField('content', value)}
            rows={8}
            placeholder="Enter news content"
            required
          />

          {/* Main Image */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1">Main Image</Label>
            <p className="text-xs text-gray-500 mb-3">
              Upload a high-quality main image for this news article
            </p>
            <ImageDropzone
              value={item.imageUrl || ''}
              onChange={url => updateField('imageUrl', url)}
              label="Drop news image here"
            />
          </div>

          {/* Gallery Images */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1 flex justify-between">
              <span>Gallery Images (Drag & Drop)</span>
              <span className="text-xs text-gray-400 font-normal">{item.images?.length || 0} images</span>
            </Label>
            <p className="text-xs text-gray-500 mb-3">
              Upload additional images for the gallery
            </p>
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
