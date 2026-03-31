/**
 * Publication Controller
 * 
 * Handles business logic for publication management
 */

import { Publication, PublicationFormData } from '@/models/publication.model';
import { supabaseService } from '@/services/supabaseService';

export class PublicationController {
  /**
   * Get all publications
   */
  static async getAll(): Promise<Publication[]> {
    return await supabaseService.getPublications();
  }

  /**
   * Get featured publications only
   */
  static async getFeatured(): Promise<Publication[]> {
    const publications = await this.getAll();
    return publications.filter(p => p.featured === true);
  }

  /**
   * Create a new publication
   */
  static async create(data: PublicationFormData): Promise<Publication> {
    const validation = this.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await supabaseService.addPublication(data);
  }

  /**
   * Update an existing publication
   */
  static async update(id: string, data: Partial<PublicationFormData>): Promise<void> {
    await supabaseService.updatePublication(id, data);
  }

  /**
   * Delete a publication
   */
  static async delete(id: string): Promise<void> {
    await supabaseService.deletePublication(id);
  }

  /**
   * Validate publication data
   */
  static validate(data: Partial<PublicationFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.authors || data.authors.trim().length === 0) {
      errors.push('Authors are required');
    }

    if (!data.abstract || data.abstract.trim().length === 0) {
      errors.push('Abstract is required');
    }

    if (!data.year) {
      errors.push('Year is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sort publications by year (newest first)
   */
  static sortByYear(publications: Publication[]): Publication[] {
    return [...publications].sort((a, b) => {
      return parseInt(b.year) - parseInt(a.year);
    });
  }
}
