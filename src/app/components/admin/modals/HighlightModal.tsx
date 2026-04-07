/**
 * Highlight Edit Modal
 * 
 * Specialized modal for editing highlights.
 * Extends BaseEditModal with highlight-specific form fields.
 */

import { BaseEditModal } from './BaseEditModal';
import { Highlight } from '../types/admin.types';
import { EntityValidator } from '../utils/adminHelpers';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';

interface HighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Highlight | null;
  allItems: Highlight[];
  onSave: (item: Highlight) => void;
  onUpdateItem: (updates: Partial<Highlight>) => void;
  onUpdateImages: (id: string, images: string[]) => void;
}

/**
 * Modal for editing highlights
 */
export function HighlightModal({
  isOpen,
  onClose,
  editingItem,
  allItems,
  onSave,
  onUpdateItem,
  onUpdateImages,
}: HighlightModalProps) {
  return (
    <BaseEditModal
      isOpen={isOpen}
      onClose={onClose}
      editingItem={editingItem}
      allItems={allItems}
      onSave={onSave}
      title="Edit Highlight"
      description="Update the details for this highlight and click Save to persist changes."
      successMessage="Highlight saved!"
      validate={EntityValidator.validateHighlight}
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
              placeholder="Enter highlight title"
              className="mt-1.5"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Description</Label>
            <Textarea
              value={item.description}
              onChange={e => updateField('description', e.target.value)}
              rows={3}
              className="resize-none mt-1.5"
              placeholder="Enter highlight description"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Icon</Label>
            <Select
              value={item.iconName}
              onValueChange={value => updateField('iconName', value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Satellite">Satellite</SelectItem>
                <SelectItem value="Sprout">Sprout</SelectItem>
                <SelectItem value="BarChart3">BarChart3</SelectItem>
                <SelectItem value="Globe">Globe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Detailed Content Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Detailed Content</Label>
            <Textarea
              value={item.content || ''}
              onChange={e => updateField('content', e.target.value)}
              rows={6}
              className="resize-none mt-1.5"
              placeholder="Enter detailed content (optional)"
            />
          </div>

          {/* Published Date Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Published Date</Label>
            <Input
              type="date"
              value={item.publishedDate || ''}
              onChange={e => updateField('publishedDate', e.target.value)}
              min="2000-01-01"
              max={new Date().toISOString().split('T')[0]}
              className="mt-1.5"
            />
          </div>

          {/* Main Image */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Main Image</Label>
            <ImageDropzone
              value={item.imageUrl || ''}
              onChange={url => updateField('imageUrl', url)}
              label="Drop highlight image here"
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
              label="Highlight Gallery Images"
            />
          </div>
        </>
      )}
    </BaseEditModal>
  );
}