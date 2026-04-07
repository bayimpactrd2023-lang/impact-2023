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
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { ImageDropzone } from '@/app/components/ImageDropzone';

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
    >
      {(item, updateField) => (
        <>
          {/* Name Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Name</Label>
            <Input
              value={item.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Enter team member name"
              className="mt-1.5"
            />
          </div>

          {/* Role Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Role</Label>
            <Input
              value={item.role}
              onChange={e => updateField('role', e.target.value)}
              placeholder="Enter role or position"
              className="mt-1.5"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Description</Label>
            <Textarea
              value={item.description}
              onChange={e => updateField('description', e.target.value)}
              rows={4}
              className="resize-none mt-1.5"
              placeholder="Enter description or bio"
            />
          </div>

          {/* Member Photo */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Member Photo</Label>
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