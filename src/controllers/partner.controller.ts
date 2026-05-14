/**
 * Partner Controller
 * 
 * Handles business logic for partner management
 */

import { Partner, PartnerFormData } from '@/models/partner.model';
import { supabaseService } from '@/services/supabaseService';

export class PartnerController {
  /**
   * Get all partners
   */
  static async getAll(): Promise<Partner[]> {
    return await supabaseService.getPartners();
  }

  /**
   * Create a new partner
   */
  static async create(data: PartnerFormData): Promise<Partner> {
    const validation = this.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await supabaseService.addPartner(data);
  }

  /**
   * Update an existing partner
   */
  static async update(id: string, data: Partial<PartnerFormData>): Promise<void> {
    await supabaseService.updatePartner(id, data);
  }

  /**
   * Delete a partner
   */
  static async delete(id: string): Promise<void> {
    await supabaseService.deletePartner(id);
  }

  /**
   * Validate partner data
   */
  static validate(data: Partial<PartnerFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Partner name is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
