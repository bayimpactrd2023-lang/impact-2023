import React, { useState } from 'react';
import { TeamMember, TeamMemberForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, X, CheckCircle, User, Users } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { EntityValidator } from '@/app/components/admin/utils/adminHelpers';
import {
  createTeamMember,
  updateTeamMember as updateTeamInDb,
  deleteTeamMember as deleteTeamFromDb,
  getTeamMembersPaginated,
} from '@/services/supabaseService';

import { uploadImage, deleteStorageFile } from '@/utils/storageUpload';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { invalidateTeamCache } from '@/utils/cacheInvalidation';

interface TeamManagerProps {
  teamMembers: TeamMember[];
  onUpdate: (teamMembers: TeamMember[]) => void;
  refreshContent?: () => Promise<void>;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ teamMembers: _teamMembers, onUpdate: _onUpdate, refreshContent: _refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<TeamMember>({
    fetchFunction: getTeamMembersPaginated,
    itemsPerPage: 6,
  });

  const addMember = () => {
    const newMember: TeamMemberForm = {
      id: `temp-${Date.now()}`,
      name: '',
      role: '',
      description: '',
      imageUrl: '',
    };
    setEditingMember(newMember);
    setIsModalOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember({ ...member });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'team member',
      title: 'Delete Team Member',
      message: 'Are you sure you want to delete this team member? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\\d{13}$/)) {
        // Find the member to get its image URL for storage cleanup
        const memberToDelete = pagination.data.find(m => m.id === id);
        if (memberToDelete?.imageUrl) {
          await deleteStorageFile(memberToDelete.imageUrl, 'team');
        }
        await deleteTeamFromDb(id);
      }
      
      // Invalidate cache
      invalidateTeamCache();
      
      await pagination.refresh();
      toast.success('Team member deleted successfully!');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member.');
    }
  };

  const handleSave = async () => {
    if (!editingMember || isSaving) return;

    const validation = EntityValidator.validateTeamMember(editingMember);
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    setIsSaving(true);
    try {
      // Handle Image Upload before saving to database
      let finalImageUrl = editingMember.imageUrl;
      if (typeof finalImageUrl === 'object' && finalImageUrl instanceof File) {
        finalImageUrl = await uploadImage(finalImageUrl, 'team');
      }

      const memberData = {
        name: editingMember.name,
        role: editingMember.role,
        description: editingMember.description || '',
        image_url: (finalImageUrl as string) || null,
      };

      if (editingMember.id && !editingMember.id.startsWith('temp-') && !editingMember.id.match(/^\\d{13}$/)) {
        await updateTeamInDb(editingMember.id, memberData);
        toast.success('Team member updated!');
      } else {
        await createTeamMember(memberData);
        toast.success('Team member created!');
      }

      // Invalidate cache
      invalidateTeamCache();

      await pagination.refresh();
      setIsModalOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Failed to save team member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Team Members</h3>
        <Button onClick={addMember} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading team members..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <Users className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No team members yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Member" to create your first team member</p>
        </div>
      )}

      {/* Team Members Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading team members..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((member) => (
              <Card
                key={member.id}
                className="cursor-pointer hover:shadow-lg transition-shadow relative group"
                onClick={() => handleEdit(member)}
              >
                <div className="absolute top-2 left-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(member.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                {member.imageUrl ? (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-blue-400" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-1">
                    {member.name || 'Unnamed'}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {member.role || 'No role specified'}
                  </p>
                  {member.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {member.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Edit className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Click to edit</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* Server-side Pagination Controls */}
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            loading={pagination.loading}
            onPageChange={pagination.goToPage}
            onPrevious={pagination.prevPage}
            onNext={pagination.nextPage}
            itemCount={pagination.data.length}
            totalItems={pagination.totalItems}
          />
        </>
      )}

      {/* Team Member Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingMember?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Team Member
            </DialogTitle>
            <DialogDescription>
              {editingMember?.id?.startsWith('temp-')
                ? 'Create a new team member profile'
                : 'Update the details for this team member'}
            </DialogDescription>
          </DialogHeader>

          {editingMember && (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-1">
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="member-name">Name *</Label>
                  <Input
                    id="member-name"
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, name: e.target.value })
                    }
                    placeholder="Enter member name"
                  />
                </div>

                <div>
                  <Label htmlFor="member-role">Role/Position *</Label>
                  <Input
                    id="member-role"
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, role: e.target.value })
                    }
                    placeholder="e.g., Executive Director"
                  />
                </div>

                <div>
                  <Label htmlFor="member-bio">Biography</Label>
                  <Textarea
                    id="member-bio"
                    value={editingMember.description || ''}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, description: e.target.value })
                    }
                    rows={4}
                    placeholder="Enter member biography"
                  />
                </div>

                <div>
                  <Label>Photo</Label>
                  <ImageDropzone
                    value={editingMember.imageUrl || ''}
                    onChange={(url) =>
                      setEditingMember({ ...editingMember, imageUrl: url })
                    }
                    label="Member Photo"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingMember(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb]"
                    disabled={isSaving}
                    onClick={handleSave}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Member'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};