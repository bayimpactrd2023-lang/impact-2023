import React, { useState, useEffect } from 'react';
// Admin Panel - Fixed all function references (updateTeamMembers, etc.)
import { useContent, NewsItem, Publication, Partner, Highlight, TeamMember, BlogPost } from '@/app/context/ContentContext';
import { Plus, Trash2, Save, Edit, FileText, Newspaper, Sparkles, Users, Info, Briefcase, BookOpen, Handshake, Layout, Home, X, CheckCircle, ChevronLeft, ChevronRight, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { PDFDropzone } from '@/app/components/PDFDropzone';
import { toast } from 'sonner';
import { ProjectManager } from '@/app/components/admin/ProjectManager';
import { FinancialStatementManager } from '@/app/components/admin/FinancialStatementManager';
import { InternshipTestimonialManager } from '@/app/components/admin/InternshipTestimonialManager';
import { BlogManager } from '@/app/components/admin/BlogManager';
import { PublicationsManager } from '@/app/components/admin/PublicationsManager';
import { NewsManager } from '@/app/components/admin/NewsManager';
import { HighlightsManager } from '@/app/components/admin/HighlightsManager';
import { PartnersManager } from '@/app/components/admin/PartnersManager';
import { TeamManager } from '@/app/components/admin/TeamManager';
import { ProductionStatusBanner } from '@/app/components/admin/ProductionStatusBanner';
import { OurWorkTabs } from '@/app/components/admin/OurWorkTabs';
import { AdminSkeletonLoader } from '@/app/components/AdminSkeletonLoader';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import {
  updateHeroSection,
  updateAboutSection,
  createPartner,
  updatePartner as updatePartnerInDb,
  deletePartner as deletePartnerFromDb,
  createHighlight,
  updateHighlight as updateHighlightInDb,
  deleteHighlight as deleteHighlightFromDb,
  createTeamMember,
  updateTeamMember as updateTeamInDb,
  deleteTeamMember as deleteTeamFromDb,
  createNews,
  updateNews as updateNewsInDb,
  deleteNews as deleteNewsFromDb,
  createBlogPost,
  createPublication,
  getAllHighlights,
  getAllPublications,
  getProjectsByCategory,
  getAllInternshipTestimonials
} from '@/services/supabaseService';

/**
 * AdminPanel Component
 * 
 * Main admin dashboard for managing all website content including:
 * - Hero section and branding
 * - About section content
 * - News items and updates
 * - Highlights and features
 * - Team member profiles
 * - Partner organizations
 * - Blog posts and articles
 * - Publications and research
 * - Project portfolios
 * - Financial statements
 * - Internship testimonials
 */
export const AdminPanel: React.FC = () => {
  // Initialize delete confirmation hook for modal-based confirmations
  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();
  
  const {
    content,
    loading: contentLoading,
    loadingStates,
    updateNews,
    updatePublications,
    updatePartners,
    updateHighlights,
    updateTeamMembers,
    updateHero,
    updateAbout,
    updateHeroBackground,
    updateInternationallyFundedProjects,
    updateLocallyFundedProjects,
    updateCommunityTransformationProjects,
    updateInternshipPrograms,
    updateFinancialStatements,
    updateStudyFindings,
    updateInternshipTestimonials,
    updateBlogPosts,
    refreshContent,
    // Lazy fetch functions
    fetchNews,
    fetchHighlights,
    fetchPartners,
    fetchPublications,
    fetchTeamMembers,
    fetchBlogPosts,
    fetchHeroSection,
    fetchAboutSection,
    fetchInternationallyFundedProjects,
    fetchLocallyFundedProjects,
    fetchCommunityTransformationProjects,
    fetchInternshipPrograms,
    fetchStudyFindings,
    fetchFinancialStatements,
    fetchInternshipTestimonials,
  } = useContent();
  
  const [newsItems, setNewsItems] = useState<NewsItem[]>(content.newsItems);
  const [publications, setPublications] = useState<Publication[]>(content.publications);
  const [partners, setPartners] = useState<Partner[]>(content.partners);
  const [highlights, setHighlights] = useState<Highlight[]>(content.highlights);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(content.teamMembers);
  const [heroTitle, setHeroTitle] = useState(content.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(content.heroSubtitle);
  const [aboutText, setAboutText] = useState(content.aboutText);
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState(content.heroBackgroundUrl);

  // ── Blog state lifted here so Quick Create can push into BlogManager ──────
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(content.blogPosts);

  // ── Quick Create Blog modal ───────────────────────────────────────────────
  const [isQuickBlogOpen, setIsQuickBlogOpen] = useState(false);
  const [draft, setDraft] = useState<BlogPost>({
    id: '',
    title: '',
    content: '',
    author: 'Admin',
    authorRole: 'Administrator',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    images: [],
    likes: 0,
  });

  // ── Quick Create Publication modal ────────────────────────────────────────
  const [isQuickPublicationOpen, setIsQuickPublicationOpen] = useState(false);
  const [publicationDraft, setPublicationDraft] = useState<Publication>({
    id: '',
    title: '',
    authors: '',
    link: '#',
    featured: false,
    pdfUrl: '',
    content: '',
    publishedDate: new Date().toISOString().split('T')[0],
    excerpt: '',
    sentence: '',
    optionalLinks: '',
    contactInfo: '',
    reference: '',
  });

  // News modal state
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  // Highlights modal state
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [showMigrationWarning, setShowMigrationWarning] = useState(false);

  // Team modal state
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);

  // Partners modal state
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);


  // Loading states for Quick Actions and change tracking
  const [isSavingQuickBlog, setIsSavingQuickBlog] = useState(false);
  const [isSavingQuickPublication, setIsSavingQuickPublication] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);
  const [isSavingTeamMember, setIsSavingTeamMember] = useState(false);
  const [isSavingPartner, setIsSavingPartner] = useState(false);

  // Loading state for tab switching
  const [activeTab, setActiveTab] = useState('home');
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Database counts for home tab
  const [dbCounts, setDbCounts] = useState({
    highlights: 0,
    publications: 0,
    projects: 0,
    testimonials: 0,
  });

  // Pagination is now handled by individual manager components using cursor pagination

  // Fetch initial data for the home tab on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsTabLoading(true);
      try {
        await Promise.all([fetchHeroSection(), fetchAboutSection()]);
        
        // Load database counts for home tab
        const [highlights, publications, intProjects, localProjects, commProjects, testimonials] = await Promise.all([
          getAllHighlights(),
          getAllPublications(),
          getProjectsByCategory('internationally_funded'),
          getProjectsByCategory('locally_funded'),
          getProjectsByCategory('community_transformation'),
          getAllInternshipTestimonials(),
        ]);
        
        setDbCounts({
          highlights: highlights?.length || 0,
          publications: publications?.length || 0,
          projects: (intProjects?.length || 0) + (localProjects?.length || 0) + (commProjects?.length || 0),
          testimonials: testimonials?.length || 0,
        });
      } catch (error) {
        console.error('[AdminPanel] Error loading initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setIsTabLoading(false);
      }
    };

    loadInitialData();
  }, []); // Only run on mount

  // Sync with context when it changes externally
  useEffect(() => {
    setNewsItems(content.newsItems);
    setPublications(content.publications);
    setPartners(content.partners);
    setHighlights(content.highlights);
    setTeamMembers(content.teamMembers);
    setHeroTitle(content.heroTitle);
    setHeroSubtitle(content.heroSubtitle);
    setAboutText(content.aboutText);
    setHeroBackgroundUrl(content.heroBackgroundUrl);
    setBlogPosts(content.blogPosts);
  }, [
    content.newsItems,
    content.publications,
    content.partners,
    content.highlights,
    content.teamMembers,
    content.heroTitle,
    content.heroSubtitle,
    content.aboutText,
    content.heroBackgroundUrl,
    content.blogPosts,
  ]);

  // ── Tab change handler with lazy loading ─────────────────────────────────
  const handleTabChange = async (value: string) => {
    if (value === activeTab) return; // Don't reload if same tab

    setActiveTab(value);
    setIsTabLoading(true);

    try {
      // Fetch only the data needed for the specific tab
      switch (value) {
        case 'home':
          await Promise.all([fetchHeroSection(), fetchAboutSection()]);
          break;
        case 'blog':
          await fetchBlogPosts();
          break;
        case 'news':
          await fetchNews();
          break;
        case 'highlights':
          await fetchHighlights();
          break;
        case 'team':
          await fetchTeamMembers();
          break;
        case 'about':
          await fetchAboutSection();
          break;
        case 'publications':
          await fetchPublications();
          break;
        case 'partners':
          await fetchPartners();
          break;
        case 'our-work':
          // Data will be fetched by OurWorkTabs component when sub-tabs are clicked
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching data for tab ${value}:`, error);
      toast.error('Failed to load data');
    } finally {
      setIsTabLoading(false);
    }
  };

  // ── Quick Blog handlers ───────────────────────────────────────────────────
  const openQuickBlog = () => {
    setDraft({
      id: Date.now().toString(),
      title: '',
      content: '',
      author: 'Admin',
      authorRole: 'Administrator',
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
      images: [],
      likes: 0,
    });
    setIsQuickBlogOpen(true);
  };

  const publishQuickBlog = async () => {
    if (isSavingQuickBlog) return; // Prevent multiple submissions

    if (!draft.title.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    if (!draft.content.trim()) {
      toast.error('Please enter some content.');
      return;
    }
    
    setIsSavingQuickBlog(true);
    try {
      // Save to database
      const blogData = {
        title: draft.title,
        content: draft.content,
        author: draft.author,
        author_role: draft.authorRole,
        date: draft.date,
        image_url: draft.imageUrl || null,
        images: draft.images || null,
        likes: draft.likes || 0
      };
      
      const created = await createBlogPost(blogData);
      
      if (created) {
        // Refresh from database
        await content.refreshContent?.();
        setIsQuickBlogOpen(false);
        toast.success('Blog post saved to database!', {
          description: `"${draft.title}" was successfully created.`,
        });
      } else {
        toast.error('Failed to save blog post to database.');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to save blog post. Please try again.');
    } finally {
      setIsSavingQuickBlog(false);
    }
  };

  // ── Quick Publication handlers ────────────────────────────────────────────
  const openQuickPublication = () => {
    setPublicationDraft({
      id: Date.now().toString(),
      title: '',
      authors: '',
      link: '#',
      featured: false,
      pdfUrl: '',
      content: '',
      publishedDate: new Date().toISOString().split('T')[0],
      excerpt: '',
      sentence: '',
      optionalLinks: '',
      contactInfo: '',
      reference: '',
    });
    setIsQuickPublicationOpen(true);
  };

  const publishQuickPublication = async () => {
    if (isSavingQuickPublication) return; // Prevent multiple submissions

    if (!publicationDraft.title.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    if (!publicationDraft.content.trim()) {
      toast.error('Please enter some content.');
      return;
    }
    
    setIsSavingQuickPublication(true);
    try {
      // Save to database
      const publicationData = {
        title: publicationDraft.title,
        authors: publicationDraft.authors,
        link: publicationDraft.link,
        featured: publicationDraft.featured,
        pdf_url: publicationDraft.pdfUrl || null,
        content: publicationDraft.content || null,
        published_date: publicationDraft.publishedDate || null,
        excerpt: publicationDraft.excerpt || null,
        sentence: publicationDraft.sentence || null,
        optional_links: publicationDraft.optionalLinks || null,
        contact_info: publicationDraft.contactInfo || null,
        reference: publicationDraft.reference || null
      };
      
      const created = await createPublication(publicationData);
      
      if (created) {
        // Refresh from database
        await content.refreshContent?.();
        setIsQuickPublicationOpen(false);
        toast.success('Publication saved to database!', {
          description: `"${publicationDraft.title}" was successfully created.`,
        });
      } else {
        toast.error('Failed to save publication to database.');
      }
    } catch (error) {
      console.error('Error creating publication:', error);
      toast.error('Failed to save publication. Please try again.');
    } finally {
      setIsSavingQuickPublication(false);
    }
  };

  // News handlers - Now saves to Supabase
  const handleSaveNews = async (newsItem?: NewsItem) => {
    try {
      const itemsToSave = newsItem ? [newsItem] : newsItems;
      
      // Save each news item to database
      for (const item of itemsToSave) {
        const newsData = {
          title: item.title,
          content: item.content,
          date: item.date,
          image_url: item.imageUrl || null,
          images: item.images || null
        };
        
        if (item.id.startsWith('temp-')) {
          // Create new
          const created = await createNews(newsData);
          if (created && newsItem) {
            // Replace temp ID with real ID from database
            setNewsItems(newsItems.map(i => 
              i.id === item.id ? { ...item, id: created.id } : i
            ));
          }
        } else {
          // Update existing
          await updateNewsInDb(item.id, newsData);
        }
      }
      
      // Refresh from database
      await content.refreshContent?.();
      toast.success('News saved to database successfully!');
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Failed to save news. Please try again.');
      throw error;
    }
  };
  
  const addNewsItem = () => {
    const n: NewsItem = { id: `temp-${Date.now()}`, title: '', content: '', date: new Date().toISOString().split('T')[0], images: [] };
    setEditingNews(n); setIsNewsModalOpen(true);
  };
  
  const deleteNewsItem = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deleteNewsFromDb(id);
      }
      setNewsItems(newsItems.filter(i => i.id !== id));
      await content.refreshContent?.();
      toast.success('News item deleted successfully!');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news item.');
    }
  };
  
  const updateNewsItem = (id: string, field: keyof NewsItem, value: string) => setNewsItems(newsItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  const updateNewsItemImages = (id: string, images: string[]) => setNewsItems(newsItems.map(i => i.id === id ? { ...i, images, imageUrl: images[0] || '' } : i));
  const updateHighlightImages = (id: string, images: string[]) => setHighlights(highlights.map(h => h.id === id ? { ...h, images, imageUrl: images[0] || '' } : h));

  // Partners handlers - Now saves to Supabase
  const handleSavePartners = async (partner?: Partner) => {
    try {
      const itemsToSave = partner ? [partner] : partners;
      
      for (const item of itemsToSave) {
        const partnerData = {
          name: item.name,
          logo_url: item.logoUrl
        };
        
        if (item.id.startsWith('temp-')) {
          const created = await createPartner(partnerData);
          if (created && partner) {
            // Replace temp ID with real ID from database
            setPartners(partners.map(p => 
              p.id === item.id ? { ...item, id: created.id } : p
            ));
          }
        } else {
          await updatePartnerInDb(item.id, partnerData);
        }
      }
      
      await content.refreshContent?.();
      toast.success('Partners saved to database successfully!');
    } catch (error) {
      console.error('Error saving partners:', error);
      toast.error('Failed to save partners.');
      throw error;
    }
  };
  
  const addPartner = () => {
    const p: Partner = {
      id: `temp-${Date.now()}`,
      name: '',
      logoUrl: ''
    };
    setEditingPartner(p);
    setIsPartnerModalOpen(true);
  };
  
  const deletePartner = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deletePartnerFromDb(id);
      }
      setPartners(partners.filter(p => p.id !== id));
      await content.refreshContent?.();
      toast.success('Partner deleted successfully!');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner.');
    }
  };
  
  const updatePartner = (id: string, field: keyof Partner, value: string) => setPartners(partners.map(p => p.id === id ? { ...p, [field]: value } : p));

  // Highlights handlers - Now saves to Supabase
  const handleSaveHighlights = async (highlight?: Highlight) => {
    try {
      const itemsToSave = highlight ? [highlight] : highlights;
      
      for (const item of itemsToSave) {
        // Prepare data - conditionally include 'featured' only if it's defined
        const highlightData: any = {
          title: item.title,
          description: item.description,
          image_url: item.imageUrl,
          images: item.images || null,
          icon_name: item.iconName,
          content: item.content || null,
          published_date: item.publishedDate || null,
        };
        
        // Only add featured if it's explicitly set to avoid DB errors if column doesn't exist
        if (item.featured !== undefined) {
          highlightData.featured = item.featured;
        }
        
        if (item.id.startsWith('temp-')) {
          const created = await createHighlight(highlightData);
          if (created && highlight) {
            // Replace temp ID with real ID from database
            setHighlights(highlights.map(h => 
              h.id === item.id ? { ...item, id: created.id } : h
            ));
          }
        } else {
          await updateHighlightInDb(item.id, highlightData);
        }
      }
      
      await content.refreshContent?.();
      toast.success('Highlights saved to database successfully!');
      setShowMigrationWarning(false); // Hide warning on successful save
    } catch (error: any) {
      console.error('Error saving highlights:', error);
      
      // Check if error is related to missing 'featured' column
      if (error?.message?.includes("'featured' column") || error?.code === 'PGRST204') {
        setShowMigrationWarning(true);
        toast.error('Database migration required! Check the banner above for instructions.');
      } else {
        toast.error('Failed to save highlights.');
      }
      throw error;
    }
  };
  
  const addHighlight = () => {
    const h: Highlight = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      iconName: 'Globe'
    };
    setEditingHighlight(h);
    setIsHighlightModalOpen(true);
  };
  
  const deleteHighlight = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deleteHighlightFromDb(id);
      }
      setHighlights(highlights.filter(h => h.id !== id));
      await content.refreshContent?.();
      toast.success('Highlight deleted successfully!');
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight.');
    }
  };
  const updateHighlight = (id: string, field: keyof Highlight, value: string) => setHighlights(highlights.map(h => h.id === id ? { ...h, [field]: value } : h));

  // Team Members handlers - Now saves to Supabase
  const handleSaveTeamMembers = async (member?: TeamMember) => {
    try {
      const itemsToSave = member ? [member] : teamMembers;
      
      for (const item of itemsToSave) {
        const memberData = {
          name: item.name,
          role: item.role,
          description: item.description,
          image_url: item.imageUrl || null
        };
        
        if (item.id.startsWith('temp-')) {
          const created = await createTeamMember(memberData);
          if (created && member) {
            // Replace temp ID with real ID from database
            setTeamMembers(teamMembers.map(m => 
              m.id === item.id ? { ...item, id: created.id } : m
            ));
          }
        } else {
          await updateTeamMemberInDb(item.id, memberData);
        }
      }
      
      await content.refreshContent?.();
      toast.success('Team members saved to database successfully!');
    } catch (error) {
      console.error('Error saving team members:', error);
      toast.error('Failed to save team members.');
      throw error;
    }
  };
  
  const addTeamMember = () => { const m: TeamMember = { id: `temp-${Date.now()}`, name: '', role: '', description: '', imageUrl: '' }; setEditingTeamMember(m); setIsTeamMemberModalOpen(true); };
  
  const deleteTeamMember = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await deleteTeamMemberFromDb(id);
      }
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      await content.refreshContent?.();
      toast.success('Team member deleted successfully!');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member.');
    }
  };
  
  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));

  // Hero handlers - Now saves to Supabase
  const handleSaveHero = async () => {
    if (isSavingHero) return; // Prevent multiple submissions

    // Check for changes
    const hasChanges = 
      heroTitle !== content.heroTitle ||
      heroSubtitle !== content.heroSubtitle ||
      heroBackgroundUrl !== content.heroBackgroundUrl;
    
    if (!hasChanges) {
      toast.info('No changes made', {
        description: 'There are no changes to save.',
      });
      return;
    }

    setIsSavingHero(true);
    try {
      await updateHeroSection({
        title: heroTitle,
        subtitle: heroSubtitle,
        background_url: heroBackgroundUrl || null
      });
      
      await content.refreshContent?.();
      toast.success('Hero section saved to database successfully!');
    } catch (error) {
      console.error('Error saving hero section:', error);
      toast.error('Failed to save hero section.');
    } finally {
      setIsSavingHero(false);
    }
  };
  
  const handleSaveAbout = async () => {
    try {
      await updateAboutSection({
        vision: '',  // You can expand the About section to include vision/mission fields
        mission: '',
        description: aboutText
      });
      updateAbout(aboutText);
      await refreshContent();
      toast.success('About section saved to database successfully!');
    } catch (error) {
      console.error('Error saving about section:', error);
      toast.error('Failed to save about section.');
    }
  };

  // Callback from BlogManager when user edits from Blog tab
  const handleBlogUpdate = (posts: BlogPost[]) => {
    setBlogPosts(posts);
    updateBlogPosts(posts);
  };

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/95 backdrop-blur-2xl rounded-3xl border border-[#1887FC]/15 shadow-[0_8px_32px_rgba(24,135,252,0.12)] overflow-hidden">
      {/* Production Status Banner */}
      <ProductionStatusBanner />
      
      {/* Tabs Component - All update functions fixed */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

        {/* ── Tab Navigation ─────────────────────────────────────────────── */}
        <div className="relative border-b border-gray-200 bg-gradient-to-r from-white via-blue-50/30 to-white">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="overflow-x-auto px-2 sm:px-4 scrollbar-hide">
            <TabsList className="flex justify-start items-center min-w-full bg-transparent h-auto py-2 gap-0.5">
              {[
                { value: 'home',         icon: <Home className="w-3.5 h-3.5" />,      label: 'Home' },
                { value: 'blog',         icon: <FileText className="w-3.5 h-3.5" />,  label: 'Blog' },
                { value: 'news',         icon: <Newspaper className="w-3.5 h-3.5" />, label: 'News' },
                { value: 'highlights',   icon: <Sparkles className="w-3.5 h-3.5" />,  label: 'Highlights' },
                { value: 'team',         icon: <Users className="w-3.5 h-3.5" />,     label: 'Team' },
                { value: 'about',        icon: <Info className="w-3.5 h-3.5" />,      label: 'About' },
                { value: 'our-work',     icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Work' },
                { value: 'publications', icon: <BookOpen className="w-3.5 h-3.5" />,  label: 'Pubs' },
                { value: 'partners',     icon: <Handshake className="w-3.5 h-3.5" />, label: 'Partners' },
              ].map(t => (
                <TabsTrigger key={t.value} value={t.value}
                  className="flex-shrink-0 flex items-center justify-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1887FC] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white rounded-md px-2.5 py-2 transition-all hover:scale-105 text-xs whitespace-nowrap">
                  {t.icon}<span>{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6 lg:p-8">

          {/* Loading State with Skeleton */}
          {(isTabLoading || contentLoading || 
            (activeTab === 'news' && loadingStates.news) ||
            (activeTab === 'blog' && loadingStates.blogPosts) ||
            (activeTab === 'highlights' && loadingStates.highlights) ||
            (activeTab === 'team' && loadingStates.teamMembers) ||
            (activeTab === 'publications' && loadingStates.publications) ||
            (activeTab === 'partners' && loadingStates.partners) ||
            (activeTab === 'about' && loadingStates.about) ||
            (activeTab === 'home' && (loadingStates.hero || loadingStates.about))
          ) && (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
              <AdminSkeletonLoader section={activeTab} />
            </div>
          )}

          {/* ── HOME TAB ───────────────────────────────────────────────────── */}
          <TabsContent value="home" className="space-y-6">
            {/* Tips + Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">💡 Tips</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Click on any card in the grid views to open the edit modal",
                    "Use the Save buttons to persist your changes after editing",
                    "Images can be uploaded via drag-and-drop or URL input",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">🎯 Content Overview</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Highlights', value: dbCounts.highlights },
                    { label: 'Publications', value: dbCounts.publications },
                    { label: 'Projects (All)', value: dbCounts.projects },
                    { label: 'Testimonials', value: dbCounts.testimonials },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value} items</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                  {/* ★ Create Blog Post — opens modal, stays on Home tab */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    onClick={openQuickBlog}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Create Blog Post</div>
                        <div className="text-xs text-gray-500">Write a new article</div>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add News Update — opens modal directly */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 hover:border-green-400 hover:bg-green-50 transition-colors group"
                    onClick={addNewsItem}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                        <Newspaper className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Add News Update</div>
                        <div className="text-xs text-gray-500">Post an announcement</div>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add Team Member — opens modal directly */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                    onClick={addTeamMember}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Add Team Member</div>
                        <div className="text-xs text-gray-500">Manage your team</div>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add Highlight — opens modal directly */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 hover:border-yellow-400 hover:bg-yellow-50 transition-colors group"
                    onClick={addHighlight}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Add Highlight</div>
                        <div className="text-xs text-gray-500">Feature your work</div>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add Partner — opens modal directly */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 hover:border-orange-400 hover:bg-orange-50 transition-colors group"
                    onClick={addPartner}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
                        <Handshake className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Add Partner</div>
                        <div className="text-xs text-gray-500">Showcase collaborators</div>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Create Publication — opens modal directly */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                    onClick={openQuickPublication}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Create Publication</div>
                        <div className="text-xs text-gray-500">Add new publication</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ── BLOG TAB — receives the shared blogPosts state ─────────────── */}
          <TabsContent value="blog">
            <BlogManager blogPosts={blogPosts} onUpdate={handleBlogUpdate} refreshContent={refreshContent} />
          </TabsContent>

          {/* ── NEWS TAB ───────────────────────────────────────────────────── */}
          <TabsContent value="news">
            <NewsManager news={content.newsItems} onUpdate={updateNews} refreshContent={refreshContent} />
          </TabsContent>

          {/* ── ABOUT TAB ──────────────────────────────────────────────────── */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Edit the about section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="about-text" className="text-sm font-semibold text-gray-700">About Text</Label>
                  <Textarea id="about-text" value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={6} className="mt-1.5" />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  onClick={() => {
                    handleSaveAbout();
                    toast.success('About section saved!', {
                      description: 'Your changes have been saved successfully.',
                    });
                  }}
                >
                  <Save className="w-4 h-4 mr-2" /> Save About Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── OUR WORK TAB ───────────────────────────────────────────────── */}
          <TabsContent value="our-work">
            <OurWorkTabs refreshContent={refreshContent} />
          </TabsContent>

          {/* ── PUBLICATIONS TAB ───────────────────────────────────────────── */}
          <TabsContent value="publications">
            <PublicationsManager publications={publications} onUpdate={updatePublications} refreshContent={refreshContent} />
          </TabsContent>

          {/* ── PARTNERS TAB ───────────────────────────────────────────────── */}
          <TabsContent value="partners">
            <PartnersManager partners={content.partners} onUpdate={updatePartners} refreshContent={refreshContent} />
          </TabsContent>

          {/* OLD UNUSED CODE BELOW */}
          <TabsContent value="__never_render__">
            {false && (<Card key="x" className="cursor-pointer hover:shadow-lg transition-shadow relative group" onClick={() => { setEditingNews({} as any); setIsNewsModalOpen(true); }}>
                  <div className="absolute top-2 left-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        const confirmed = await confirmDelete({ itemName: 'news item' });
                        if (confirmed) deleteNewsItem(item.id); 
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  {item.imageUrl ? (<div className="w-full h-48 overflow-hidden rounded-t-lg"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /></div>) : (<div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center"><FileText className="w-12 h-12 text-gray-400" /></div>)}
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2">{item.title}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                    {item.date && <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>}
                    <div className="mt-3 flex items-center gap-2"><Edit className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500">Click to edit</span></div>
                  </CardContent>
                </Card>
              )}
            <div />
          </TabsContent>
          <Dialog open={isNewsModalOpen} onOpenChange={setIsNewsModalOpen}>
            <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold">Edit News Item</DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">Update the details for this news item and click Save to persist changes.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {editingNews && (
                <div className="space-y-6 py-2">
                  <div className="space-y-2"><Label className="text-sm font-medium">Title</Label><Input value={editingNews.title} onChange={(e) => { const u={...editingNews,title:e.target.value}; setEditingNews(u); updateNewsItem(editingNews.id,'title',e.target.value); }} /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium">Date</Label><Input type="date" value={editingNews.date} min="2000-01-01" max={new Date().toISOString().split('T')[0]} onChange={(e) => { const u={...editingNews,date:e.target.value}; setEditingNews(u); updateNewsItem(editingNews.id,'date',e.target.value); }} /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium">Content</Label><Textarea value={editingNews.content} onChange={(e) => { const u={...editingNews,content:e.target.value}; setEditingNews(u); updateNewsItem(editingNews.id,'content',e.target.value); }} rows={8} className="resize-none" /></div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cover Image (Drag & Drop)</Label>
                    <p className="text-xs text-gray-500 mb-2">Upload a cover image for this news article</p>
                    <ImageDropzone value={editingNews.imageUrl||''} onChange={(url) => { const u={...editingNews,imageUrl:url}; setEditingNews(u); updateNewsItem(editingNews.id,'imageUrl',url); }} label="Cover Image" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gallery Images (Drag & Drop)</Label>
                    <p className="text-xs text-gray-500 mb-2">Upload additional images for the gallery</p>
                    <MultiImageDropzone images={editingNews.images||[]} onChange={(images) => { const u={...editingNews,images}; setEditingNews(u); updateNewsItemImages(editingNews.id,images); }} label="News Article Images" />
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" className="flex-1 w-full" onClick={() => setIsNewsModalOpen(false)}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button 
                      className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                      disabled={isSavingNews}
                      onClick={async () => {
                        if (editingNews && !isSavingNews) {
                          setIsSavingNews(true);
                          try {
                            // Check if this is a new item (not in array)
                            const exists = newsItems.find(item => item.id === editingNews.id);
                            if (!exists) {
                              // New item - add to array first
                              setNewsItems([...newsItems, editingNews]);
                            }
                            // Save to Supabase
                            await handleSaveNews(editingNews);
                            setIsNewsModalOpen(false);
                          } catch (error) {
                            // Error already handled in handleSaveNews
                          } finally {
                            setIsSavingNews(false);
                          }
                        }
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> {isSavingNews ? 'Saving...' : 'Save News'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* ── HIGHLIGHTS TAB ─────────────────────────────────────────────── */}
          <TabsContent value="highlights">
            <HighlightsManager highlights={content.highlights} onUpdate={updateHighlights} refreshContent={refreshContent} />
          </TabsContent>

          {/* ── TEAM TAB ───────────────────────────────────────────────────── */}
          <TabsContent value="team">
            <TeamManager teamMembers={content.teamMembers} onUpdate={updateTeamMembers} refreshContent={refreshContent} />
          </TabsContent>

          {false && (
            <>
          {/* OLD CODE - DO NOT EXECUTE */}
          <TabsContent value="highlights-old" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold">Manage Highlights</h3>
                <p className="text-sm text-gray-500">Featured highlights appear on the home page (max 4)</p>
              </div>
              <Button onClick={addHighlight} size="sm" className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Highlight</Button>
            </div>
            
            {/* Migration Warning Banner */}
            {showMigrationWarning && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Database Migration Required
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      The 'featured' column is missing from your highlights table. Follow these steps to fix:
                    </p>
                    <div className="bg-white rounded border border-amber-200 p-3 mb-3">
                      <ol className="text-xs text-amber-900 space-y-2 list-decimal list-inside">
                        <li>Open your <strong>Supabase Dashboard</strong> → SQL Editor</li>
                        <li>Run this command:</li>
                      </ol>
                      <code className="block bg-gray-900 text-green-400 text-xs p-2 rounded mt-2 overflow-x-auto font-mono">
                        ALTER TABLE public.highlights ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
                      </code>
                    </div>
                    <p className="text-xs text-amber-700">
                      See <strong>MIGRATION-INSTRUCTIONS.md</strong> file for detailed steps.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowMigrationWarning(false)}
                    className="text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Featured count indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Featured Highlights: {highlights.filter(h => h.featured).length} / 4
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {false && [].map((highlight: any) => (
                <Card 
                  key={highlight.id} 
                  className={`cursor-pointer hover:shadow-lg transition-shadow relative group ${highlight.featured ? 'ring-2 ring-[#1887FC]' : ''}`}
                  onClick={() => { setEditingHighlight(highlight); setIsHighlightModalOpen(true); }}
                >
                  {/* Featured badge */}
                  {highlight.featured && (
                    <div className="absolute top-2 right-2 z-20 bg-[#1887FC] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        const confirmed = await confirmDelete({ itemName: 'highlight' });
                        if (confirmed) deleteHighlight(highlight.id); 
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  {highlight.imageUrl ? (<div className="w-full h-48 overflow-hidden rounded-t-lg"><img src={highlight.imageUrl} alt={highlight.title} className="w-full h-full object-cover" /></div>) : (<div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center"><FileText className="w-12 h-12 text-gray-400" /></div>)}
                  <CardContent className="p-4"><h4 className="font-semibold text-sm line-clamp-2 mb-2">{highlight.title}</h4><p className="text-xs text-gray-600 mb-2 line-clamp-2">{highlight.description}</p><div className="mt-3 flex items-center gap-2"><Edit className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500">Click to edit</span></div></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          </>
          )}

          {false && (
            <>
          {/* OLD TEAM CODE - DO NOT EXECUTE */}
          <TabsContent value="team-old" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-lg font-semibold">Manage Team Members</h3>
              <Button onClick={addTeamMember} size="sm" className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Team Member</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {false && [].map((member: any) => (
                <Card key={member.id} className="cursor-pointer hover:shadow-lg transition-shadow relative group" onClick={() => { setEditingTeamMember(member); setIsTeamMemberModalOpen(true); }}>
                  <div className="absolute top-2 left-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        const confirmed = await confirmDelete({ itemName: 'team member' });
                        if (confirmed) deleteTeamMember(member.id); 
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  {member.imageUrl ? (<div className="w-full h-48 overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-100"><img src={member.imageUrl} alt={member.name} className="h-32 w-32 rounded-full object-cover mt-4" /></div>) : (<div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center"><FileText className="w-12 h-12 text-gray-400" /></div>)}
                  <CardContent className="p-4"><h4 className="font-semibold text-sm line-clamp-1 mb-1">{member.name}</h4><p className="text-xs text-gray-600 mb-2">{member.role}</p><p className="text-xs text-gray-500 line-clamp-2">{member.description}</p><div className="mt-3 flex items-center gap-2"><Edit className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500">Click to edit</span></div></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          </>
          )}

          {false && (
            <>
          {/* DUPLICATE ABOUT/WORK TABS - DO NOT EXECUTE */}
          <TabsContent value="about-duplicate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Edit the about section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="about-text" className="text-sm font-semibold text-gray-700">About Text</Label>
                  <Textarea id="about-text" value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={6} className="mt-1.5" />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  onClick={() => {
                    handleSaveAbout();
                    toast.success('About section saved!', {
                      description: 'Your changes have been saved successfully.',
                    });
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Save About Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── OUR WORK TAB ───────────────────────────────────────────────── */}
          <TabsContent value="our-work" className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Manage "Our Work" Sections</h3>
            <Tabs defaultValue="internationally-funded">
              <TabsList className="w-full flex-wrap h-auto mb-4">
                <TabsTrigger value="internationally-funded">Int. Funded</TabsTrigger>
                <TabsTrigger value="locally-funded">Loc. Funded</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="internship">Internship</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
              </TabsList>
              <TabsContent value="internationally-funded"><ProjectManager projects={content.internationallyFundedProjects} onUpdate={updateInternationallyFundedProjects} title="Internationally Funded Projects" category="internationally_funded" /></TabsContent>
              <TabsContent value="locally-funded"><ProjectManager projects={content.locallyFundedProjects} onUpdate={updateLocallyFundedProjects} title="Locally Funded Projects" category="locally_funded" /></TabsContent>
              <TabsContent value="community"><ProjectManager projects={content.communityTransformationProjects} onUpdate={updateCommunityTransformationProjects} title="Community Transformation" category="community_transformation" /></TabsContent>
              <TabsContent value="internship"><InternshipTestimonialManager testimonials={content.internshipTestimonials} onUpdate={updateInternshipTestimonials} /></TabsContent>
              <TabsContent value="financial"><FinancialStatementManager statements={content.financialStatements} onUpdate={updateFinancialStatements} /></TabsContent>
              <TabsContent value="findings"><ProjectManager projects={content.studyFindings} onUpdate={updateStudyFindings} title="Findings from Our Latest Studies" category="study_findings" /></TabsContent>
            </Tabs>
          </TabsContent>

          {/* DUPLICATE PUBLICATIONS TAB - DO NOT EXECUTE */}
          <TabsContent value="publications-duplicate">
            <PublicationsManager publications={publications} onUpdate={updatePublications} />
          </TabsContent>

          {/* DUPLICATE PARTNERS TAB - DO NOT EXECUTE */}
          <TabsContent value="partners-duplicate">
            <PartnersManager partners={content.partners} onUpdate={updatePartners} />
          </TabsContent>

          {/* OLD PARTNERS CODE - DO NOT EXECUTE */}
          <TabsContent value="partners-old" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-lg font-semibold">Manage Partners</h3>
              <Button onClick={addPartner} size="sm" className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Partner</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {false && [].map((partner: any) => (
                <Card key={partner.id} className="cursor-pointer hover:shadow-lg transition-shadow relative group" onClick={() => { setEditingPartner(partner); setIsPartnerModalOpen(true); }}>
                  <div className="absolute top-2 left-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        const confirmed = await confirmDelete({ itemName: 'partner' });
                        if (confirmed) deletePartner(partner.id); 
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  {partner.logoUrl ? (<div className="w-full h-48 overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-50 p-4"><img src={partner.logoUrl} alt={partner.name} className="max-h-32 max-w-full object-contain" /></div>) : (<div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center"><FileText className="w-12 h-12 text-gray-400" /></div>)}
                  <CardContent className="p-4"><h4 className="font-semibold text-sm line-clamp-1 mb-2 text-center">{partner.name}</h4><div className="mt-3 flex items-center justify-center gap-2"><Edit className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500">Click to edit</span></div></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          </>
          )}


          {/* ── HERO TAB ───────────��───────────────────────────────────────── */}
          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Hero Section</CardTitle><CardDescription>Edit the main hero section content and background</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="hero-title">Title</Label><Textarea id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} rows={2} /></div>
                <div><Label htmlFor="hero-subtitle">Subtitle</Label><Textarea id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={2} /></div>
                <div>
                  <Label htmlFor="hero-background">Background Image URL</Label>
                  <Input id="hero-background" value={heroBackgroundUrl} onChange={(e) => setHeroBackgroundUrl(e.target.value)} placeholder="https://example.com/background.jpg" />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to use the default gradient background</p>
                  {heroBackgroundUrl && <img src={heroBackgroundUrl} alt="Background Preview" className="h-32 w-auto rounded mt-2" />}
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleSaveHero} disabled={isSavingHero} className="w-full">
              <Save className="w-4 h-4 mr-2" /> {isSavingHero ? 'Saving...' : 'Save Hero Section'}
            </Button>
          </TabsContent>
        </div>
      </Tabs>

      {/* ── QUICK CREATE BLOG MODAL ─────────────────────────────────────────── */}
      {/*
        This dialog lives OUTSIDE <Tabs> so it renders on top of any tab.
        It does NOT change the active tab — user stays on Home the whole time.
      */}
      <Dialog open={isQuickBlogOpen} onOpenChange={setIsQuickBlogOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Create New Blog Post</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  Your post will appear instantly in the Blog tab — no need to switch tabs.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable body */}
          <div
            className="overflow-y-auto px-6 pb-6"
            style={{ maxHeight: 'calc(90vh - 170px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="space-y-5 pt-4">

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="qb-title" className="text-sm font-semibold">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qb-title"
                  value={draft.title}
                  onChange={(e) => setDraft(p => ({ ...p, title: e.target.value }))}
                  placeholder="Enter a compelling title for your story..."
                  className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                  autoFocus
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <Label htmlFor="qb-content" className="text-sm font-semibold">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="qb-content"
                  value={draft.content}
                  onChange={(e) => setDraft(p => ({ ...p, content: e.target.value }))}
                  rows={10}
                  placeholder="Write your blog post content here..."
                  className="resize-none focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC] text-sm leading-relaxed min-h-[200px]"
                />
                <p className="text-xs text-gray-400 text-right">{draft.content.length} characters</p>
              </div>

              {/* Author + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="qb-author" className="text-sm font-semibold">Author</Label>
                  <Input id="qb-author" value={draft.author} onChange={(e) => setDraft(p => ({ ...p, author: e.target.value }))} placeholder="Author name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qb-role" className="text-sm font-semibold">Author Role</Label>
                  <Input id="qb-role" value={draft.authorRole} onChange={(e) => setDraft(p => ({ ...p, authorRole: e.target.value }))} placeholder="e.g. Researcher" />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="qb-date" className="text-sm font-semibold">Publish Date</Label>
                <Input id="qb-date" type="date" value={draft.date} min="2000-01-01" max={new Date().toISOString().split('T')[0]} onChange={(e) => setDraft(p => ({ ...p, date: e.target.value }))} />
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Cover Image (Drag & Drop)</Label>
                <p className="text-xs text-gray-500 mb-2">Upload a cover image for this blog post</p>
                <ImageDropzone
                  value={draft.imageUrl || ''}
                  onChange={(url) => setDraft(p => ({ ...p, imageUrl: url }))}
                  label="Cover Image"
                />
              </div>

              {/* Gallery images */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Gallery Images (Drag & Drop)</Label>
                <p className="text-xs text-gray-500 mb-2">Upload additional images for the gallery</p>
                <MultiImageDropzone
                  images={draft.images || []}
                  onChange={(images) => setDraft(p => ({ ...p, images }))}
                  label="Blog Post Images"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Button variant="outline" className="flex-1" onClick={() => setIsQuickBlogOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  onClick={publishQuickBlog}
                  disabled={isSavingQuickBlog}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> {isSavingQuickBlog ? 'Publishing...' : 'Publish Blog Post'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── QUICK CREATE PUBLICATION MODAL ──────────────────────────────────── */}
      {/*
        This dialog lives OUTSIDE <Tabs> so it renders on top of any tab.
        It does NOT change the active tab — user stays on Home the whole time.
      */}
      <Dialog open={isQuickPublicationOpen} onOpenChange={setIsQuickPublicationOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Create New Publication</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  Your publication will appear instantly in the Publications tab — no need to switch tabs.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable body */}
          <div
            className="overflow-y-auto px-6 pb-6"
            style={{ maxHeight: 'calc(90vh - 170px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="space-y-5 pt-4">

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="qp-title" className="text-sm font-semibold">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qp-title"
                  value={publicationDraft.title}
                  onChange={(e) => setPublicationDraft(p => ({ ...p, title: e.target.value }))}
                  placeholder="Enter a compelling title for your publication..."
                  className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                  autoFocus
                />
              </div>

              {/* Authors */}
              <div className="space-y-1.5">
                <Label htmlFor="qp-authors" className="text-sm font-semibold">
                  Authors <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qp-authors"
                  value={publicationDraft.authors}
                  onChange={(e) => setPublicationDraft(p => ({ ...p, authors: e.target.value }))}
                  placeholder="Enter the authors' names..."
                  className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                />
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <Label htmlFor="qp-link" className="text-sm font-semibold">
                  Link <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qp-link"
                  value={publicationDraft.link}
                  onChange={(e) => setPublicationDraft(p => ({ ...p, link: e.target.value }))}
                  placeholder="Enter the publication link..."
                  className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                />
              </div>

              {/* PDF File Upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  PDF File
                </Label>
                <PDFDropzone
                  value={publicationDraft.pdfUrl || ''}
                  onChange={(url) => setPublicationDraft(p => ({ ...p, pdfUrl: url }))}
                  label="Drop PDF file here or click to browse"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <Label htmlFor="qp-content" className="text-sm font-semibold">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="qp-content"
                  value={publicationDraft.content}
                  onChange={(e) => setPublicationDraft(p => ({ ...p, content: e.target.value }))}
                  rows={10}
                  placeholder="Write your publication content here..."
                  className="resize-none focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC] text-sm leading-relaxed min-h-[200px]"
                />
                <p className="text-xs text-gray-400 text-right">{publicationDraft.content.length} characters</p>
              </div>

              {/* Published Date */}
              <div className="space-y-1.5">
                <Label htmlFor="qp-publishedDate" className="text-sm font-semibold">Publish Date</Label>
                <Input id="qp-publishedDate" type="date" value={publicationDraft.publishedDate} min="2000-01-01" max={new Date().toISOString().split('T')[0]} onChange={(e) => setPublicationDraft(p => ({ ...p, publishedDate: e.target.value }))} />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Button variant="outline" className="flex-1" onClick={() => setIsQuickPublicationOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  onClick={publishQuickPublication}
                  disabled={isSavingQuickPublication}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> {isSavingQuickPublication ? 'Publishing...' : 'Publish Publication'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── HIGHLIGHT MODAL (accessible from Home tab Quick Actions) ──────────── */}
      <Dialog open={isHighlightModalOpen} onOpenChange={setIsHighlightModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Edit Highlight</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">Update the details for this highlight and click Save to persist changes.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingHighlight && (
            <div className="space-y-6 py-2">
              <div className="space-y-2"><Label className="text-sm font-medium">Title</Label><Input value={editingHighlight.title} onChange={(e) => { const u={...editingHighlight,title:e.target.value}; setEditingHighlight(u); updateHighlight(editingHighlight.id,'title',e.target.value); }} /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Description</Label><Textarea value={editingHighlight.description} onChange={(e) => { const u={...editingHighlight,description:e.target.value}; setEditingHighlight(u); updateHighlight(editingHighlight.id,'description',e.target.value); }} rows={3} className="resize-none" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Icon</Label><Select value={editingHighlight.iconName} onValueChange={(v) => { const u={...editingHighlight,iconName:v}; setEditingHighlight(u); updateHighlight(editingHighlight.id,'iconName',v); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Satellite">Satellite</SelectItem><SelectItem value="Sprout">Sprout</SelectItem><SelectItem value="BarChart3">BarChart3</SelectItem><SelectItem value="Globe">Globe</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Detailed Content</Label><Textarea value={editingHighlight.content||''} onChange={(e) => { const u={...editingHighlight,content:e.target.value}; setEditingHighlight(u); updateHighlight(editingHighlight.id,'content',e.target.value); }} rows={6} className="resize-none" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Published Date</Label><Input type="date" value={editingHighlight.publishedDate||''} min="2000-01-01" max={new Date().toISOString().split('T')[0]} onChange={(e) => { const u={...editingHighlight,publishedDate:e.target.value}; setEditingHighlight(u); updateHighlight(editingHighlight.id,'publishedDate',e.target.value); }} /></div>
              
              {/* Cover Image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Image (Drag & Drop)</Label>
                <p className="text-xs text-gray-500 mb-2">Upload a cover image for this highlight</p>
                <ImageDropzone 
                  value={editingHighlight.imageUrl} 
                  onChange={(url) => { 
                    const u={...editingHighlight,imageUrl:url}; 
                    setEditingHighlight(u); 
                    updateHighlight(editingHighlight.id,'imageUrl',url); 
                  }} 
                  label="Cover Image"
                />
              </div>
              
              {/* Gallery Images */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gallery Images (Drag & Drop)</Label>
                <p className="text-xs text-gray-500 mb-2">Upload additional images for the gallery</p>
                <MultiImageDropzone images={editingHighlight.images||[]} onChange={(images) => { const u={...editingHighlight,images}; setEditingHighlight(u); updateHighlightImages(editingHighlight.id,images); }} label="Highlight Images" />
              </div>
              
              {/* Featured Checkbox */}
              <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input 
                  type="checkbox" 
                  id="featured-highlight"
                  checked={editingHighlight.featured || false}
                  onChange={(e) => {
                    const featuredCount = highlights.filter(h => h.featured && h.id !== editingHighlight.id).length;
                    if (e.target.checked && featuredCount >= 4) {
                      alert('You can only have 4 featured highlights. Please unfeature another highlight first.');
                      return;
                    }
                    const u = {...editingHighlight, featured: e.target.checked};
                    setEditingHighlight(u);
                    updateHighlight(editingHighlight.id, 'featured', e.target.checked);
                  }}
                  className="w-5 h-5 text-[#1887FC] border-gray-300 rounded focus:ring-[#1887FC]"
                />
                <div className="flex-1">
                  <Label htmlFor="featured-highlight" className="text-sm font-semibold text-blue-900 cursor-pointer flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    Featured Highlight
                  </Label>
                  <p className="text-xs text-blue-700 mt-1">Display this highlight on the home page (max 4)</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" className="flex-1 w-full" onClick={() => setIsHighlightModalOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button 
                  className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  disabled={isSavingHighlight}
                  onClick={async () => {
                    if (editingHighlight && !isSavingHighlight) {
                      setIsSavingHighlight(true);
                      try {
                        // Check if this is a new item (not in array)
                        const exists = highlights.find(item => item.id === editingHighlight.id);
                        if (!exists) {
                          // New item - add to array first
                          setHighlights([...highlights, editingHighlight]);
                        }
                        // Save to Supabase
                        await handleSaveHighlights(editingHighlight);
                        setIsHighlightModalOpen(false);
                      } catch (error) {
                        // Error already handled in handleSaveHighlights
                      } finally {
                        setIsSavingHighlight(false);
                      }
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> {isSavingHighlight ? 'Saving...' : 'Save Highlight'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── TEAM MEMBER MODAL (accessible from Home tab Quick Actions) ──────────── */}
      <Dialog open={isTeamMemberModalOpen} onOpenChange={setIsTeamMemberModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Edit Team Member</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">Update the details for this team member and click Save to persist changes.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingTeamMember && (
            <div className="space-y-6 py-2">
              <div className="space-y-2"><Label className="text-sm font-medium">Name</Label><Input value={editingTeamMember.name} onChange={(e) => { const u={...editingTeamMember,name:e.target.value}; setEditingTeamMember(u); updateTeamMember(editingTeamMember.id,'name',e.target.value); }} /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Role</Label><Input value={editingTeamMember.role} onChange={(e) => { const u={...editingTeamMember,role:e.target.value}; setEditingTeamMember(u); updateTeamMember(editingTeamMember.id,'role',e.target.value); }} /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Description</Label><Textarea value={editingTeamMember.description} onChange={(e) => { const u={...editingTeamMember,description:e.target.value}; setEditingTeamMember(u); updateTeamMember(editingTeamMember.id,'description',e.target.value); }} rows={4} className="resize-none" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Member Photo</Label><ImageDropzone value={editingTeamMember.imageUrl||''} onChange={(url) => { const u={...editingTeamMember,imageUrl:url}; setEditingTeamMember(u); updateTeamMember(editingTeamMember.id,'imageUrl',url); }} /></div>
              
              {/* Save Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" className="flex-1 w-full" onClick={() => setIsTeamMemberModalOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button 
                  className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  disabled={isSavingTeamMember}
                  onClick={async () => {
                    if (editingTeamMember && !isSavingTeamMember) {
                      setIsSavingTeamMember(true);
                      try {
                        // Check if this is a new item (not in array)
                        const exists = teamMembers.find(item => item.id === editingTeamMember.id);
                        if (!exists) {
                          // New item - add to array first
                          setTeamMembers([...teamMembers, editingTeamMember]);
                        }
                        // Save to Supabase
                        await handleSaveTeamMembers(editingTeamMember);
                        setIsTeamMemberModalOpen(false);
                      } catch (error) {
                        // Error already handled in handleSaveTeamMembers
                      } finally {
                        setIsSavingTeamMember(false);
                      }
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> {isSavingTeamMember ? 'Saving...' : 'Save Team Member'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── PARTNER MODAL (accessible from Home tab Quick Actions) ──────────── */}
      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Edit Partner</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">Update the details for this partner and click Save to persist changes.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingPartner && (
            <div className="space-y-6 py-2">
              <div className="space-y-2"><Label className="text-sm font-medium">Name</Label><Input value={editingPartner.name} onChange={(e) => { const u={...editingPartner,name:e.target.value}; setEditingPartner(u); updatePartner(editingPartner.id,'name',e.target.value); }} /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Partner Logo</Label><ImageDropzone value={editingPartner.logoUrl} onChange={(url) => { const u={...editingPartner,logoUrl:url}; setEditingPartner(u); updatePartner(editingPartner.id,'logoUrl',url); }} /></div>
              
              {/* Save Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" className="flex-1 w-full" onClick={() => setIsPartnerModalOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button 
                  className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  disabled={isSavingPartner}
                  onClick={async () => {
                    if (editingPartner && !isSavingPartner) {
                      setIsSavingPartner(true);
                      try {
                        // Check if this is a new item (not in array)
                        const exists = partners.find(item => item.id === editingPartner.id);
                        if (!exists) {
                          // New item - add to array first
                          setPartners([...partners, editingPartner]);
                        }
                        // Save to Supabase
                        await handleSavePartners(editingPartner);
                        setIsPartnerModalOpen(false);
                      } catch (error) {
                        // Error already handled in handleSavePartners
                      } finally {
                        setIsSavingPartner(false);
                      }
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> {isSavingPartner ? 'Saving...' : 'Save Partner'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog />
    </div>
  );
};