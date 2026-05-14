/**
 * Public Components - Main Export
 * 
 * Centralized export for all public-facing components, hooks, and utilities.
 * Use this for clean imports across the application.
 */

// ========================================
// HOOKS
// ========================================
export {
  usePagination,
  useFilter,
  useSearch,
} from './hooks';

export type {
  UsePaginationProps,
  UsePaginationReturn,
  UseFilterProps,
  UseFilterReturn,
  UseSearchProps,
  UseSearchReturn,
} from './hooks';

// ========================================
// UI COMPONENTS
// ========================================
export {
  PageHero,
  ContentCard,
  ContentGrid,
  PaginationControls,
  FilterBar,
  SearchBar,
} from './ui';

export type {
  PageHeroProps,
  ContentCardProps,
  ContentGridProps,
  PaginationControlsProps,
  FilterBarProps,
  SearchBarProps,
} from './ui';

// ========================================
// UTILITY CLASSES
// ========================================
export {
  DateFormatter,
  TextFormatter,
  NumberFormatter,
  URLFormatter,
  ContactValidator,
  SearchValidator,
} from './utils';

export type {
  ValidationResult,
} from './utils';

// ========================================
// TYPES
// ========================================
export type {
  BaseSectionProps,
  HeroConfig,
  PageMetadata,
  CardItem,
  FilterConfig,
  PaginationState,
} from './types/page.types';

// ========================================
// HOME PAGE SECTIONS
// ========================================
export {
  HeroSection,
  HighlightsSection,
  NewsSection,
  PartnersSection,
} from './sections/home';
