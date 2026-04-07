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
      description="Update the details for this partner and click Save to persist changes."
      successMessage="Partner saved!"
      validate={EntityValidator.validatePartner}
      onUpdateItem={onUpdateItem}
    >
      {(item, updateField) => (
        <>
          {/* Name Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Name</Label>
            <Input
              value={item.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Enter partner name"
              className="mt-1.5"
            />
          </div>

          {/* Partner Logo */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Partner Logo</Label>
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