/**
 * Highlights Service
 * All highlights-related database operations
 */

import { supabase } from '@/lib/supabase';

export interface HighlightData {
  title: string;
  description: string;
  image_url: string;
  images?: string[] | null;
  icon_name: string;
  content?: string | null;
  published_date?: string | null;
  featured?: boolean;
}

/**
 * Create a new highlight
 */
export async function createHighlight(data: HighlightData) {
  try {
    const { data: created, error } = await supabase
      .from('highlights')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return created;
  } catch (error) {
    console.error('Error creating highlight:', error);
    throw error;
  }
}

/**
 * Update an existing highlight
 */
export async function updateHighlight(id: string, data: HighlightData) {
  try {
    const { data: updated, error } = await supabase
      .from('highlights')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } catch (error) {
    console.error('Error updating highlight:', error);
    throw error;
  }
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(id: string) {
  try {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting highlight:', error);
    throw error;
  }
}

/**
 * Get all highlights
 */
export async function getAllHighlights() {
  try {
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching highlights:', error);
    throw error;
  }
}
