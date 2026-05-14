/**
 * Team Member Controller
 * 
 * Handles business logic for team member management
 */

import { TeamMember, TeamMemberFormData } from '@/models/team.model';
import { supabaseService } from '@/services/supabaseService';

export class TeamController {
  /**
   * Get all team members
   */
  static async getAll(): Promise<TeamMember[]> {
    return await supabaseService.getTeamMembers();
  }

  /**
   * Create a new team member
   */
  static async create(data: TeamMemberFormData): Promise<TeamMember> {
    const validation = this.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await supabaseService.addTeamMember(data);
  }

  /**
   * Update an existing team member
   */
  static async update(id: string, data: Partial<TeamMemberFormData>): Promise<void> {
    await supabaseService.updateTeamMember(id, data);
  }

  /**
   * Delete a team member
   */
  static async delete(id: string): Promise<void> {
    await supabaseService.deleteTeamMember(id);
  }

  /**
   * Validate team member data
   */
  static validate(data: Partial<TeamMemberFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!data.position || data.position.trim().length === 0) {
      errors.push('Position is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
