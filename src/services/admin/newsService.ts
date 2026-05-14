/**
 * News Service
 * All news-related database operations
 */

import { supabase } from '@/lib/supabase';

export interface NewsData {
  title: string;
  content: string;
  date: string;
  image_url?: string | null;
  images?: string[] | null;
}

/**
 * Create a new news item
 */
export async function createNews(data: NewsData) {
  try {
    const { data: created, error } = await supabase
      .from('news')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return created;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
}

/**
 * Update an existing news item
 */
export async function updateNews(id: string, data: NewsData) {
  try {
    const { data: updated, error } = await supabase
      .from('news')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
}

/**
 * Delete a news item
 */
export async function deleteNews(id: string) {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
}

/**
 * Get all news items
 */
export async function getAllNews() {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}
