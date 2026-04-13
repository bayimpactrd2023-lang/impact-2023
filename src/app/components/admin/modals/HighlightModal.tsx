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
import { Star } from 'lucide-react';
import { InteractiveRichEditor } from '../InteractiveRichEditor';

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
      icon={<Star className="w-5 h-5" />}
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
              placeholder="Enter highlight title"
            />
          </div>

          {/* Description Field */}
          <InteractiveRichEditor
            id="highlight-description"
            label="Description"
            value={item.description}
            onChange={val => updateField('description', val)}
            rows={3}
            placeholder="Enter highlight description"
            required
          />

          {/* Icon Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              Icon <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Select
              value={item.iconName}
              onValueChange={value => updateField('iconName', value)}
            >
              <SelectTrigger className="w-full">
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
          <InteractiveRichEditor
            id="highlight-content"
            label="Detailed Content"
            value={item.content || ''}
            onChange={val => updateField('content', val)}
            rows={6}
            placeholder="Enter detailed content (optional)"
          />

          {/* Published Date Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1">Published Date</Label>
            <Input
              type="date"
              value={item.publishedDate || ''}
              onChange={e => updateField('publishedDate', e.target.value)}
              min="2000-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Main Image */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1">Main Image</Label>
            <p className="text-xs text-gray-500 mb-3">
              Upload a high-quality main image for this highlight
            </p>
            <ImageDropzone
              value={item.imageUrl || ''}
              onChange={url => updateField('imageUrl', url)}
              label="Drop highlight image here"
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
              label="Highlight Gallery Images"
            />
          </div>
        </>
      )}
    </BaseEditModal>
  );
}