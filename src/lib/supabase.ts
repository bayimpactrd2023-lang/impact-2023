import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Use Supabase credentials from Figma Make settings
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(projectId && publicAnonKey);
};

// Helper to get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper to check if current user is admin
export const isCurrentUserAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const role = user.user_metadata?.role || user.app_metadata?.role;
  return role === 'admin';
};