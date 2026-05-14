/**
 * Admin Panel Type Definitions
 * 
 * Centralized type definitions for the admin panel.
 * Follows the Interface Segregation Principle.
 */

import {
  NewsItem,
  Highlight,
  TeamMember,
  Partner,
  Publication,
  BlogPost,
} from '@/app/context/ContentContext';

/**
 * Base entity interface - all entities must have an ID
 */
export interface BaseEntity {
  id: string;
}

/**
 * Modal configuration for each entity type
 */
export interface EntityConfig<T> {
  createEmpty: () => T;
  validateForSave: (item: T) => { isValid: boolean; error?: string };
  entityName: string;
  entityNamePlural: string;
}

/**
 * Quick action button configuration
 */
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: {
    bg: string;
    hover: string;
    iconBg: string;
    iconHover: string;
    iconText: string;
  };
  onClick: () => void;
}

/**
 * Tab configuration
 */
export interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Re-export context types for convenience
 */
export type {
  NewsItem,
  Highlight,
  TeamMember,
  Partner,
  Publication,
  BlogPost,
};
