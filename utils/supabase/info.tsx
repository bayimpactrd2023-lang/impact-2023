/**
 * Supabase Configuration
 * 
 * IMPORTANT: Update these values with your own Supabase project credentials
 * before deploying to production.
 * 
 * Get your credentials from:
 * Supabase Dashboard → Project Settings → API
 */

export const projectId = import.meta.env.VITE_SUPABASE_URL
  ?.replace("https://", "")
  .replace(".supabase.co", "");

export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;