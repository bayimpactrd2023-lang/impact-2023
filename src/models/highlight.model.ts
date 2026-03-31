/**
 * Highlight Model
 * 
 * Defines the structure for highlights/achievements
 */

export interface Highlight {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  category?: string;
  featured?: boolean;
}

export interface HighlightFormData {
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  category?: string;
  featured?: boolean;
}
