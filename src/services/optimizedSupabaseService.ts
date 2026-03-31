/**
 * Optimized Supabase Service
 *
 * This service wraps the standard supabaseService with:
 * - Aggressive caching (memory + localStorage)
 * - Request deduplication
 * - Field selection optimization
 * - Image URL optimization with Supabase transformations
 * - Stale-while-revalidate for better UX
 *
 * Use this service instead of the regular supabaseService for public-facing queries
 * to drastically reduce egress costs.
 */

import * as originalService from './supabaseService';
import { cachedFetch, generateCacheKey, invalidateByPrefix, CacheConfig } from '@/utils/cache';
import { supabase } from '@/lib/supabase';

// Field Selection Patterns - Only fetch what we need
const FIELD_SELECTIONS = {
  // News - reduced fields for list views
  newsList: 'id,title,content,date,image_url,images',
  newsDetail: 'id,title,content,date,image_url,images',

  // Highlights - reduced for list, full for detail
  highlightsList: 'id,title,description,image_url,images,icon_name,published_date,featured',
  highlightsDetail: 'id,title,description,content,image_url,images,icon_name,published_date,featured',

  // Publications
  publicationsList: 'id,title,authors,published_date,featured,sentence,pdf_url,pdf_access_type,link,excerpt,content',
  publicationsDetail: '*',

  // Partners
  partnersList: 'id,name,logo_url',

  // Team Members
  teamList: 'id,name,role,image_url',
  teamDetail: 'id,name,role,description,image_url',

  // Blog Posts
  blogList: 'id,title,author,author_role,date,image_url,images,likes,content',
  blogDetail: '*',

  // Projects
  projectsList: 'id,title,description,image_url,images,date,category,context,objectives,methodology',
  projectsDetail: '*',

  // Financial Statements
  financialList: 'id,title,year,pdf_url,description,pdf_access_type',

  // Testimonials
  testimonialsList: 'id,name,degree,institution,quote,full_text,year,published_date,images',
  testimonialsDetail: '*',

  // Hero & About
  hero: 'id,title,subtitle,background_url',
  about: 'id,description,vision,mission',
};

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  // Long cache for rarely changing data
  static: 30 * 60 * 1000, // 30 minutes

  // Medium cache for somewhat dynamic data
  content: 10 * 60 * 1000, // 10 minutes

  // Short cache for frequently changing data
  dynamic: 2 * 60 * 1000, // 2 minutes
};

// Default cache config
const defaultCacheConfig: CacheConfig = {
  ttl: CACHE_TTL.content,
  staleWhileRevalidate: true,
  compress: true,
  maxSize: 10 * 1024, // 10KB
};

/**
 * Optimize image URLs with Supabase transformations
 * Reduces bandwidth by serving appropriately sized images
 */
export function optimizeImageUrl(url: string | null | undefined, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg';
}): string {
  if (!url) return '';

  // If it's a Supabase storage URL, add transformation params
  if (url.includes('.supabase.co/storage/v1/object')) {
    const { width, height, quality = 80, format = 'webp' } = options || {};

    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', format);

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  return url;
}

/**
 * Optimize image arrays
 */
export function optimizeImageArray(images: string[] | null | undefined, options?: Parameters<typeof optimizeImageUrl>[1]): string[] {
  if (!images || !Array.isArray(images)) return [];
  return images.map(url => optimizeImageUrl(url, options));
}

// ============================================
// HERO SECTION
// ============================================

export const getHeroSection = async () => {
  const cacheKey = generateCacheKey('hero', 'main');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('hero_sections')
        .select(FIELD_SELECTIONS.hero)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.static }
  );
};

// ============================================
// ABOUT SECTION
// ============================================

export const getAboutSection = async () => {
  const cacheKey = generateCacheKey('about', 'main');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('about_sections')
        .select(FIELD_SELECTIONS.about)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.static }
  );
};

// ============================================
// NEWS
// ============================================

