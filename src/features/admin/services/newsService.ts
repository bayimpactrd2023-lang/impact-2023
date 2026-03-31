/**
 * News Service
 * 
 * Business logic for managing news items in the admin panel.
 * Handles all CRUD operations for news items with proper error handling.
 */

import {
  createNews,
  updateNews as updateNewsInDb,
  deleteNews as deleteNewsFromDb,
} from '@/services/supabaseService';
import { NewsItem } from '@/app/context/ContentContext';
import { toast } from 'sonner';

/**
 * Delete a news item with error handling
 * @param id - The ID of the news item to delete
 * @param newsItems - Current array of news items
 * @param setNewsItems - State setter for news items
 * @param refreshContent - Optional function to refresh content context
 * @returns Promise<boolean> - Success status
 */
export const handleDeleteNews = async (
  id: string,
  newsItems: NewsItem[],
  setNewsItems: (items: NewsItem[]) => void,
  refreshContent?: () => Promise<void>
): Promise<boolean> => {
  try {
    // Only delete from database if it's not a temporary item
    if (!id.startsWith('temp-')) {
      await deleteNewsFromDb(id);
    }
    
    // Remove from local state
    setNewsItems(newsItems.filter(item => item.id !== id));
    
    // Refresh content context if available
    if (refreshContent) {
      await refreshContent();
    }
    
    toast.success('News item deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting news item:', error);
    toast.error('Failed to delete news item. Please try again.');
    return false;
  }
};

/**
 * Save or update a news item
 * @param newsItem - The news item to save
 * @param newsItems - Current array of news items
 * @param setNewsItems - State setter for news items
 * @param updateNews - Function to update news in context
 * @param refreshContent - Optional function to refresh content context
 * @returns Promise<boolean> - Success status
 */
export const handleSaveNews = async (
  newsItem: NewsItem,
  newsItems: NewsItem[],
  setNewsItems: (items: NewsItem[]) => void,
  updateNews: (items: NewsItem[]) => void,
  refreshContent?: () => Promise<void>
): Promise<boolean> => {
  try {
    let updatedItems: NewsItem[];
    
    // Check if this is a new item (temporary ID) or existing item
    if (newsItem.id.startsWith('temp-')) {
      // Create new item
      const newItem = await createNews({
        title: newsItem.title,
        content: newsItem.content,
        date: newsItem.date,
        imageUrl: newsItem.imageUrl || '',
        images: newsItem.images || [],
      });
      
      // Replace temporary item with actual item from database
      updatedItems = newsItems.map(item =>
        item.id === newsItem.id ? newItem : item
      );
    } else {
      // Update existing item
      await updateNewsInDb(newsItem.id, {
        title: newsItem.title,
        content: newsItem.content,
        date: newsItem.date,
        imageUrl: newsItem.imageUrl || '',
        images: newsItem.images || [],
      });
      
      // Update in local state
      updatedItems = newsItems.map(item =>
        item.id === newsItem.id ? newsItem : item
      );
    }
    
    setNewsItems(updatedItems);
    updateNews(updatedItems);
    
    // Refresh content context if available
    if (refreshContent) {
      await refreshContent();
    }
    
    toast.success('News item saved successfully!');
    return true;
  } catch (error) {
    console.error('Error saving news item:', error);
    toast.error('Failed to save news item. Please try again.');
    return false;
  }
};

/**
 * Create a new temporary news item
 * @returns NewsItem with temporary ID
 */
export const createTempNewsItem = (): NewsItem => ({
  id: `temp-${Date.now()}`,
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  images: [],
  imageUrl: '',
});
