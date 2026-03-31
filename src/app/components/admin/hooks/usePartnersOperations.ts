/**
 * Custom hook for Partners CRUD operations
 * Handles all partners-related business logic separate from UI
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Partner } from '@/app/context/ContentContext';
import {
  createPartner,
  updatePartner as updatePartnerInDb,
  deletePartner as deletePartnerFromDb,
} from '@/services/supabaseService';

export const usePartnersOperations = (
  initialPartners: Partner[],
  refreshContent?: () => Promise<void>
) => {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save partner to database
   */
  const handleSave = async (partner?: Partner) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const itemsToSave = partner ? [partner] : partners;

      for (const item of itemsToSave) {
        const partnerData = {
          name: item.name,
          logo_url: item.logoUrl,
        };

        if (item.id.startsWith('temp-')) {
          await createPartner(partnerData);
        } else {
          await updatePartnerInDb(item.id, partnerData);
        }
      }

      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Partners saved successfully!');
      setIsPartnerModalOpen(false);
    } catch (error) {
      console.error('Error saving partners:', error);
      toast.error('Failed to save partners.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Add new partner
   */
  const handleAdd = () => {
    const newPartner: Partner = {
      id: `temp-${Date.now()}`,
      name: '',
      logoUrl: '',
    };
    setEditingPartner(newPartner);
    setIsPartnerModalOpen(true);
  };

  /**
   * Delete partner
   */
  const handleDelete = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deletePartnerFromDb(id);
      }
      
      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Partner deleted successfully!');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner.');
    }
  };

  /**
   * Update partner field
   */
  const handleUpdate = (id: string, field: keyof Partner, value: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return {
    partners,
    setPartners,
    editingPartner,
    setEditingPartner,
    isPartnerModalOpen,
    setIsPartnerModalOpen,
    isSaving,
    handleSave,
    handleAdd,
    handleDelete,
    handleUpdate,
  };
};