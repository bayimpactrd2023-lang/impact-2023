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
  NewsItemForm,
  HighlightForm,
  TeamMemberForm,
  PartnerForm,
  PublicationForm,
} from '@/app/context/ContentContext';

export const AdminValidationRules = {
  shortTitleMaxChars: 1000,
  shortTitleMaxWords: 1000,
  shortTextMaxChars: 2000, // ~300 words for descriptions
  shortTextMaxWords: 300,
  nameMaxChars: 80,
  nameMaxWords: 10,
  roleMaxChars: 80,
  roleMaxWords: 12,
  authorsMaxChars: 200,
  authorsMaxWords: 35,
  contentMaxChars: 35000, // ~5000 words max
} as const;

const digitsRegex = /\d/;

export function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function validateMaxChars(value: string, maxChars: number, fieldLabel: string) {
  if (value.length > maxChars) {
    return {
      isValid: false,
      error: `${fieldLabel} must be ${maxChars} characters or fewer`,
    };
  }
  return { isValid: true };
}

export function validateMaxWords(value: string, maxWords: number, fieldLabel: string) {
  if (countWords(value) > maxWords) {
    return {
      isValid: false,
      error: `${fieldLabel} must be ${maxWords} words or fewer`,
    };
  }
  return { isValid: true };
}

export function validateNoDigits(value: string, fieldLabel: string) {
  if (digitsRegex.test(value)) {
    return {
      isValid: false,
      error: `${fieldLabel} must not contain numbers`,
    };
  }
  return { isValid: true };
}

export function validateRequiredTrimmed(value: string, fieldLabel: string) {
  if (!value.trim()) {
    return { isValid: false, error: `${fieldLabel} is required` };
  }
  return { isValid: true };
}

export function mergeValidationResults(
  ...results: Array<{ isValid: boolean; error?: string }>
): { isValid: boolean; error?: string } {
  for (const r of results) {
    if (!r.isValid) return r;
  }
  return { isValid: true };
}

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
   * Validate NewsItem before saving (accepts Form type with File support)
   */
  static validateNewsItem(item: NewsItem | NewsItemForm): { isValid: boolean; error?: string } {
    return mergeValidationResults(
      validateRequiredTrimmed(item.title, 'Title'),
      validateMaxChars(item.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(item.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(item.content, 'Content'),
      validateMaxChars(item.content.trim(), AdminValidationRules.contentMaxChars, 'Content')
    );
  }

  /**
   * Validate Highlight before saving (accepts Form type with File support)
   */
  static validateHighlight(item: Highlight | HighlightForm): { isValid: boolean; error?: string } {
    return mergeValidationResults(
      validateRequiredTrimmed(item.title, 'Title'),
      validateMaxChars(item.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(item.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(item.description, 'Description'),
      validateMaxChars(item.description.trim(), AdminValidationRules.shortTextMaxChars, 'Description'),
      validateMaxWords(item.description.trim(), AdminValidationRules.shortTextMaxWords, 'Description'),
      validateMaxChars((item.content || '').trim(), AdminValidationRules.contentMaxChars, 'Detailed content')
    );
  }

  /**
   * Validate TeamMember before saving (accepts Form type with File support)
   */
  static validateTeamMember(item: TeamMember | TeamMemberForm): { isValid: boolean; error?: string } {
    return mergeValidationResults(
      validateRequiredTrimmed(item.name, 'Name'),
      validateNoDigits(item.name, 'Name'),
      validateMaxChars(item.name.trim(), AdminValidationRules.nameMaxChars, 'Name'),
      validateMaxWords(item.name.trim(), AdminValidationRules.nameMaxWords, 'Name'),
      validateRequiredTrimmed(item.role, 'Role'),
      validateNoDigits(item.role, 'Role'),
      validateMaxChars(item.role.trim(), AdminValidationRules.roleMaxChars, 'Role'),
      validateMaxWords(item.role.trim(), AdminValidationRules.roleMaxWords, 'Role'),
      validateMaxChars((item.description || '').trim(), AdminValidationRules.contentMaxChars, 'Biography')
    );
  }

  /**
   * Validate Partner before saving (accepts Form type with File support)
   */
  static validatePartner(item: Partner | PartnerForm): { isValid: boolean; error?: string } {
    return mergeValidationResults(
      validateRequiredTrimmed(item.name, 'Name'),
      validateMaxChars(item.name.trim(), AdminValidationRules.nameMaxChars, 'Name'),
      validateMaxWords(item.name.trim(), AdminValidationRules.nameMaxWords, 'Name')
    );
  }

  /**
   * Validate Publication before saving (accepts Form type with File support)
   */
  static validatePublication(item: Publication | PublicationForm): { isValid: boolean; error?: string } {
    return mergeValidationResults(
      validateRequiredTrimmed(item.title, 'Title'),
      validateMaxChars(item.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(item.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(item.authors, 'Authors'),
      validateNoDigits(item.authors, 'Authors'),
      validateMaxChars(item.authors.trim(), AdminValidationRules.authorsMaxChars, 'Authors'),
      validateMaxWords(item.authors.trim(), AdminValidationRules.authorsMaxWords, 'Authors'),
      validateMaxChars((item.content || '').trim(), AdminValidationRules.contentMaxChars, 'Abstract/Description'),
      validateMaxChars((item.excerpt || '').trim(), AdminValidationRules.shortTextMaxChars, 'Excerpt'),
      validateMaxWords((item.excerpt || '').trim(), AdminValidationRules.shortTextMaxWords, 'Excerpt'),
      validateMaxChars((item.sentence || '').trim(), AdminValidationRules.shortTextMaxChars, 'Sentence'),
      validateMaxWords((item.sentence || '').trim(), AdminValidationRules.shortTextMaxWords, 'Sentence')
    );
  }
}

/**
 * Deep equality check for form objects to prevent redundant updates.
 * Only compares values that are part of the form state.
 */
export function hasChanges(original: any, current: any): boolean {
  if (!original || !current) return true;
  
  const keys = Object.keys(current);
  for (const key of keys) {
    const origVal = original[key];
    const currVal = current[key];
    
    // Handle null/undefined comparison
    if (origVal === currVal) continue;
    
    // Handle arrays (e.g., images)
    if (Array.isArray(origVal) && Array.isArray(currVal)) {
      if (origVal.length !== currVal.length) return true;
      for (let i = 0; i < origVal.length; i++) {
        if (origVal[i] !== currVal[i]) return true;
      }
      continue;
    }
    
    // Handle files (always consider changed if new file is selected)
    if (currVal instanceof File) return true;
    
    // Handle objects (recursive check if needed, but form data is usually flat)
    if (typeof currVal === 'object' && currVal !== null && origVal !== null) {
      if (hasChanges(origVal, currVal)) return true;
      continue;
    }

    // Default primitive comparison
    if (origVal !== currVal) return true;
  }
  
  return false;
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
