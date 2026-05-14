/**
 * Custom hook for News CRUD operations
 * Handles all news-related business logic separate from UI
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { NewsItem } from '@/app/context/ContentContext';
import {
  createNews,
  updateNews as updateNewsInDb,
  deleteNews as deleteNewsFromDb,
} from '@/services/supabaseService';

export const useNewsOperations = (
  initialNews: NewsItem[],
  refreshContent?: () => Promise<void>
) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save news item to database and refresh
   */
  const handleSave = async (newsItem?: NewsItem) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const itemsToSave = newsItem ? [newsItem] : newsItems;

      for (const item of itemsToSave) {
        const newsData = {
          title: item.title,
          content: item.content,
          date: item.date,
          image_url: item.imageUrl || null,
          images: item.images || null,
        };

        if (item.id.startsWith('temp-')) {
          // Create new
          await createNews(newsData);
        } else {
          // Update existing
          await updateNewsInDb(item.id, newsData);
        }
      }

      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('News saved successfully!');
      setIsNewsModalOpen(false);
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Failed to save news. Please try again.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Add new news item
   */
  const handleAdd = () => {
    const newItem: NewsItem = {
      id: `temp-${Date.now()}`,
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      images: [],
    };
    setEditingNews(newItem);
    setIsNewsModalOpen(true);
  };

  /**
   * Delete news item and refresh
   */
  const handleDelete = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deleteNewsFromDb(id);
      }
      
      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('News item deleted successfully!');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news item.');
    }
  };

  /**
   * Update news item field
   */
  const handleUpdate = (id: string, field: keyof NewsItem, value: string) => {
    setNewsItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  /**
   * Update news item images
   */
  const handleUpdateImages = (id: string, images: string[]) => {
    setNewsItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, images, imageUrl: images[0] || '' } : i
      )
    );
  };

  return {
    newsItems,
    setNewsItems,
    editingNews,
    setEditingNews,
    isNewsModalOpen,
    setIsNewsModalOpen,
    isSaving,
    handleSave,
    handleAdd,
    handleDelete,
    handleUpdate,
    handleUpdateImages,
  };
};