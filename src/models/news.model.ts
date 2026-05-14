/**
 * News Model
 * 
 * Defines the structure for news articles
 */

export interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  date: string;
  author?: string;
  category?: string;
}

export interface NewsFormData {
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  date: string;
  author?: string;
  category?: string;
}
