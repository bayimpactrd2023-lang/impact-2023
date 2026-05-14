/**
 * Admin Services - Centralized exports
 * Organized by feature/entity
 */

// News operations
export * from './newsService';

// Highlights operations
export * from './highlightsService';

// Re-export from main supabase service for backward compatibility
export {
  createPartner,
  updatePartner,
  deletePartner,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createPublication,
  updatePublication,
  deletePublication,
  updateHeroSection,
  updateAboutSection,
} from '../supabaseService';
