/**
 * Blog Model
 * 
 * Defines the structure for blog posts
 */

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}
