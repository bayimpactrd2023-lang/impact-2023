/**
 * Custom hook for Team Members CRUD operations
 * Handles all team-related business logic separate from UI
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { TeamMember } from '@/app/context/ContentContext';
import {
  createTeamMember,
  updateTeamMember as updateTeamMemberInDb,
  deleteTeamMember as deleteTeamMemberFromDb,
} from '@/services/supabaseService';

export const useTeamOperations = (
  initialTeamMembers: TeamMember[],
  refreshContent?: () => Promise<void>
) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save team member to database
   */
  const handleSave = async (member?: TeamMember) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const itemsToSave = member ? [member] : teamMembers;

      for (const item of itemsToSave) {
        const memberData = {
          name: item.name,
          role: item.role,
          description: item.description,
          image_url: item.imageUrl || null,
        };

        if (item.id.startsWith('temp-')) {
          await createTeamMember(memberData);
        } else {
          await updateTeamMemberInDb(item.id, memberData);
        }
      }

      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Team members saved successfully!');
      setIsTeamMemberModalOpen(false);
    } catch (error) {
      console.error('Error saving team members:', error);
      toast.error('Failed to save team members.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Add new team member
   */
  const handleAdd = () => {
    const newMember: TeamMember = {
      id: `temp-${Date.now()}`,
      name: '',
      role: '',
      description: '',
      imageUrl: '',
    };
    setEditingTeamMember(newMember);
    setIsTeamMemberModalOpen(true);
  };

  /**
   * Delete team member
   */
  const handleDelete = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deleteTeamMemberFromDb(id);
      }
      
      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Team member deleted successfully!');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member.');
    }
  };

  /**
   * Update team member field
   */
  const handleUpdate = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  return {
    teamMembers,
    setTeamMembers,
    editingTeamMember,
    setEditingTeamMember,
    isTeamMemberModalOpen,
    setIsTeamMemberModalOpen,
    isSaving,
    handleSave,
    handleAdd,
    handleDelete,
    handleUpdate,
  };
};