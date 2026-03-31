/**
 * Formatting Utilities
 * 
 * Pure utility functions for formatting data for display.
 * All functions are stateless and side-effect free.
 */

/**
 * Date Formatter Class
 * 
 * Provides various date formatting methods.
 */
export class DateFormatter {
  /**
   * Format date to long format (January 1, 2024)
   */
  static toLongFormat(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Format date to short format (Jan 1, 2024)
   */
  static toShortFormat(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get relative time (e.g., "2 days ago")
   */
  static toRelativeTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return dateString;
    }
  }
}

/**
 * Text Formatter Class
 * 
 * Provides text manipulation and formatting methods.
 */
export class TextFormatter {
  /**
   * Truncate text to specified length with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  }

  /**
   * Extract excerpt from content (first paragraph or N words)
   */
  static toExcerpt(content: string, wordLimit: number = 30): string {
    const words = content.trim().split(/\s+/);
    if (words.length <= wordLimit) return content;
    return words.slice(0, wordLimit).join(' ') + '...';
  }

  /**
   * Convert to title case
   */
  static toTitleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Slugify text for URLs
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

/**
 * Number Formatter Class
 * 
 * Provides number formatting methods.
 */
export class NumberFormatter {
  /**
   * Format number with commas (e.g., 1,234,567)
   */
  static withCommas(num: number): string {
    return num.toLocaleString('en-US');
  }

  /**
   * Format as abbreviated (e.g., 1.2K, 3.4M)
   */
  static toAbbreviated(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  /**
   * Format as percentage
   */
  static toPercentage(num: number, decimals: number = 0): string {
    return num.toFixed(decimals) + '%';
  }
}

/**
 * URL Formatter Class
 * 
 * Provides URL manipulation methods.
 */
export class URLFormatter {
  /**
   * Ensure URL has protocol
   */
  static ensureProtocol(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  /**
   * Extract domain from URL
   */
  static getDomain(url: string): string {
    try {
      const urlObj = new URL(this.ensureProtocol(url));
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
}
