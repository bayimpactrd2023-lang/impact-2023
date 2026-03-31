/**
 * Validation Utilities
 * 
 * Pure utility functions for validating data.
 * Used for form validation and data integrity checks.
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Contact Form Validator Class
 * 
 * Validates contact form inputs.
 */
export class ContactValidator {
  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  /**
   * Validate name
   */
  static validateName(name: string): ValidationResult {
    if (!name.trim()) {
      return { isValid: false, error: 'Name is required' };
    }

    if (name.trim().length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate message
   */
  static validateMessage(message: string): ValidationResult {
    if (!message.trim()) {
      return { isValid: false, error: 'Message is required' };
    }

    if (message.trim().length < 10) {
      return { isValid: false, error: 'Message must be at least 10 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate entire contact form
   */
  static validateContactForm(data: {
    name: string;
    email: string;
    message: string;
  }): ValidationResult {
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.isValid) return nameValidation;

    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) return emailValidation;

    const messageValidation = this.validateMessage(data.message);
    if (!messageValidation.isValid) return messageValidation;

    return { isValid: true };
  }
}

/**
 * Search Validator Class
 * 
 * Validates search queries.
 */
export class SearchValidator {
  /**
   * Validate search query
   */
  static validateQuery(query: string, minLength: number = 2): ValidationResult {
    if (!query.trim()) {
      return { isValid: false, error: 'Search query cannot be empty' };
    }

    if (query.trim().length < minLength) {
      return {
        isValid: false,
        error: `Search query must be at least ${minLength} characters`,
      };
    }

    return { isValid: true };
  }

  /**
   * Sanitize search query
   */
  static sanitize(query: string): string {
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
}
