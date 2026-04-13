/**
 * Team Member Edit Modal
 * 
 * Specialized modal for editing team members.
 * Extends BaseEditModal with team member-specific form fields.
 */

import { BaseEditModal } from './BaseEditModal';
import { TeamMember } from '../types/admin.types';
import { EntityValidator } from '../utils/adminHelpers';
import { Input } from '@/app/components/ui/input';
import { VisualRichEditor } from '@/app/components/admin/VisualRichEditor';
import { Label } from '@/app/components/ui/label';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { Users } from 'lucide-react';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: TeamMember | null;
  allItems: TeamMember[];
  onSave: (item: TeamMember) => void;
  onUpdateItem: (updates: Partial<TeamMember>) => void;
}

/**
 * Modal for editing team members
 */
export function TeamMemberModal({
  isOpen,
  onClose,
  editingItem,
  allItems,
  onSave,
  onUpdateItem,
}: TeamMemberModalProps) {
  return (
    <BaseEditModal
      isOpen={isOpen}
      onClose={onClose}
      editingItem={editingItem}
      allItems={allItems}
      onSave={onSave}
      title="Edit Team Member"
      description="Update the details for this team member and click Save to persist changes."
      successMessage="Team member saved!"
      validate={EntityValidator.validateTeamMember}
      onUpdateItem={onUpdateItem}
      icon={<Users className="w-5 h-5" />}
    >
      {(item, updateField) => (
        <>
          {/* Name Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              Name <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              value={item.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Enter team member name"
              className="text-lg font-semibold"
            />
          </div>

          {/* Role Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              Role <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              value={item.role}
              onChange={e => updateField('role', e.target.value)}
              placeholder="Enter role or position"
            />
          </div>

          {/* Description Field */}
          <VisualRichEditor
            id="team-description"
            label="Description"
            value={item.description}
            onChange={(value: string) => updateField('description', value)}
            rows={4}
            placeholder="Enter description or bio"
          />

          {/* Member Photo */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-1">Member Photo</Label>
            <p className="text-xs text-gray-500 mb-3">
              Upload a high-quality photo for this team member
            </p>
            <ImageDropzone
              value={item.imageUrl || ''}
              onChange={url => updateField('imageUrl', url)}
              label="Drop team member photo here"
            />
          </div>
        </>
      )}
    </BaseEditModal>
  );
}
