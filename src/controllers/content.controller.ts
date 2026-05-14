/**
 * Content Controller
 * 
 * Handles business logic for general content management
 */

import { ContentState } from '@/models/content.model';
import { supabaseService } from '@/services/supabaseService';

export class ContentController {
  /**
   * Fetch all content from the database
   */
  static async getContent(): Promise<ContentState> {
    const content = await supabaseService.getContent();
    return content;
  }

  /**
   * Update hero section content
   */
  static async updateHero(data: {
    title: string;
    subtitle: string;
    backgroundUrl?: string;
  }): Promise<void> {
    await supabaseService.updateContent({
      heroTitle: data.title,
      heroSubtitle: data.subtitle,
      heroBackgroundUrl: data.backgroundUrl,
    });
  }

  /**
   * Update about section content
   */
  static async updateAbout(data: {
    vision: string;
    mission: string;
    description: string;
  }): Promise<void> {
    await supabaseService.updateContent({
      aboutVision: data.vision,
      aboutMission: data.mission,
      aboutDescription: data.description,
    });
  }

  /**
   * Validate content data
   */
  static validateContent(data: Partial<ContentState>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.heroTitle && data.heroTitle.trim().length === 0) {
      errors.push('Hero title cannot be empty');
    }

    if (data.heroSubtitle && data.heroSubtitle.trim().length === 0) {
      errors.push('Hero subtitle cannot be empty');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
