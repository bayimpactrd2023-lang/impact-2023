/**
 * Highlight Controller
 * 
 * Handles business logic for highlights management
 */

import { Highlight, HighlightFormData } from '@/models/highlight.model';
import { supabaseService } from '@/services/supabaseService';

export class HighlightController {
  /**
   * Get all highlights
   */
  static async getAll(): Promise<Highlight[]> {
    return await supabaseService.getHighlights();
  }

  /**
   * Get featured highlights only
   */
  static async getFeatured(): Promise<Highlight[]> {
    const highlights = await this.getAll();
    return highlights.filter(h => h.featured === true);
  }

  /**
   * Create a new highlight
   */
  static async create(data: HighlightFormData): Promise<Highlight> {
    const validation = this.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await supabaseService.addHighlight(data);
  }

  /**
   * Update an existing highlight
   */
  static async update(id: string, data: Partial<HighlightFormData>): Promise<void> {
    await supabaseService.updateHighlight(id, data);
  }

  /**
   * Delete a highlight
   */
  static async delete(id: string): Promise<void> {
    await supabaseService.deleteHighlight(id);
  }

  /**
   * Validate highlight data
   */
  static validate(data: Partial<HighlightFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
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
   * Sort highlights by date (newest first)
   */
  static sortByDate(highlights: Highlight[]): Highlight[] {
    return [...highlights].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
}
