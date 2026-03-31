/**
 * Public Pages Type Definitions
 * 
 * Centralized type definitions for public-facing pages.
 * Follows Interface Segregation Principle.
 */

/**
 * Base section props that all sections should extend
 */
export interface BaseSectionProps {
  /** Section ID for navigation/anchoring */
  id?: string;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Hero section configuration
 */
export interface HeroConfig {
  title: string;
  subtitle: string;
  backgroundUrl?: string;
  showParticles?: boolean;
}

/**
 * Page metadata
 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
}

/**
 * Card item interface for grid displays
 */
export interface CardItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  onClick?: () => void;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  label: string;
  value: string;
  count?: number;
}

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}
