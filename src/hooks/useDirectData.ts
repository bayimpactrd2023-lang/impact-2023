/**
 * Direct Database Hooks
 * 
 * These hooks fetch data directly from Supabase without using ContentContext.
 * Each hook manages its own loading and error states.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllNews,
  getAllHighlights,
  getAllPartners,
  getAllPublications,
  getAllTeamMembers,
  getAllBlogPosts,
  getProjectsByCategory,
  getHeroSection,
  getAllFinancialStatements,
  getAllInternshipTestimonials,
  getAboutSection,
} from '@/services/supabaseService';
import type {
  NewsItem,
  Highlight,
  Partner,
  Publication,
  TeamMember,
  BlogPost,
  Project,
  FinancialStatement,
  InternshipTestimonial,
} from '@/app/context/ContentContext';

// Map database format to app format
const mapDbToApp = (data: any): any => {
  if (!data) return null;

  const mapping: Record<string, string> = {
    image_url: 'imageUrl',
    pdf_url: 'pdfUrl',
    published_date: 'publishedDate',
    optional_links: 'optionalLinks',
    contact_info: 'contactInfo',
    icon_name: 'iconName',
    logo_url: 'logoUrl',
    author_role: 'authorRole',
    full_text: 'fullText',
  };

  const mapped: any = { ...data };
  Object.keys(mapping).forEach(dbKey => {
    if (mapped[dbKey] !== undefined) {
      mapped[mapping[dbKey]] = mapped[dbKey];
      delete mapped[dbKey];
    }
  });

  return mapped;
};

interface UseDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseHeroResult {
  title: string;
  subtitle: string;
  backgroundUrl: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseAboutResult {
  vision: string;
  mission: string;
  description: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching news items
 */
export function useNews(): UseDataResult<NewsItem> {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllNews();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching highlights
 */
export function useHighlights(): UseDataResult<Highlight> {
  const [data, setData] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllHighlights();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching highlights:', err);
      setError('Failed to load highlights');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching partners
 */
export function usePartners(): UseDataResult<Partner> {
  const [data, setData] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllPartners();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to load partners');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching publications
 */
export function usePublications(): UseDataResult<Publication> {
  const [data, setData] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllPublications();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Failed to load publications');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching team members
 */
export function useTeamMembers(): UseDataResult<TeamMember> {
  const [data, setData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllTeamMembers();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching blog posts
 */
export function useBlogPosts(): UseDataResult<BlogPost> {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllBlogPosts();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching projects by category
 */
export function useProjects(category: string): UseDataResult<Project> {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProjectsByCategory(category);
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error(`Error fetching projects for category ${category}:`, err);
      setError('Failed to load projects');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching financial statements
 */
export function useFinancialStatements(): UseDataResult<FinancialStatement> {
  const [data, setData] = useState<FinancialStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllFinancialStatements();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching financial statements:', err);
      setError('Failed to load financial statements');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching internship testimonials
 */
export function useInternshipTestimonials(): UseDataResult<InternshipTestimonial> {
  const [data, setData] = useState<InternshipTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllInternshipTestimonials();
      const mapped = (result || []).map((item: any) => mapDbToApp(item));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching internship testimonials:', err);
      setError('Failed to load internship testimonials');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching hero section data
 */
export function useHeroSection(): UseHeroResult {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getHeroSection();
      setTitle(result?.title || '');
      setSubtitle(result?.subtitle || '');
      setBackgroundUrl(result?.background_url || '');
    } catch (err) {
      console.error('Error fetching hero section:', err);
      setError('Failed to load hero section');
      setTitle('');
      setSubtitle('');
      setBackgroundUrl('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { title, subtitle, backgroundUrl, loading, error, refresh: fetchData };
}

/**
 * Hook for fetching about section data
 */
export function useAboutSection(): UseAboutResult {
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAboutSection();
      setVision(result?.vision || '');
      setMission(result?.mission || '');
      setDescription(result?.description || '');
    } catch (err) {
      console.error('Error fetching about section:', err);
      setError('Failed to load about section');
      setVision('');
      setMission('');
      setDescription('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { vision, mission, description, loading, error, refresh: fetchData };
}
