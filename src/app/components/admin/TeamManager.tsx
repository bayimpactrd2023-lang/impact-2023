import React, { useState } from 'react';
import { TeamMember, TeamMemberForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { VisualRichEditor } from './VisualRichEditor';
import { SharedToolbar } from './SharedToolbar';
import { Plus, Trash2, User, Edit, CheckCircle, X, Users } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { EntityValidator, hasChanges } from '@/app/components/admin/utils/adminHelpers';
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
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleCommand = (cmd: string, val?: string) => {
    if (activeField) {
      const event = new CustomEvent(`editor-command-${activeField}`, { 
        detail: { command: cmd, value: val } 
      });
      window.dispatchEvent(event);
    }
  };

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
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
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

      if (editingMember.id && !editingMember.id.startsWith('temp-') && !editingMember.id.match(/^\d{13}$/)) {
        const originalMember = pagination.data.find(m => m.id === editingMember.id);
        if (originalMember && !hasChanges(originalMember, editingMember)) {
          toast.info('No changes detected.');
          setIsModalOpen(false);
          setEditingMember(null);
          return;
        }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            <Users className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Manage Board Members</h3>
            <p className="text-xs text-gray-500 font-medium">Add or edit your team profiles</p>
          </div>
        </div>
        <Button 
          onClick={addMember} 
          size="sm"
          className="w-full sm:w-auto bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md h-10 sm:h-9 px-4 font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
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
          <User className="w-12 h-12 text-gray-300 mb-3" />
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
                className="cursor-pointer relative group overflow-hidden border-gray-100/50 hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-3xl"
                onClick={() => handleEdit(member)}
              >
                {/* Delete Button - Better positioned and styled */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-md shadow-md hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(member.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="p-6 pb-4">
                  {/* Image Container - Circular and centered with theme border */}
                  <div className="relative mx-auto w-48 h-48 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1887FC] to-[#3b82f6] rounded-full animate-pulse opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-[#1887FC] to-[#3b82f6] shadow-lg shadow-blue-500/20">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <User className="w-20 h-20 text-[#1887FC]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-[#1887FC] transition-colors">
                      {member.name || 'Unnamed'}
                    </h4>
                    <p className="text-sm font-semibold text-[#1887FC] line-clamp-1">
                      {member.role || 'No role specified'}
                    </p>
                    {member.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                        {member.description.replace(/<[^>]*>?/gm, '')}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Edit className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Click to edit</span>
                    </div>
                  </div>
                </div>
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
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingMember?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Team Member
                </DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  {editingMember?.id?.startsWith('temp-')
                    ? 'Create a new team member profile'
                    : 'Update the details for this team member'}
                </DialogDescription>
              </div>
            </div>
            <div className="pt-2">
              <SharedToolbar 
                onCommand={handleCommand} 
              />
            </div>
          </DialogHeader>

          {editingMember && (
            <div
              className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
            >
              <div className="space-y-8 py-6">
                <div>
                  <Label htmlFor="member-name" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Name <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="member-name"
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, name: e.target.value })
                    }
                    placeholder="Enter member name"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="member-role" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Role/Position <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="member-role"
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, role: e.target.value })
                    }
                    placeholder="e.g., Executive Director"
                  />
                </div>

                <VisualRichEditor
                  id="member-bio"
                  label="Biography"
                  value={editingMember.description || ''}
                  onChange={(val) =>
                    setEditingMember({ ...editingMember, description: val })
                  }
                  rows={4}
                  placeholder="Enter member biography"
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('member-bio');
                    }
                  }}
                />

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1">Photo</Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload a high-quality photo for this team member
                  </p>
                  <ImageDropzone
                    value={editingMember.imageUrl || ''}
                    onChange={(url) =>
                      setEditingMember({ ...editingMember, imageUrl: url })
                    }
                    label="Member Photo"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 transition-all"
              onClick={() => {
                setIsModalOpen(false);
                setEditingMember(null);
              }}
            >
              <X className="w-5 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="w-5 h-5 mr-2" /> {isSaving ? 'Saving...' : 'Save Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};
