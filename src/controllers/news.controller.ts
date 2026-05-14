/**
 * News Controller
 * 
 * Handles business logic for news management
 */

import { News, NewsFormData } from '@/models/news.model';
import { supabaseService } from '@/services/supabaseService';

export class NewsController {
  /**
   * Get all news articles
   */
  static async getAll(): Promise<News[]> {
    return await supabaseService.getNews();
  }

  /**
   * Get a single news article by ID
   */
  static async getById(id: string): Promise<News | null> {
    const allNews = await this.getAll();
    return allNews.find(n => n.id === id) || null;
  }

  /**
   * Create a new news article
   */
  static async create(data: NewsFormData): Promise<News> {
    const validation = this.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await supabaseService.addNews(data);
  }

  /**
   * Update an existing news article
   */
  static async update(id: string, data: Partial<NewsFormData>): Promise<void> {
    await supabaseService.updateNews(id, data);
  }

  /**
   * Delete a news article
   */
  static async delete(id: string): Promise<void> {
    await supabaseService.deleteNews(id);
  }

  /**
   * Validate news data
   */
  static validate(data: Partial<NewsFormData>): { valid: boolean; errors: string[] } {
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

    if (!data.date) {
      errors.push('Date is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sort news by date (newest first)
   */
  static sortByDate(news: News[]): News[] {
    return [...news].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Filter news by category
   */
  static filterByCategory(news: News[], category: string): News[] {
    if (!category) return news;
    return news.filter(n => n.category === category);
  }

  /**
   * Search news by query
   */
  static search(news: News[], query: string): News[] {
    if (!query) return news;
    const lowerQuery = query.toLowerCase();
    return news.filter(n =>
      n.title.toLowerCase().includes(lowerQuery) ||
      n.excerpt.toLowerCase().includes(lowerQuery) ||
      n.content.toLowerCase().includes(lowerQuery)
    );
  }
}
