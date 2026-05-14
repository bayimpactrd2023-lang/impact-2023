/**
 * Custom hook for Highlights CRUD operations
 * Handles all highlights-related business logic separate from UI
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Highlight } from '@/app/context/ContentContext';
import {
  createHighlight,
  updateHighlight as updateHighlightInDb,
  deleteHighlight as deleteHighlightFromDb,
} from '@/services/supabaseService';

export const useHighlightsOperations = (
  initialHighlights: Highlight[],
  refreshContent?: () => Promise<void>
) => {
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [showMigrationWarning, setShowMigrationWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save highlight to database
   */
  const handleSave = async (highlight?: Highlight) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const itemsToSave = highlight ? [highlight] : highlights;

      for (const item of itemsToSave) {
        const highlightData: any = {
          title: item.title,
          description: item.description,
          image_url: item.imageUrl,
          images: item.images || null,
          icon_name: item.iconName,
          content: item.content || null,
          published_date: item.publishedDate || null,
        };

        // Only add featured if it's explicitly set
        if (item.featured !== undefined) {
          highlightData.featured = item.featured;
        }

        if (item.id.startsWith('temp-')) {
          await createHighlight(highlightData);
        } else {
          await updateHighlightInDb(item.id, highlightData);
        }
      }

      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Highlights saved successfully!');
      setShowMigrationWarning(false);
      setIsHighlightModalOpen(false);
    } catch (error: any) {
      console.error('Error saving highlights:', error);

      // Check if error is related to missing 'featured' column
      if (error?.message?.includes("'featured' column") || error?.code === 'PGRST204') {
        setShowMigrationWarning(true);
        toast.error('Database migration required! Check the banner above for instructions.');
      } else {
        toast.error('Failed to save highlights.');
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Add new highlight
   */
  const handleAdd = () => {
    const newHighlight: Highlight = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      iconName: 'Globe',
      publishedDate: new Date().toISOString().split('T')[0], // Default to today
    };
    setEditingHighlight(newHighlight);
    setIsHighlightModalOpen(true);
  };

  /**
   * Delete highlight
   */
  const handleDelete = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deleteHighlightFromDb(id);
      }
      
      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Highlight deleted successfully!');
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight.');
    }
  };

  /**
   * Update highlight field
   */
  const handleUpdate = (id: string, field: keyof Highlight, value: string) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  /**
   * Update highlight images
   */
  const handleUpdateImages = (id: string, images: string[]) => {
    setHighlights((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, images, imageUrl: images[0] || '' } : h
      )
    );
  };

  return {
    highlights,
    setHighlights,
    editingHighlight,
    setEditingHighlight,
    isHighlightModalOpen,
    setIsHighlightModalOpen,
    showMigrationWarning,
    setShowMigrationWarning,
    isSaving,
    handleSave,
    handleAdd,
    handleDelete,
    handleUpdate,
    handleUpdateImages,
  };
};