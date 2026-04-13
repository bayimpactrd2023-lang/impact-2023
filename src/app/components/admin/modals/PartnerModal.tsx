/**
 * Partner Edit Modal
 * 
 * Specialized modal for editing partners.
 * Extends BaseEditModal with partner-specific form fields.
 */

import { BaseEditModal } from './BaseEditModal';
import { Partner } from '../types/admin.types';
import { EntityValidator } from '../utils/adminHelpers';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { Image } from 'lucide-react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Partner | null;
  allItems: Partner[];
  onSave: (item: Partner) => void;
  onUpdateItem: (updates: Partial<Partner>) => void;
}

/**
 * Modal for editing partners
 */
export function PartnerModal({
  isOpen,
  onClose,
  editingItem,
  allItems,
  onSave,
  onUpdateItem,
}: PartnerModalProps) {
  return (
    <BaseEditModal
      isOpen={isOpen}
      onClose={onClose}
      editingItem={editingItem}
      allItems={allItems}
      onSave={onSave}
      title="Edit Partner"
      description="Update the partner details and click Save to persist changes."
      successMessage="Partner saved!"
      validate={EntityValidator.validatePartner}
      onUpdateItem={onUpdateItem}
      icon={<Image className="w-5 h-5" />}
    >
      {(item, updateField) => (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              Partner Name <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              value={item.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Partner name"
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1">Logo (Drag & Drop)</Label>
            <p className="text-xs text-gray-500 mb-3">Upload a high-quality logo for this partner</p>
            <ImageDropzone
              value={item.logoUrl}
              onChange={url => updateField('logoUrl', url)}
              label="Drop partner logo here"
            />
          </div>
        </>
      )}
    </BaseEditModal>
  );
}
