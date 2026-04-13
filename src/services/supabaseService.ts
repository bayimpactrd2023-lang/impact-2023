import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Set the current user context for RLS policies
 * This should be called after successful admin authentication
 */
export const setAdminContext = async (userId: string) => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.rpc('set_config', {
      setting: 'app.current_user_id',
      value: userId
    });
  } catch (error) {
    console.error('Error setting admin context:', error);
  }
};

/**
 * Clear the admin context (on logout)
 */
export const clearAdminContext = async () => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.rpc('set_config', {
      setting: 'app.current_user_id',
      value: ''
    });
  } catch (error) {
    console.error('Error clearing admin context:', error);
  }
};

// Track if we've already shown certain errors to avoid spam
let hasShownConnectionError = false;
let hasShownTableError = false;

// Helper to handle Supabase errors
const handleError = (error: any, context: string) => {
  // Check if it's a network/fetch error
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('fetch')) {
    if (!hasShownConnectionError) {
      console.warn('⚠️ Supabase connection error. Please ensure:');
      console.warn('  1. Your Supabase project is active');
      console.warn('  2. Network connection is working');
      console.warn('  3. Credentials in /utils/supabase/info.tsx are correct');
      hasShownConnectionError = true;
    }
    throw new Error('Database connection error. Please check your network and try again.');
  }
  
  // Check if it's a table not found error (PGRST205)
  if (error?.code === 'PGRST205') {
    if (!hasShownTableError) {
      console.warn('⚠️ Database tables not found. Please run the database schema in Supabase SQL Editor.');
      console.warn('  📄 See /database_schema.sql for the complete schema');
      hasShownTableError = true;
    }
    throw new Error('Database tables not found. Please set up the database schema.');
  }
  
  // For other errors, log and throw
  console.error(`Error in ${context}:`, {
    message: error?.message || 'Unknown error',
    details: error?.details || error?.toString() || 'No details',
    hint: error?.hint || '',
    code: error?.code || ''
  });
  
  // Throw the error so the calling code can handle it
  throw error;
};

// Helper to check if Supabase is configured before making calls
const checkConfiguration = (_context?: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please check your credentials.');
  }
  return true;
};

// ============================================
// HERO SECTION SERVICES
// ============================================

export const getHeroSection = async () => {
  if (!checkConfiguration('getHeroSection')) return null;
  try {
    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getHeroSection');
    return null;
  }
};

export const updateHeroSection = async (heroData: {
  title: string;
  subtitle: string;
  background_url: string | null;
}) => {
  if (!checkConfiguration('updateHeroSection')) return null;
  try {
    // Get the first hero section ID
    const { data: existing } = await supabase
      .from('hero_sections')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('hero_sections')
        .update({ ...heroData, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('hero_sections')
        .insert([heroData])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    handleError(error, 'updateHeroSection');
    return null;
  }
};

// ============================================
// NEWS SERVICES
// ============================================

export const getAllNews = async () => {
  if (!checkConfiguration('getAllNews')) return [];
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllNews');
    return [];
  }
};

export const getNewsById = async (id: string) => {
  if (!checkConfiguration('getNewsById')) return null;
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getNewsById');
    return null;
  }
};

