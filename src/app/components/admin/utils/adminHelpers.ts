/**
 * Admin Helper Utilities
 * 
 * Pure utility functions for the admin panel.
 * These functions have no side effects and are easily testable.
 */

import {
  NewsItem,
  Highlight,
  TeamMember,
  Partner,
  Publication,
} from '../types/admin.types';

/**
 * Factory class for creating empty entities
 * Implements the Factory Pattern for object creation
 */
export class EntityFactory {
  /**
   * Generate a unique ID based on timestamp
   */
  private static generateId(): string {
    return Date.now().toString();
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  private static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Create an empty NewsItem
   */
  static createNewsItem(): NewsItem {
    return {
      id: this.generateId(),
      title: '',
      content: '',
      date: this.getCurrentDate(),
      images: [],
    };
  }

  /**
   * Create an empty Highlight
   */
  static createHighlight(): Highlight {
    return {
      id: this.generateId(),
      title: '',
      description: '',
      imageUrl: '',
      iconName: 'Globe',
    };
  }

  /**
   * Create an empty TeamMember
   */
  static createTeamMember(): TeamMember {
    return {
      id: this.generateId(),
      name: '',
      role: '',
      description: '',
      imageUrl: '',
    };
  }

  /**
   * Create an empty Partner
   */
  static createPartner(): Partner {
    return {
      id: this.generateId(),
      name: '',
      logoUrl: '',
    };
  }

  /**
   * Create an empty Publication
   */
  static createPublication(): Publication {
    return {
      id: this.generateId(),
      title: '',
      authors: '',
      link: '#',
      featured: false,
      pdfUrl: '',
      content: '',
      publishedDate: this.getCurrentDate(),
      excerpt: '',
      sentence: '',
      optionalLinks: '',
      contactInfo: '',
      reference: '',
    };
  }
}

/**
 * Validator class for entity validation
 * Implements the Single Responsibility Principle
 */
export class EntityValidator {
  /**
   * Validate NewsItem before saving
   */
  static validateNewsItem(item: NewsItem): { isValid: boolean; error?: string } {
    if (!item.title.trim()) {
      return { isValid: false, error: 'Title is required' };
    }
    if (!item.content.trim()) {
      return { isValid: false, error: 'Content is required' };
    }
    return { isValid: true };
  }

  /**
   * Validate Highlight before saving
   */
  static validateHighlight(item: Highlight): { isValid: boolean; error?: string } {
    if (!item.title.trim()) {
      return { isValid: false, error: 'Title is required' };
    }
    if (!item.description.trim()) {
      return { isValid: false, error: 'Description is required' };
    }
    return { isValid: true };
  }

  /**
   * Validate TeamMember before saving
   */
  static validateTeamMember(item: TeamMember): { isValid: boolean; error?: string } {
    if (!item.name.trim()) {
      return { isValid: false, error: 'Name is required' };
    }
    if (!item.role.trim()) {
      return { isValid: false, error: 'Role is required' };
    }
    return { isValid: true };
  }

  /**
   * Validate Partner before saving
   */
  static validatePartner(item: Partner): { isValid: boolean; error?: string } {
    if (!item.name.trim()) {
      return { isValid: false, error: 'Name is required' };
    }
    return { isValid: true };
  }

  /**
   * Validate Publication before saving
   */
  static validatePublication(item: Publication): { isValid: boolean; error?: string } {
    if (!item.title.trim()) {
      return { isValid: false, error: 'Title is required' };
    }
    if (!item.authors.trim()) {
      return { isValid: false, error: 'Authors are required' };
    }
    return { isValid: true };
  }
}

/**
 * Check if an item exists in an array by ID
 */
export function itemExists<T extends { id: string }>(
  items: T[],
  id: string
): boolean {
  return items.some(item => item.id === id);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}