export const getAllNews = async () => {
  const cacheKey = generateCacheKey('news', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('news')
        .select(FIELD_SELECTIONS.newsList)
        .order('date', { ascending: false });

      if (error) throw error;

      // Optimize images
      return (data || []).map(item => ({
        ...item,
        image_url: optimizeImageUrl(item.image_url, { width: 800, quality: 75 }),
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

export const getNewsById = async (id: string) => {
  const cacheKey = generateCacheKey('news', 'detail', id);

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('news')
        .select(FIELD_SELECTIONS.newsDetail)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Optimize images
      return {
        ...data,
        image_url: optimizeImageUrl(data.image_url, { width: 1200, quality: 80 }),
        images: optimizeImageArray(data.images, { width: 1200, quality: 80 }),
      };
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

// ============================================
// HIGHLIGHTS
// ============================================

export const getAllHighlights = async () => {
  const cacheKey = generateCacheKey('highlights', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('highlights')
        .select(FIELD_SELECTIONS.highlightsList)
        .order('published_date', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Optimize images
      return (data || []).map(item => ({
        ...item,
        image_url: optimizeImageUrl(item.image_url, { width: 800, quality: 75 }),
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

export const getHighlightsPaginated = async (page: number, limit: number) => {
  const cacheKey = generateCacheKey('highlights', 'page', page, limit);

  return cachedFetch(
    cacheKey,
    async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [dataResponse, countResponse] = await Promise.all([
        supabase
          .from('highlights')
          .select(FIELD_SELECTIONS.highlightsList)
          .order('published_date', { ascending: false, nullsFirst: false })
          .range(from, to),
        supabase
          .from('highlights')
          .select('id', { count: 'exact', head: true })
      ]);

      if (dataResponse.error) throw dataResponse.error;
      if (countResponse.error) throw countResponse.error;

      // Optimize images and transform snake_case to camelCase
      const optimizedData = (dataResponse.data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: optimizeImageUrl(item.image_url, { width: 800, quality: 75 }),
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
        iconName: item.icon_name,
        publishedDate: item.published_date,
        featured: item.featured,
      }));

      const totalCount = countResponse.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: optimizedData,
        totalCount,
        page,
        itemsPerPage: limit,
        totalPages,
      };
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

// ============================================
// PUBLICATIONS
// ============================================

export const getAllPublications = async () => {
  const cacheKey = generateCacheKey('publications', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('publications')
        .select(FIELD_SELECTIONS.publicationsList)
        .order('published_date', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Transform snake_case to camelCase
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        authors: item.authors,
        publishedDate: item.published_date,
        featured: item.featured,
        sentence: item.sentence,
        pdfUrl: item.pdf_url,
        pdfAccessType: item.pdf_access_type,
        link: item.link,
        excerpt: item.excerpt,
        content: item.content,
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

export const getPublicationsPaginated = async (page: number, limit: number) => {
  const cacheKey = generateCacheKey('publications', 'page', page, limit);

  return cachedFetch(
    cacheKey,
    async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [dataResponse, countResponse] = await Promise.all([
        supabase
          .from('publications')
          .select(FIELD_SELECTIONS.publicationsList)
          .order('published_date', { ascending: false, nullsFirst: false })
          .range(from, to),
        supabase
          .from('publications')
          .select('id', { count: 'exact', head: true })
      ]);

      if (dataResponse.error) throw dataResponse.error;
      if (countResponse.error) throw countResponse.error;

      // Transform snake_case to camelCase
      const transformedData = (dataResponse.data || []).map(item => ({
        id: item.id,
        title: item.title,
        authors: item.authors,
        publishedDate: item.published_date,
        featured: item.featured,
        sentence: item.sentence,
        pdfUrl: item.pdf_url,
        pdfAccessType: item.pdf_access_type,
        link: item.link,
        excerpt: item.excerpt,
        content: item.content,
      }));

      const totalCount = countResponse.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: transformedData,
        totalCount,
        page,
        itemsPerPage: limit,
        totalPages,
      };
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

// ============================================
// PARTNERS
// ============================================

export const getAllPartners = async () => {
  const cacheKey = generateCacheKey('partners', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('partners')
        .select(FIELD_SELECTIONS.partnersList)
        .order('name');

      if (error) throw error;

      // Optimize logo images
      return (data || []).map(item => ({
        ...item,
        logo_url: optimizeImageUrl(item.logo_url, { width: 400, quality: 85, format: 'webp' }),
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.static }
  );
};

// ============================================
// TEAM MEMBERS
// ============================================

export const getAllTeamMembers = async () => {
  const cacheKey = generateCacheKey('team', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(FIELD_SELECTIONS.teamList)
        .order('name');

      if (error) throw error;

      // Optimize images
      return (data || []).map(item => ({
        ...item,
        image_url: optimizeImageUrl(item.image_url, { width: 400, height: 400, quality: 85 }),
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.static }
  );
};

// ============================================
// BLOG POSTS
// ============================================

export const getAllBlogPosts = async () => {
  const cacheKey = generateCacheKey('blog', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(FIELD_SELECTIONS.blogList)
        .order('date', { ascending: false });

      if (error) throw error;

      // Optimize images
      return (data || []).map(item => ({
        ...item,
        image_url: optimizeImageUrl(item.image_url, { width: 800, quality: 75 }),
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

export const getBlogPostsPaginated = async (page: number, limit: number) => {
  const cacheKey = generateCacheKey('blog', 'page', page, limit);

  return cachedFetch(
    cacheKey,
    async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [dataResponse, countResponse] = await Promise.all([
        supabase
          .from('blog_posts')
          .select(FIELD_SELECTIONS.blogList)
          .order('date', { ascending: false })
          .range(from, to),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
      ]);

      if (dataResponse.error) throw dataResponse.error;
      if (countResponse.error) throw countResponse.error;

      // Optimize images and transform snake_case to camelCase
      const optimizedData = (dataResponse.data || []).map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        authorRole: item.author_role,
        date: item.date,
        imageUrl: optimizeImageUrl(item.image_url, { width: 800, quality: 75 }),
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
        likes: item.likes,
        content: item.content,
      }));

      const totalCount = countResponse.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: optimizedData,
        totalCount,
        page,
        itemsPerPage: limit,
        totalPages,
      };
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

// ============================================
// PROJECTS
// ============================================

export const getProjectsByCategory = async (category: string) => {
  const cacheKey = generateCacheKey('projects', 'category', category);

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(FIELD_SELECTIONS.projectsList)
        .eq('category', category)
        .order('date', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Optimize images and transform to camelCase
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: optimizeImageUrl(item.image_url, { width: 800, quality: 75 }),
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
        date: item.date,
        category: item.category,
        context: item.context,
        objectives: item.objectives,
        methodology: item.methodology,
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

export const getProjectsPaginated = async (category: string, page: number, limit: number) => {
  const cacheKey = generateCacheKey('projects', 'page', category, page, limit);

  return cachedFetch(
    cacheKey,
    async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [dataResponse, countResponse] = await Promise.all([
        supabase
          .from('projects')
          .select(FIELD_SELECTIONS.projectsList)
          .eq('category', category)
          .order('date', { ascending: false, nullsFirst: false })
          .range(from, to),
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('category', category)
      ]);

      if (dataResponse.error) throw dataResponse.error;
      if (countResponse.error) throw countResponse.error;

      // Optimize images (both cover and gallery) and transform to camelCase
      const optimizedData = (dataResponse.data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: optimizeImageUrl(item.image_url, { width: 800, quality: 75 }),
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
        date: item.date,
        category: item.category,
        context: item.context,
        objectives: item.objectives,
        methodology: item.methodology,
      }));

      const totalCount = countResponse.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: optimizedData,
        totalCount,
        page,
        itemsPerPage: limit,
        totalPages,
      };
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

// ============================================
// FINANCIAL STATEMENTS
// ============================================

export const getAllFinancialStatements = async () => {
  const cacheKey = generateCacheKey('financial', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('financial_statements')
        .select(FIELD_SELECTIONS.financialList)
        .order('year', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

export const getFinancialStatementsPaginated = async (page: number, limit: number) => {
  const cacheKey = generateCacheKey('financial', 'page', page, limit);

  return cachedFetch(
    cacheKey,
    async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [dataResponse, countResponse] = await Promise.all([
        supabase
          .from('financial_statements')
          .select(FIELD_SELECTIONS.financialList)
          .order('year', { ascending: false })
          .range(from, to),
        supabase
          .from('financial_statements')
          .select('id', { count: 'exact', head: true })
      ]);

      if (dataResponse.error) throw dataResponse.error;
      if (countResponse.error) throw countResponse.error;

      const totalCount = countResponse.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: dataResponse.data || [],
        totalCount,
        page,
        itemsPerPage: limit,
        totalPages,
      };
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

// ============================================
// INTERNSHIP TESTIMONIALS
// ============================================

export const getAllInternshipTestimonials = async () => {
  const cacheKey = generateCacheKey('testimonials', 'all');

  return cachedFetch(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('internship_testimonials')
        .select(FIELD_SELECTIONS.testimonialsList)
        .order('published_date', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Optimize images and transform snake_case to camelCase
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        degree: item.degree,
        institution: item.institution,
        quote: item.quote,
        fullText: item.full_text,
        year: item.year,
        publishedDate: item.published_date,
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
      }));
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

export const getInternshipTestimonialsPaginated = async (page: number, limit: number) => {
  const cacheKey = generateCacheKey('testimonials', 'page', page, limit);

  return cachedFetch(
    cacheKey,
    async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [dataResponse, countResponse] = await Promise.all([
        supabase
          .from('internship_testimonials')
          .select(FIELD_SELECTIONS.testimonialsList)
          .order('published_date', { ascending: false, nullsFirst: false })
          .range(from, to),
        supabase
          .from('internship_testimonials')
          .select('id', { count: 'exact', head: true })
      ]);

      if (dataResponse.error) throw dataResponse.error;
      if (countResponse.error) throw countResponse.error;

      // Optimize images and transform snake_case to camelCase
      const optimizedData = (dataResponse.data || []).map(item => ({
        id: item.id,
        name: item.name,
        degree: item.degree,
        institution: item.institution,
        quote: item.quote,
        fullText: item.full_text,
        year: item.year,
        publishedDate: item.published_date,
        images: optimizeImageArray(item.images, { width: 1200, quality: 80 }),
      }));

      const totalCount = countResponse.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: optimizedData,
        totalCount,
        page,
        itemsPerPage: limit,
        totalPages,
      };
    },
    { ...defaultCacheConfig, ttl: CACHE_TTL.content }
  );
};

// ============================================
// CACHE MANAGEMENT
// ============================================

/**
 * Invalidate all caches (use when admin makes changes)
 */
export const invalidateAllCaches = () => {
  const prefixes = ['hero', 'about', 'news', 'highlights', 'publications', 'partners', 'team', 'blog', 'projects', 'financial', 'testimonials'];
  prefixes.forEach(prefix => invalidateByPrefix(prefix));
  console.log('[OptimizedService] All caches invalidated');
};

/**
 * Invalidate specific cache type
 */
export const invalidateCache = (type: string) => {
  invalidateByPrefix(type);
  console.log(`[OptimizedService] Cache invalidated for: ${type}`);
};

// Export original service functions for admin operations (no caching)
export { originalService };