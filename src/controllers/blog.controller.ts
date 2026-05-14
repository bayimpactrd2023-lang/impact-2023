/**
 * Blog Controller
 * 
 * Handles business logic for blog post management
 */

import { BlogPost, BlogFormData } from '@/models/blog.model';
import { supabaseService } from '@/services/supabaseService';

export class BlogController {
  /**
   * Get all blog posts
   */
  static async getAll(): Promise<BlogPost[]> {
    return await supabaseService.getBlogs();
  }

  /**
   * Get a single blog post by ID
   */
  static async getById(id: string): Promise<BlogPost | null> {
    const allBlogs = await this.getAll();
    return allBlogs.find(b => b.id === id) || null;
  }

  /**
   * Create a new blog post
   */
  static async create(data: BlogFormData): Promise<BlogPost> {
    const validation = this.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await supabaseService.addBlog(data);
  }

  /**
   * Update an existing blog post
   */
  static async update(id: string, data: Partial<BlogFormData>): Promise<void> {
    await supabaseService.updateBlog(id, data);
  }

  /**
   * Delete a blog post
   */
  static async delete(id: string): Promise<void> {
    await supabaseService.deleteBlog(id);
  }

  /**
   * Validate blog post data
   */
  static validate(data: Partial<BlogFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.excerpt || data.excerpt.trim().length === 0) {
      errors.push('Excerpt is required');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (!data.author || data.author.trim().length === 0) {
      errors.push('Author is required');
    }

    if (!data.date) {
      errors.push('Date is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sort blog posts by date (newest first)
   */
  static sortByDate(posts: BlogPost[]): BlogPost[] {
    return [...posts].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Filter blog posts by category
   */
  static filterByCategory(posts: BlogPost[], category: string): BlogPost[] {
    if (!category) return posts;
    return posts.filter(p => p.category === category);
  }

  /**
   * Search blog posts by query
   */
  static search(posts: BlogPost[], query: string): BlogPost[] {
    if (!query) return posts;
    const lowerQuery = query.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.excerpt.toLowerCase().includes(lowerQuery) ||
      p.content.toLowerCase().includes(lowerQuery)
    );
  }
}
