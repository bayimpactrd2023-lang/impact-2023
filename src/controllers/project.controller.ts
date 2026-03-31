/**
 * Project Controller
 * 
 * Handles business logic for project management
 */

import { Project, ProjectFormData } from '@/models/project.model';

export class ProjectController {
  /**
   * Validate project data
   */
  static validate(data: Partial<ProjectFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Project title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!data.status) {
      errors.push('Status is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Filter projects by category
   */
  static filterByCategory(projects: Project[], category: string): Project[] {
    if (!category) return projects;
    return projects.filter(p => p.category === category);
  }

  /**
   * Filter projects by status
   */
  static filterByStatus(projects: Project[], status: string): Project[] {
    if (!status) return projects;
    return projects.filter(p => p.status === status);
  }
}