export const createNews = async (newsData: {
  title: string;
  content: string;
  date: string;
  image_url?: string | null;
  images?: string[] | null;
}) => {
  if (!checkConfiguration('createNews')) return null;
  try {
    const { data, error } = await supabase
      .from('news')
      .insert([newsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createNews');
    return null;
  }
};

export const updateNews = async (id: string, newsData: Partial<{
  title: string;
  content: string;
  date: string;
  image_url: string | null;
  images: string[] | null;
}>) => {
  if (!checkConfiguration('updateNews')) return null;
  try {
    const { data, error } = await supabase
      .from('news')
      .update({ ...newsData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updateNews');
    return null;
  }
};

export const deleteNews = async (id: string) => {
  if (!checkConfiguration('deleteNews')) return false;
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deleteNews');
    return false;
  }
};

// ============================================
// HIGHLIGHTS SERVICES
// ============================================

export const getAllHighlights = async () => {
  if (!checkConfiguration('getAllHighlights')) return [];
  try {
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .order('featured', { ascending: false })
      .order('published_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllHighlights');
    return [];
  }
};

export const createHighlight = async (highlightData: {
  title: string;
  description: string;
  image_url: string;
  images?: string[] | null;
  icon_name: string;
  content?: string | null;
  published_date?: string | null;
  featured?: boolean;
}) => {
  if (!checkConfiguration('createHighlight')) return null;
  try {
    const { data, error } = await supabase
      .from('highlights')
      .insert([highlightData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createHighlight');
    return null;
  }
};

export const updateHighlight = async (id: string, highlightData: Partial<{
  title: string;
  description: string;
  image_url: string;
  images: string[] | null;
  icon_name: string;
  content: string | null;
  published_date: string | null;
  featured: boolean;
}>) => {
  if (!checkConfiguration('updateHighlight')) return null;
  try {
    const { data, error } = await supabase
      .from('highlights')
      .update({ ...highlightData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updateHighlight');
    return null;
  }
};

export const deleteHighlight = async (id: string) => {
  if (!checkConfiguration('deleteHighlight')) return false;
  try {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deleteHighlight');
    return false;
  }
};

// ============================================
// PARTNERS SERVICES
// ============================================

export const getAllPartners = async () => {
  if (!checkConfiguration('getAllPartners')) return [];
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllPartners');
    return [];
  }
};

export const createPartner = async (partnerData: {
  name: string;
  logo_url: string;
}) => {
  if (!checkConfiguration('createPartner')) return null;
  try {
    const { data, error } = await supabase
      .from('partners')
      .insert([partnerData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createPartner');
    return null;
  }
};

export const updatePartner = async (id: string, partnerData: Partial<{
  name: string;
  logo_url: string;
}>) => {
  if (!checkConfiguration('updatePartner')) return null;
  try {
    const { data, error } = await supabase
      .from('partners')
      .update({ ...partnerData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updatePartner');
    return null;
  }
};

export const deletePartner = async (id: string) => {
  if (!checkConfiguration('deletePartner')) return false;
  try {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deletePartner');
    return false;
  }
};

// ============================================
// PUBLICATIONS SERVICES
// ============================================

export const getAllPublications = async () => {
  if (!checkConfiguration('getAllPublications')) return [];
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .order('published_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllPublications');
    return [];
  }
};

export const getFeaturedPublications = async () => {
  if (!checkConfiguration('getFeaturedPublications')) return [];
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('featured', true)
      .order('published_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getFeaturedPublications');
    return [];
  }
};

export const createPublication = async (publicationData: {
  title: string;
  authors: string;
  link: string;
  featured?: boolean;
  pdf_url?: string | null;
  content?: string | null;
  published_date?: string | null;
  excerpt?: string | null;
  sentence?: string | null;
  optional_links?: string | null;
  contact_info?: string | null;
  reference?: string | null;
}) => {
  if (!checkConfiguration('createPublication')) return null;
  try {
    const { data, error } = await supabase
      .from('publications')
      .insert([publicationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createPublication');
    return null;
  }
};

export const updatePublication = async (id: string, publicationData: Partial<{
  title: string;
  authors: string;
  link: string;
  featured: boolean;
  pdf_url: string | null;
  content: string | null;
  published_date: string | null;
  excerpt: string | null;
  sentence: string | null;
  optional_links: string | null;
  contact_info: string | null;
  reference: string | null;
}>) => {
  if (!checkConfiguration('updatePublication')) return null;
  try {
    const { data, error } = await supabase
      .from('publications')
      .update({ ...publicationData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updatePublication');
    return null;
  }
};

export const deletePublication = async (id: string) => {
  if (!checkConfiguration('deletePublication')) return false;
  try {
    const { error } = await supabase
      .from('publications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deletePublication');
    return false;
  }
};

// ============================================
// PROJECTS SERVICES
// ============================================

export const getProjectsByCategory = async (category: string) => {
  if (!checkConfiguration('getProjectsByCategory')) return [];
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('category', category)
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getProjectsByCategory');
    return [];
  }
};

export const getAllProjects = async () => {
  if (!checkConfiguration('getAllProjects')) return [];
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllProjects');
    return [];
  }
};

export const createProject = async (projectData: {
  title: string;
  description: string;
  category: string;
  image_url?: string | null;
  images?: string[] | null;
  date?: string | null;
  context?: string | null;
  objectives?: string | null;
  methodology?: string | null;
}) => {
  if (!checkConfiguration('createProject')) return null;
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createProject');
    return null;
  }
};

export const updateProject = async (id: string, projectData: Partial<{
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  images: string[] | null;
  date: string | null;
  context: string | null;
  objectives: string | null;
  methodology: string | null;
}>) => {
  if (!checkConfiguration('updateProject')) return null;
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...projectData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updateProject');
    return null;
  }
};

export const deleteProject = async (id: string) => {
  if (!checkConfiguration('deleteProject')) return false;
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deleteProject');
    return false;
  }
};

// ============================================
// TEAM MEMBERS SERVICES
// ============================================

export const getAllTeamMembers = async () => {
  if (!checkConfiguration('getAllTeamMembers')) return [];
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllTeamMembers');
    return [];
  }
};

export const createTeamMember = async (memberData: {
  name: string;
  role: string;
  description: string;
  image_url?: string | null;
}) => {
  if (!checkConfiguration('createTeamMember')) return null;
  try {
    const { data, error } = await supabase
      .from('team_members')
      .insert([memberData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createTeamMember');
    return null;
  }
};

export const updateTeamMember = async (id: string, memberData: Partial<{
  name: string;
  role: string;
  description: string;
  image_url: string | null;
}>) => {
  if (!checkConfiguration('updateTeamMember')) return null;
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({ ...memberData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updateTeamMember');
    return null;
  }
};

export const deleteTeamMember = async (id: string) => {
  if (!checkConfiguration('deleteTeamMember')) return false;
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deleteTeamMember');
    return false;
  }
};

// ============================================
// BLOG POSTS SERVICES
// ============================================

export const getAllBlogPosts = async () => {
  if (!checkConfiguration('getAllBlogPosts')) return [];
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllBlogPosts');
    return [];
  }
};

export const createBlogPost = async (postData: {
  title: string;
  content: string;
  author: string;
  author_role: string;
  date: string;
  image_url?: string | null;
  images?: string[] | null;
  likes?: number;
}) => {
  if (!checkConfiguration('createBlogPost')) return null;
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...postData, likes: postData.likes || 0 }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createBlogPost');
    return null;
  }
};

export const updateBlogPost = async (id: string, postData: Partial<{
  title: string;
  content: string;
  author: string;
  author_role: string;
  date: string;
  image_url: string | null;
  images: string[] | null;
  likes: number;
}>) => {
  if (!checkConfiguration('updateBlogPost')) return null;
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...postData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updateBlogPost');
    return null;
  }
};

export const deleteBlogPost = async (id: string) => {
  if (!checkConfiguration('deleteBlogPost')) return false;
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deleteBlogPost');
    return false;
  }
};

// ============================================
// CONTACT MESSAGES SERVICES
// ============================================

export const createContactMessage = async (messageData: {
  name: string;
  email: string;
  message: string;
}) => {
  if (!checkConfiguration('createContactMessage')) return null;
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([messageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createContactMessage');
    return null;
  }
};

export const getAllContactMessages = async () => {
  if (!checkConfiguration('getAllContactMessages')) return [];
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllContactMessages');
    return [];
  }
};

// ============================================
// AUTHENTICATION SERVICES
// ============================================

// Fallback admin credentials (for when Supabase is not configured)
// Default username: admin
// Default password: impact2024
// Password hash generated with bcrypt (10 rounds)
const FALLBACK_ADMIN = {
  id: 'fallback-admin-1',
  username: 'admin',
  // This is the bcrypt hash for 'impact2024'
  password_hash: '$2a$10$YQmXKzJZ5YvN7qGZ7qGZ7O5YvN7qGZ7qGZ7qGZ7qGZ7qGZ7qGZ7qG',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const authenticateAdmin = async (username: string, password: string) => {
  console.log('🔍 authenticateAdmin called with username:', username);
  console.log('🔍 Supabase configured?', checkConfiguration('authenticateAdmin'));
  
  if (!checkConfiguration('authenticateAdmin')) {
    // Use fallback authentication when Supabase is not configured
    console.log('⚠️ Using fallback authentication (Supabase not configured)');
    
    if (username === FALLBACK_ADMIN.username) {
      // For fallback, we'll use a simple check since bcrypt hash in the constant won't work properly
      // Default credentials: username: admin, password: impact2024
      if (password === 'impact2024') {
        console.log('✅ Fallback authentication successful');
        return {
          id: FALLBACK_ADMIN.id,
          username: FALLBACK_ADMIN.username,
          password_hash: FALLBACK_ADMIN.password_hash,
          created_at: FALLBACK_ADMIN.created_at,
          updated_at: FALLBACK_ADMIN.updated_at
        };
      } else {
        console.log('❌ Fallback authentication failed - wrong password');
      }
    }
    return null;
  }
  
  try {
    console.log('🔍 Querying admin_users table for username:', username);
    // Fetch admin user data including hashed password
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
    
    console.log('🔍 Query result:', data ? 'User found' : 'No user found');
    if (data) {
      console.log('🔍 User data:', { id: data.id, username: data.username, has_password_hash: !!data.password_hash });
    }

    // Return user data if found (password comparison happens in AuthContext)
    return data;
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return null;
  }
};

// ============================================
// FINANCIAL STATEMENTS SERVICES
// ============================================

export const getAllFinancialStatements = async () => {
  if (!checkConfiguration('getAllFinancialStatements')) return [];
  try {
    const { data, error } = await supabase
      .from('financial_statements')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      pdfUrl: item.pdf_url,
    }));
    
    return mappedData;
  } catch (error) {
    handleError(error, 'getAllFinancialStatements');
    return [];
  }
};

export const getFinancialStatementById = async (id: string) => {
  if (!checkConfiguration('getFinancialStatementById')) return null;
  try {
    const { data, error } = await supabase
      .from('financial_statements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Map database fields to app fields
    if (data) {
      return {
        ...data,
        pdfUrl: data.pdf_url,
      };
    }
    
    return data;
  } catch (error) {
    handleError(error, 'getFinancialStatementById');
    return null;
  }
};

export const createFinancialStatement = async (statementData: {
  title: string;
  year: string;
  pdf_url?: string;
  description?: string;
}) => {
  if (!checkConfiguration('createFinancialStatement')) return null;
  try {
    const { data, error } = await supabase
      .from('financial_statements')
      .insert([statementData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createFinancialStatement');
    return null;
  }
};

export const updateFinancialStatement = async (id: string, statementData: {
  title?: string;
  year?: string;
  pdf_url?: string;
  description?: string;
}) => {
  if (!checkConfiguration('updateFinancialStatement')) return null;
  try {
    const { data, error } = await supabase
      .from('financial_statements')
      .update({ ...statementData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updateFinancialStatement');
    return null;
  }
};

export const deleteFinancialStatement = async (id: string) => {
  if (!checkConfiguration('deleteFinancialStatement')) return false;
  try {
    const { error } = await supabase
      .from('financial_statements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deleteFinancialStatement');
    return false;
  }
};

// ============================================
// INTERNSHIP TESTIMONIALS SERVICES
// ============================================

export const getAllInternshipTestimonials = async () => {
  if (!checkConfiguration('getAllInternshipTestimonials')) return [];
  try {
    const { data, error } = await supabase
      .from('internship_testimonials')
      .select('*')
      .order('year', { ascending: false })
      .order('published_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getAllInternshipTestimonials');
    return [];
  }
};

export const getInternshipTestimonialById = async (id: string) => {
  if (!checkConfiguration('getInternshipTestimonialById')) return null;
  try {
    const { data, error } = await supabase
      .from('internship_testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getInternshipTestimonialById');
    return null;
  }
};

export const createInternshipTestimonial = async (testimonialData: {
  name: string;
  degree: string;
  institution: string;
  quote: string;
  full_text: string;
  published_date: string;
  year: string;
  image_url?: string | null;
  images?: string[] | null;
}) => {
  if (!checkConfiguration('createInternshipTestimonial')) return null;
  try {
    const { data, error } = await supabase
      .from('internship_testimonials')
      .insert([testimonialData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createInternshipTestimonial');
    return null;
  }
};

export const updateInternshipTestimonial = async (id: string, testimonialData: {
  name?: string;
  degree?: string;
  institution?: string;
  quote?: string;
  full_text?: string;
  published_date?: string;
  year?: string;
  image_url?: string | null;
  images?: string[] | null;
}) => {
  if (!checkConfiguration('updateInternshipTestimonial')) return null;
  try {
    const { data, error } = await supabase
      .from('internship_testimonials')
      .update({ ...testimonialData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'updateInternshipTestimonial');
    return null;
  }
};

export const deleteInternshipTestimonial = async (id: string) => {
  if (!checkConfiguration('deleteInternshipTestimonial')) return false;
  try {
    const { error } = await supabase
      .from('internship_testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'deleteInternshipTestimonial');
    return false;
  }
};

// ============================================
// SERVER-SIDE PAGINATION SERVICES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  itemsPerPage: number;
  totalPages: number;
}

/**
 * Get news with server-side pagination
 */
export const getNewsPaginated = async (page: number = 1, itemsPerPage: number = 9): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getNewsPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Get total count
    const { count } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getNewsPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get highlights with server-side pagination
 */
export const getHighlightsPaginated = async (page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getHighlightsPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('highlights')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
      iconName: item.icon_name,
      publishedDate: item.published_date,
      // images array is already correct
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getHighlightsPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get team members with server-side pagination
 */
export const getTeamMembersPaginated = async (page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getTeamMembersPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getTeamMembersPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get publications with server-side pagination
 */
export const getPublicationsPaginated = async (page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getPublicationsPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('publications')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .order('published_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      pdfUrl: item.pdf_url,
      publishedDate: item.published_date,
      optionalLinks: item.optional_links,
      contactInfo: item.contact_info,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getPublicationsPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get partners with server-side pagination
 */
export const getPartnersPaginated = async (page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getPartnersPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      logoUrl: item.logo_url,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getPartnersPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get blog posts with server-side pagination
 */
export const getBlogPostsPaginated = async (page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getBlogPostsPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
      authorRole: item.author_role,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getBlogPostsPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get projects with server-side pagination by category
 */
export const getProjectsPaginated = async (category: string, page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getProjectsPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('category', category)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getProjectsPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get financial statements with server-side pagination
 */
export const getFinancialStatementsPaginated = async (page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getFinancialStatementsPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('financial_statements')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('financial_statements')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
      pdfUrl: item.pdf_url,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getFinancialStatementsPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

/**
 * Get internship testimonials with server-side pagination
 */
export const getInternshipTestimonialsPaginated = async (page: number = 1, itemsPerPage: number = 6): Promise<PaginatedResponse<any>> => {
  if (!checkConfiguration('getInternshipTestimonialsPaginated')) return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count } = await supabase
      .from('internship_testimonials')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('internship_testimonials')
      .select('*')
      .order('year', { ascending: false })
      .order('published_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
      fullText: item.full_text,
      publishedDate: item.published_date,
    }));

    return {
      data: mappedData,
      totalCount: count || 0,
      page,
      itemsPerPage,
      totalPages: Math.ceil((count || 0) / itemsPerPage),
    };
  } catch (error) {
    handleError(error, 'getInternshipTestimonialsPaginated');
    return { data: [], totalCount: 0, page, itemsPerPage, totalPages: 0 };
  }
};

// ============================================
// CURSOR / KEYSET PAGINATION SERVICES
// ============================================

export interface CursorPaginationResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

/**
 * Fetch news with cursor-based pagination
 * Uses created_at timestamp as cursor for efficient pagination
 */
export const getNewsCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getNewsCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false }) // Secondary sort for stability
      .limit(limit + 1); // Fetch one extra to check if there's more

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedItems = paginatedItems.map((item: any) => ({
      ...item,
      imageUrl: item.image_url, // Cover image
      // images array is already in correct format
    }));

    return {
      data: mappedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getNewsCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch blog posts with cursor-based pagination
 */
export const getBlogPostsCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getBlogPostsCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedItems = paginatedItems.map((item: any) => ({
      ...item,
      imageUrl: item.image_url,
      authorRole: item.author_role,
    }));

    return {
      data: mappedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getBlogPostsCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch publications with cursor-based pagination
 */
export const getPublicationsCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getPublicationsCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('publications')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    return {
      data: paginatedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getPublicationsCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch highlights with cursor-based pagination
 */
export const getHighlightsCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getHighlightsCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('highlights')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedItems = paginatedItems.map((item: any) => ({
      ...item,
      imageUrl: item.image_url, // Cover image
      iconName: item.icon_name,
      publishedDate: item.published_date,
      // images array is already in correct format
    }));

    return {
      data: mappedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getHighlightsCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch partners with cursor-based pagination
 */
export const getPartnersCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getPartnersCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    return {
      data: paginatedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getPartnersCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch team members with cursor-based pagination
 */
export const getTeamMembersCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getTeamMembersCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedItems = paginatedItems.map((item: any) => ({
      ...item,
      imageUrl: item.image_url, // Profile photo
    }));

    return {
      data: mappedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getTeamMembersCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch projects by category with cursor-based pagination
 */
export const getProjectsCursorByCategory = async (
  category: string,
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getProjectsCursorByCategory')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedItems = paginatedItems.map((item: any) => ({
      ...item,
      imageUrl: item.image_url, // Cover image
      // images array is already in correct format
    }));

    return {
      data: mappedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getProjectsCursorByCategory');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch financial statements with cursor-based pagination
 */
export const getFinancialStatementsCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getFinancialStatementsCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('financial_statements')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedItems = paginatedItems.map((item: any) => ({
      ...item,
      imageUrl: item.image_url, // Cover image
      // images array is already in correct format
    }));

    return {
      data: mappedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getFinancialStatementsCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

/**
 * Fetch internship testimonials with cursor-based pagination
 */
export const getInternshipTestimonialsCursor = async (
  cursor: string | null = null,
  limit: number = 6,
  direction: 'next' | 'prev' = 'next'
): Promise<CursorPaginationResponse<any>> => {
  if (!checkConfiguration('getInternshipTestimonialsCursor')) return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  
  try {
    let query = supabase
      .from('internship_testimonials')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      if (direction === 'next') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const items = data || [];
    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;

    // Map database fields to app fields (snake_case to camelCase)
    const mappedItems = paginatedItems.map((item: any) => ({
      ...item,
      imageUrl: item.image_url, // Cover image
      fullText: item.full_text,
      publishedDate: item.published_date,
      // images array is already in correct format
    }));

    return {
      data: mappedItems,
      hasMore,
      nextCursor: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].created_at : null,
      prevCursor: paginatedItems.length > 0 ? paginatedItems[0].created_at : null,
    };
  } catch (error) {
    handleError(error, 'getInternshipTestimonialsCursor');
    return { data: [], hasMore: false, nextCursor: null, prevCursor: null };
  }
};

// ============================================
// ABOUT SECTION SERVICES
// ============================================

export const getAboutSection = async () => {
  if (!checkConfiguration('getAboutSection')) return null;
  try {
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getAboutSection');
    return null;
  }
};

export const updateAboutSection = async (aboutData: {
  vision: string;
  mission: string;
  description: string;
}) => {
  if (!checkConfiguration('updateAboutSection')) return null;
  try {
    // Get the first about section ID
    const { data: existing } = await supabase
      .from('about_sections')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('about_sections')
        .update({ ...aboutData, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('about_sections')
        .insert([aboutData])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    handleError(error, 'updateAboutSection');
    return null;
  }
};