import React, { useState, useEffect } from 'react';
// Admin Panel - Fixed all function references (updateTeamMembers, etc.)
import { useContent, NewsItem, Publication, Partner, Highlight, TeamMember, NewsItemForm, HighlightForm, TeamMemberForm, PartnerForm, BlogPostForm, PublicationForm, Project, InternshipTestimonial, FinancialStatement } from '@/app/context/ContentContext';
import { Plus, Trash2, Save, Edit, FileText, Newspaper, Sparkles, Users, Info, Briefcase, BookOpen, Handshake, Home, X, CheckCircle, Star, AlertCircle } from 'lucide-react';
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
import { VisualRichEditor } from '@/app/components/admin/VisualRichEditor';
import { SharedToolbar } from '@/app/components/admin/SharedToolbar';
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
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { RichTextContent } from '@/app/components/RichTextContent';
import {
  AdminValidationRules,
  mergeValidationResults,
  validateMaxChars,
  validateMaxWords,
  validateRequiredTrimmed,
  validateNoDigits,
} from '@/app/components/admin/utils/adminHelpers';
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
import { uploadImage, uploadImages, uploadPDF, deleteStorageFile } from '@/utils/storageUpload';

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
    updateNews,
    updatePublications,
    updatePartners,
    updateHighlights,
    updateTeamMembers,
    updateAbout,
    updateInternationallyFundedProjects,
    updateLocallyFundedProjects,
    updateCommunityTransformationProjects,
    updateFinancialStatements,
    updateStudyFindings,
    updateInternshipTestimonials,
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
  } = useContent();
  
  const [newsItems, setNewsItems] = useState<NewsItem[]>(content.newsItems);
  const [publications, setPublications] = useState<Publication[]>(content.publications);
  const [partners, setPartners] = useState<Partner[]>(content.partners);
  const [highlights, setHighlights] = useState<Highlight[]>(content.highlights);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(content.teamMembers);
  const [heroTitle, setHeroTitle] = useState(content.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(content.heroSubtitle);
  const [aboutText, setAboutText] = useState(content.aboutText);
  const [aboutVision, setAboutVision] = useState(content.aboutVision);
  const [aboutMission, setAboutMission] = useState(content.aboutMission);
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState(content.heroBackgroundUrl);

  // ── Quick Create Blog modal ───────────────────────────────────────────────
  const [isQuickBlogOpen, setIsQuickBlogOpen] = useState(false);
  const [quickBlogActiveField, setQuickBlogActiveField] = useState<string | null>(null);
  const [draft, setDraft] = useState<BlogPostForm>({
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

  const handleQuickBlogCommand = (cmd: string, val?: string) => {
    if (quickBlogActiveField) {
      const event = new CustomEvent(`editor-command-${quickBlogActiveField}`, {
        detail: { command: cmd, value: val }
      });
      window.dispatchEvent(event);
    }
  };

  const handleQuickBlogImageUpload = async (file: File) => {
    if (!quickBlogActiveField) {
      toast.error('Please click on the content area first to insert an image');
      return;
    }
    try {
      const url = await uploadImage(file, 'blog');
      handleQuickBlogCommand('insertImage', url);
      toast.success('Image uploaded and inserted!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  // ── Quick Create Publication modal ────────────────────────────────────────
  const [isQuickPublicationOpen, setIsQuickPublicationOpen] = useState(false);
  const [quickPubActiveField, setQuickPubActiveField] = useState<string | null>(null);
  const [publicationDraft, setPublicationDraft] = useState<PublicationForm>({
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

  const handleQuickPubCommand = (cmd: string, val?: string) => {
    if (quickPubActiveField) {
      const event = new CustomEvent(`editor-command-${quickPubActiveField}`, {
        detail: { command: cmd, value: val }
      });
      window.dispatchEvent(event);
    }
  };

  // News modal state
  const [editingNews, setEditingNews] = useState<NewsItemForm | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsActiveField, setNewsActiveField] = useState<string | null>(null);

  const handleNewsCommand = (cmd: string, val?: string) => {
    if (newsActiveField) {
      const event = new CustomEvent(`editor-command-${newsActiveField}`, {
        detail: { command: cmd, value: val }
      });
      window.dispatchEvent(event);
    }
  };

  // Highlights modal state
  const [editingHighlight, setEditingHighlight] = useState<HighlightForm | null>(null);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [showMigrationWarning, setShowMigrationWarning] = useState(false);
  const [highlightActiveField, setHighlightActiveField] = useState<string | null>(null);

  const handleHighlightCommand = (cmd: string, val?: string) => {
    if (highlightActiveField) {
      const event = new CustomEvent(`editor-command-${highlightActiveField}`, {
        detail: { command: cmd, value: val }
      });
      window.dispatchEvent(event);
    }
  };

  // Team modal state
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMemberForm | null>(null);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [teamActiveField, setTeamActiveField] = useState<string | null>(null);

  const handleTeamCommand = (cmd: string, val?: string) => {
    if (teamActiveField) {
      const event = new CustomEvent(`editor-command-${teamActiveField}`, {
        detail: { command: cmd, value: val }
      });
      window.dispatchEvent(event);
    }
  };

  // Partners modal state
  const [editingPartner, setEditingPartner] = useState<PartnerForm | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);


  // Loading states for Quick Actions and change tracking
  const [isSavingQuickBlog, setIsSavingQuickBlog] = useState(false);
  const [isSavingQuickPublication, setIsSavingQuickPublication] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);
  const [isSavingTeamMember, setIsSavingTeamMember] = useState(false);
  const [isSavingPartner, setIsSavingPartner] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState('home');

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
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - intentionally omitting fetch functions to prevent re-fetch loops

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
    setAboutVision(content.aboutVision);
    setAboutMission(content.aboutMission);
    setHeroBackgroundUrl(content.heroBackgroundUrl);
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
  ]);

  // ── Tab change handler with lazy loading ─────────────────────────────────
  const handleTabChange = async (value: string) => {
    if (value === activeTab) return; // Don't reload if same tab

    setActiveTab(value);

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

    const validation = mergeValidationResults(
      validateRequiredTrimmed(draft.title, 'Title'),
      validateMaxChars(draft.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(draft.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(draft.content, 'Content'),
      validateMaxChars(draft.content.trim(), AdminValidationRules.contentMaxChars, 'Content'),
      validateRequiredTrimmed(draft.author, 'Author'),
      validateNoDigits(draft.author, 'Author'),
      validateMaxChars(draft.author.trim(), AdminValidationRules.nameMaxChars, 'Author'),
      validateMaxWords(draft.author.trim(), AdminValidationRules.nameMaxWords, 'Author'),
      validateMaxChars((draft.authorRole || '').trim(), AdminValidationRules.roleMaxChars, 'Author role'),
      validateMaxWords((draft.authorRole || '').trim(), AdminValidationRules.roleMaxWords, 'Author role'),
      validateNoDigits(draft.authorRole || '', 'Author role')
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    setIsSavingQuickBlog(true);
    try {
      // Handle Image Uploads before saving to database
      let finalImageUrl = draft.imageUrl;
      if (typeof finalImageUrl === 'object' && (finalImageUrl as any) instanceof File) {
        finalImageUrl = await uploadImage(finalImageUrl as any, 'blog');
      }

      let finalImages = draft.images || [];
      if (draft.images && draft.images.some(img => typeof img === 'object')) {
        const filesToUpload = draft.images.filter(img => typeof img === 'object') as File[];
        const uploadedUrls = await uploadImages(filesToUpload, 'blog');
        let uploadIdx = 0;
        finalImages = draft.images.map(img => {
          if (typeof img === 'object') {
            return uploadedUrls[uploadIdx++];
          }
          return img as string;
        });
      }

      // Save to database
      const blogData = {
        title: draft.title,
        content: draft.content,
        author: draft.author,
        author_role: draft.authorRole,
        date: draft.date,
        image_url: (finalImageUrl as string) || null,
        images: (finalImages as string[]) || null,
        likes: draft.likes || 0
      };
      
      const created = await createBlogPost(blogData);
      
      if (created) {
        // Refresh from database
        await refreshContent();
        setIsQuickBlogOpen(false);
        setActiveTab('blog');
        toast.success('Blog post saved successfully!', );
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

    const validation = mergeValidationResults(
      validateRequiredTrimmed(publicationDraft.title, 'Title'),
      validateMaxChars(publicationDraft.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(publicationDraft.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(publicationDraft.content || '', 'Content'),
      validateMaxChars((publicationDraft.content || '').trim(), AdminValidationRules.contentMaxChars, 'Content'),
      validateMaxChars((publicationDraft.authors || '').trim(), AdminValidationRules.authorsMaxChars, 'Authors'),
      validateMaxWords((publicationDraft.authors || '').trim(), AdminValidationRules.authorsMaxWords, 'Authors'),
      validateNoDigits(publicationDraft.authors || '', 'Authors'),
      validateMaxChars((publicationDraft.excerpt || '').trim(), AdminValidationRules.shortTextMaxChars, 'Excerpt'),
      validateMaxWords((publicationDraft.excerpt || '').trim(), AdminValidationRules.shortTextMaxWords, 'Excerpt'),
      validateMaxChars((publicationDraft.sentence || '').trim(), AdminValidationRules.shortTextMaxChars, 'Sentence'),
      validateMaxWords((publicationDraft.sentence || '').trim(), AdminValidationRules.shortTextMaxWords, 'Sentence')
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    setIsSavingQuickPublication(true);
    try {
      // Handle PDF Upload before saving to database
      let finalPdfUrl = publicationDraft.pdfUrl;
      if (finalPdfUrl instanceof File) {
        finalPdfUrl = await uploadPDF(finalPdfUrl, 'publications');
      }

      // Save to database
      const publicationData = {
        title: publicationDraft.title,
        authors: publicationDraft.authors,
        link: publicationDraft.link,
        featured: publicationDraft.featured,
        pdf_url: (finalPdfUrl as string) || null,
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
        await refreshContent();
        setIsQuickPublicationOpen(false);
        setActiveTab('publications');
        toast.success('Publication saved successfully!');
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

  const handleSaveNews = async (newsItem?: NewsItemForm) => {
    try {
      const itemsToSave = newsItem ? [newsItem] : newsItems;
      
      // Save each news item to database
      for (const item of itemsToSave) {
        // Handle Image Uploads before saving
        let finalImageUrl = item.imageUrl;
        if (typeof finalImageUrl === 'object' && (finalImageUrl as any) instanceof File) {
          finalImageUrl = await uploadImage(finalImageUrl as any, 'news');
        }

        let finalImages = item.images || [];
        if (item.images && item.images.some(img => typeof img === 'object')) {
          const filesToUpload = item.images.filter(img => typeof img === 'object') as File[];
          const uploadedUrls = await uploadImages(filesToUpload, 'news');
          let uploadIdx = 0;
          finalImages = item.images.map(img => {
            if (typeof img === 'object') {
              return uploadedUrls[uploadIdx++];
            }
            return img as string;
          });
        }

        const newsData = {
          title: item.title,
          content: item.content,
          date: item.date,
          image_url: (finalImageUrl as string) || null,
          images: (finalImages as string[]) || null
        };
        
        if (item.id.startsWith('temp-')) {
          // Create new
          const created = await createNews(newsData);
          if (created && newsItem) {
            // Replace temp ID with real ID from database
            setNewsItems(newsItems.map(i => 
              i.id === item.id ? { ...item, id: created.id, imageUrl: (finalImageUrl as string), images: (finalImages as string[]) } : i
            ));
          }
        } else {
          // Update existing
          await updateNewsInDb(item.id, newsData);
        }
      }
      
      // Refresh from database
      await refreshContent();
      toast.success('News saved successfully!');
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Failed to save news.');
      throw error;
    }
  };
  
  const addNewsItem = () => {
    const n: NewsItemForm = { id: `temp-${Date.now()}`, title: '', content: '', date: new Date().toISOString().split('T')[0], imageUrl: '', images: [] };
    setEditingNews(n); setIsNewsModalOpen(true);
  };
  
  const deleteNewsItem = async (id: string) => {
    try {
      const confirmed = await confirmDelete({
        itemName: 'news item',
        title: 'Delete News Item',
        message: 'Are you sure you want to delete this news item? This action cannot be undone.'
      });
      if (!confirmed) return;

      if (!id.startsWith('temp-')) {
        // Find the item to get its image URLs
        const itemToDelete = newsItems.find(i => i.id === id);
        if (itemToDelete) {
          // Delete main image
          if (itemToDelete.imageUrl) {
            await deleteStorageFile(itemToDelete.imageUrl, 'news');
          }
          // Delete additional images
          if (itemToDelete.images && itemToDelete.images.length > 0) {
            for (const imgUrl of itemToDelete.images) {
              await deleteStorageFile(imgUrl, 'news');
            }
          }
        }
        await deleteNewsFromDb(id);
      }
      setNewsItems(newsItems.filter(i => i.id !== id));
      await refreshContent();
      toast.success('News item deleted successfully!');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news item.');
    }
  };
  
  const updateNewsItem = <K extends keyof NewsItem>(id: string, field: K, value: NewsItem[K]) => setNewsItems(newsItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  const updateNewsItemImages = (id: string, images: Array<string | File>) => {
    const sanitized = images.filter((img): img is string => typeof img === 'string');
    setNewsItems(newsItems.map(i => i.id === id ? { ...i, images: sanitized, imageUrl: sanitized[0] || '' } : i));
  };
  const updateHighlightImages = (id: string, images: Array<string | File>) => {
    const sanitized = images.filter((img): img is string => typeof img === 'string');
    setHighlights(highlights.map(h => h.id === id ? { ...h, images: sanitized, imageUrl: sanitized[0] || '' } : h));
  };

  const handleSavePartners = async (partner?: PartnerForm) => {
    try {
      const itemsToSave = partner ? [partner] : partners;
      
      for (const item of itemsToSave) {
        // Handle Image Upload before saving
        let finalLogoUrl = item.logoUrl;
        if (typeof finalLogoUrl === 'object' && (finalLogoUrl as any) instanceof File) {
          finalLogoUrl = await uploadImage(finalLogoUrl as any, 'partners');
        }

        const partnerData = {
          name: item.name,
          logo_url: (finalLogoUrl as string) || ''
        };
        
        if (item.id.startsWith('temp-')) {
          const created = await createPartner(partnerData);
          if (created && partner) {
            setPartners(partners.map(p => 
              p.id === item.id ? { ...item, id: created.id, logoUrl: (finalLogoUrl as string) } : p
            ));
          }
        } else {
          await updatePartnerInDb(item.id, partnerData);
        }
      }
      
      await refreshContent();
      toast.success('Partners saved successfully!');
    } catch (error) {
      console.error('Error saving partners:', error);
      toast.error('Failed to save partners.');
      throw error;
    }
  };
  
  const addPartner = () => {
    const p: PartnerForm = {
      id: `temp-${Date.now()}`,
      name: '',
      logoUrl: ''
    };
    setEditingPartner(p);
    setIsPartnerModalOpen(true);
  };
  
  const deletePartner = async (id: string) => {
    try {
      const confirmed = await confirmDelete({
        itemName: 'partner',
        title: 'Delete Partner',
        message: 'Are you sure you want to delete this partner? This action cannot be undone.'
      });
      if (!confirmed) return;

      if (!id.startsWith('temp-')) {
        // Find the item to get its logo URL
        const itemToDelete = partners.find(p => p.id === id);
        if (itemToDelete?.logoUrl) {
          await deleteStorageFile(itemToDelete.logoUrl, 'partners');
        }
        await deletePartnerFromDb(id);
      }
      setPartners(partners.filter(p => p.id !== id));
      await refreshContent();
      toast.success('Partner deleted successfully!');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner.');
    }
  };
  
  const updatePartner = <K extends keyof Partner>(id: string, field: K, value: Partner[K]) => setPartners(partners.map(p => p.id === id ? { ...p, [field]: value } : p));

  // Highlights handlers - Now saves to Supabase with image upload
  const handleSaveHighlights = async (highlight?: HighlightForm) => {
    try {
      const itemsToSave = highlight ? [highlight] : highlights;
      
      for (const item of itemsToSave) {
        // Handle Image Uploads before saving
        let finalImageUrl = item.imageUrl;
        if (typeof finalImageUrl === 'object' && (finalImageUrl as any) instanceof File) {
          finalImageUrl = await uploadImage(finalImageUrl as any, 'highlights');
        }

        let finalImages = item.images || [];
        if (item.images && item.images.some(img => typeof img === 'object')) {
          const filesToUpload = item.images.filter(img => typeof img === 'object') as File[];
          const uploadedUrls = await uploadImages(filesToUpload, 'highlights');
          let uploadIdx = 0;
          finalImages = item.images.map(img => {
            if (typeof img === 'object') {
              return uploadedUrls[uploadIdx++];
            }
            return img as string;
          });
        }

        // Prepare data - conditionally include 'featured' only if it's defined
        const highlightData: any = {
          title: item.title,
          description: item.description,
          image_url: (finalImageUrl as string) || '',
          images: (finalImages as string[]) || null,
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
            setHighlights(highlights.map(h => 
              h.id === item.id ? { ...item, id: created.id, imageUrl: (finalImageUrl as string), images: (finalImages as string[]) } : h
            ));
          }
        } else {
          await updateHighlightInDb(item.id, highlightData);
        }
      }
      
      await refreshContent();
      toast.success('Highlights saved successfully!');
      setShowMigrationWarning(false);
    } catch (error: any) {
      console.error('Error saving highlights:', error);
      
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
    const h: HighlightForm = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      images: [],
      iconName: 'Globe',
      content: '',
      publishedDate: new Date().toISOString().split('T')[0],
      featured: false,
    };
    setEditingHighlight(h);
    setIsHighlightModalOpen(true);
  };
  
  const deleteHighlight = async (id: string) => {
    try {
      const confirmed = await confirmDelete({
        itemName: 'highlight',
        title: 'Delete Highlight',
        message: 'Are you sure you want to delete this highlight? This action cannot be undone.'
      });
      if (!confirmed) return;

      if (!id.startsWith('temp-')) {
        // Find the item to get its image URLs
        const itemToDelete = highlights.find(h => h.id === id);
        if (itemToDelete) {
          // Delete main image
          if (itemToDelete.imageUrl) {
            await deleteStorageFile(itemToDelete.imageUrl, 'highlights');
          }
          // Delete additional images
          if (itemToDelete.images && itemToDelete.images.length > 0) {
            for (const imgUrl of itemToDelete.images) {
              await deleteStorageFile(imgUrl, 'highlights');
            }
          }
        }
        await deleteHighlightFromDb(id);
      }
      setHighlights(highlights.filter(h => h.id !== id));
      await refreshContent();
      toast.success('Highlight deleted successfully!');
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight.');
    }
  };
  const updateHighlight = <K extends keyof Highlight>(id: string, field: K, value: Highlight[K]) => setHighlights(highlights.map(h => h.id === id ? { ...h, [field]: value } : h));

  // Team Members handlers - Now saves to Supabase with image upload
  const handleSaveTeamMembers = async (member?: TeamMemberForm) => {
    try {
      const itemsToSave = member ? [member] : teamMembers;
      
      for (const item of itemsToSave) {
        // Handle Image Upload before saving
        let finalImageUrl = item.imageUrl;
        if (typeof finalImageUrl === 'object' && (finalImageUrl as any) instanceof File) {
          finalImageUrl = await uploadImage(finalImageUrl as any, 'team');
        }

        const memberData = {
          name: item.name,
          role: item.role,
          description: item.description,
          image_url: (finalImageUrl as string) || null
        };
        
        if (item.id.startsWith('temp-')) {
          const created = await createTeamMember(memberData);
          if (created && member) {
            setTeamMembers(teamMembers.map(m => 
              m.id === item.id ? { ...item, id: created.id, imageUrl: (finalImageUrl as string) } : m
            ));
          }
        } else {
          await updateTeamInDb(item.id, memberData);
        }
      }
      
      await refreshContent();
      toast.success('Team members saved successfully!');
    } catch (error) {
      console.error('Error saving team members:', error);
      toast.error('Failed to save team members.');
      throw error;
    }
  };
  
  const addTeamMember = () => { const m: TeamMemberForm = { id: `temp-${Date.now()}`, name: '', role: '', description: '', imageUrl: '' }; setEditingTeamMember(m); setIsTeamMemberModalOpen(true); };
  
  const deleteTeamMember = async (id: string) => {
    try {
      const confirmed = await confirmDelete({
        itemName: 'team member',
        title: 'Delete Team Member',
        message: 'Are you sure you want to delete this team member? This action cannot be undone.'
      });
      if (!confirmed) return;

      if (!id.startsWith('temp-')) {
        // Find the item to get its image URL
        const itemToDelete = teamMembers.find(m => m.id === id);
        if (itemToDelete?.imageUrl) {
          await deleteStorageFile(itemToDelete.imageUrl, 'team');
        }
        await deleteTeamFromDb(id);
      }
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      await refreshContent();
      toast.success('Team member deleted successfully!');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member.');
    }
  };
  
  const updateTeamMember = <K extends keyof TeamMember>(id: string, field: K, value: TeamMember[K]) => setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));

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

     const validation = mergeValidationResults(
       validateRequiredTrimmed(heroTitle, 'Hero title'),
       validateMaxChars(heroTitle.trim(), AdminValidationRules.shortTitleMaxChars, 'Hero title'),
       validateMaxWords(heroTitle.trim(), AdminValidationRules.shortTitleMaxWords, 'Hero title'),
       validateRequiredTrimmed(heroSubtitle, 'Hero subtitle'),
       validateMaxChars(heroSubtitle.trim(), AdminValidationRules.shortTextMaxChars, 'Hero subtitle'),
       validateMaxWords(heroSubtitle.trim(), AdminValidationRules.shortTextMaxWords, 'Hero subtitle'),
       validateMaxChars((heroBackgroundUrl || '').trim(), 1000, 'Background image URL')
     );
     if (!validation.isValid) {
       toast.error(validation.error || 'Validation failed');
       return;
     }

    setIsSavingHero(true);
    try {
      await updateHeroSection({
        title: heroTitle,
        subtitle: heroSubtitle,
        background_url: heroBackgroundUrl || null
      });
      
      await refreshContent();
      toast.success('Hero section saved successfully!');
    } catch (error) {
      console.error('Error saving hero section:', error);
      toast.error('Failed to save hero section.');
    } finally {
      setIsSavingHero(false);
    }
  };
  
  const handleSaveAbout = async () => {
    const validation = mergeValidationResults(
      validateRequiredTrimmed(aboutText, 'About text'),
      validateMaxChars(aboutText.trim(), AdminValidationRules.contentMaxChars, 'About text'),
      validateRequiredTrimmed(aboutVision, 'Vision'),
      validateMaxChars(aboutVision.trim(), AdminValidationRules.contentMaxChars, 'Vision'),
      validateRequiredTrimmed(aboutMission, 'Mission'),
      validateMaxChars(aboutMission.trim(), AdminValidationRules.contentMaxChars, 'Mission')
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }

    try {
      await updateAboutSection({
        vision: aboutVision,
        mission: aboutMission,
        description: aboutText
      });
      updateAbout(aboutText);
      // We also need to update vision/mission in context if possible, 
      // but refreshContent will handle it.
      await refreshContent();
      toast.success('About section saved successfully!');
    } catch (error) {
      console.error('Error saving about section:', error);
      toast.error('Failed to save about section.');
    }
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


          {/* ── HOME TAB ───────────────────────────────────────────────────── */}
          <TabsContent value="home" className="space-y-6">
            {/* Tips + Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tips Card */}
              <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <span className="text-lg">💡</span>
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-900">Tips</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {[
                    "Click on any card in the grid views to open the edit modal",
                    "Use the Save buttons to persist your changes after editing",
                    "Images can be uploaded via drag-and-drop or URL input",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <p className="text-gray-600 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Content Overview Card */}
              <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-900">Content Overview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {[
                    { label: 'Highlights', value: dbCounts.highlights },
                    { label: 'Publications', value: dbCounts.publications },
                    { label: 'Projects (All)', value: dbCounts.projects },
                    { label: 'Testimonials', value: dbCounts.testimonials },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.value} items</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mt-6 border border-gray-100 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
                <CardDescription className="text-sm text-gray-500 font-medium">Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* ★ Create Blog Post */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-5 px-5 hover:border-[#1887FC]/30 hover:bg-blue-50/30 transition-all group rounded-2xl border-gray-100 shadow-sm"
                    onClick={openQuickBlog}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-[#1887FC] group-hover:bg-[#1887FC] group-hover:text-white transition-all shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="font-bold text-[15px] text-gray-900">Create Blog Post</div>
                        <p className="text-xs text-gray-500 font-medium group-hover:text-[#1887FC]/80 transition-colors">Write a <span className="text-[#1887FC] underline underline-offset-2">new article</span></p>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add News Update */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-5 px-5 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group rounded-2xl border-gray-100 shadow-sm"
                    onClick={addNewsItem}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <Newspaper className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="font-bold text-[15px] text-gray-900">Add News Update</div>
                        <p className="text-xs text-gray-500 font-medium group-hover:text-emerald-600/80 transition-colors">Post an <span className="text-emerald-600 underline underline-offset-2">announcement</span></p>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add Team Member */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-5 px-5 hover:border-violet-200 hover:bg-violet-50/30 transition-all group rounded-2xl border-gray-100 shadow-sm"
                    onClick={addTeamMember}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="font-bold text-[15px] text-gray-900">Add Team Member</div>
                        <p className="text-xs text-gray-500 font-medium group-hover:text-violet-600/80 transition-colors">Manage your <span className="text-violet-600 underline underline-offset-2">team</span></p>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add Highlight */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-5 px-5 hover:border-amber-200 hover:bg-amber-50/30 transition-all group rounded-2xl border-gray-100 shadow-sm"
                    onClick={addHighlight}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="font-bold text-[15px] text-gray-900">Add Highlight</div>
                        <p className="text-xs text-gray-500 font-medium group-hover:text-amber-600/80 transition-colors">Feature your <span className="text-amber-600 underline underline-offset-2">work</span></p>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Add Partner */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-5 px-5 hover:border-orange-200 hover:bg-orange-50/30 transition-all group rounded-2xl border-gray-100 shadow-sm"
                    onClick={addPartner}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                        <Handshake className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="font-bold text-[15px] text-gray-900">Add Partner</div>
                        <div className="text-xs text-gray-500 font-medium group-hover:text-orange-600/80 transition-colors">Showcase collaborators</div>
                      </div>
                    </div>
                  </Button>

                  {/* ★ Create Publication */}
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-5 px-5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group rounded-2xl border-gray-100 shadow-sm"
                    onClick={openQuickPublication}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="font-bold text-[15px] text-gray-900">Create Publication</div>
                        <p className="text-xs text-gray-500 font-medium group-hover:text-indigo-600/80 transition-colors">Add <span className="text-indigo-600 underline underline-offset-2">new publication</span></p>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ── BLOG TAB — receives the shared blogPosts state ─────────────── */}
          <TabsContent value="blog">
            <BlogManager refreshContent={refreshContent} />
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
                <CardDescription>Edit the about section content including Mission and Vision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="about-mission" className="text-sm font-semibold text-gray-700">Mission</Label>
                  <Textarea 
                    id="about-mission" 
                    value={aboutMission} 
                    onChange={(e) => setAboutMission(e.target.value)} 
                    rows={4} 
                    placeholder="Enter the organization's mission..."
                    className="mt-1.5 focus:ring-2 focus:ring-[#1887FC]" 
                  />
                  <p className="text-xs text-gray-500 italic">Tip: Use &lt;span class='text-[#1887FC] font-bold'&gt;keywords&lt;/span&gt; to highlight text.</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="about-vision" className="text-sm font-semibold text-gray-700">Vision</Label>
                  <Textarea 
                    id="about-vision" 
                    value={aboutVision} 
                    onChange={(e) => setAboutVision(e.target.value)} 
                    rows={4} 
                    placeholder="Enter the organization's vision..."
                    className="mt-1.5 focus:ring-2 focus:ring-[#1887FC]" 
                  />
                  <p className="text-xs text-gray-500 italic">Tip: Use &lt;span class='text-[#1887FC] font-bold'&gt;keywords&lt;/span&gt; to highlight text.</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="about-text" className="text-sm font-semibold text-gray-700">About Text / Story</Label>
                  <Textarea id="about-text" value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={6} className="mt-1.5 focus:ring-2 focus:ring-[#1887FC]" />
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                  onClick={handleSaveAbout}
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
            {false && editingNews && (<Card key="x" className="cursor-pointer hover:shadow-lg transition-shadow relative group" onClick={() => { setEditingNews({} as any); setIsNewsModalOpen(true); }}>
                  <div className="absolute top-2 left-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        const confirmed = await confirmDelete({ itemName: 'news item' });
                        if (confirmed && editingNews) deleteNewsItem((editingNews as NewsItemForm).id); 
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  {(editingNews as NewsItemForm).imageUrl ? (<div className="w-full h-48 overflow-hidden rounded-t-lg"><img src={(editingNews as NewsItemForm).imageUrl as string} alt={(editingNews as NewsItemForm).title} className="w-full h-full object-cover" /></div>) : (<div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center"><FileText className="w-12 h-12 text-gray-400" /></div>)}
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2">{(editingNews as NewsItemForm).title}</h4>
                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                      <RichTextContent text={(editingNews as NewsItemForm).content} className="text-xs text-gray-600" />
                    </div>
                    {(editingNews as NewsItemForm).date && <p className="text-xs text-gray-500">{new Date((editingNews as NewsItemForm).date).toLocaleDateString()}</p>}
                    <div className="mt-3 flex items-center gap-2"><Edit className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500">Click to edit</span></div>
                  </CardContent>
                </Card>
              )}
            <div />
          </TabsContent>
          {/* ── NEWS MODAL (accessible from Home tab Quick Actions) ──────────── */}
          <Dialog open={isNewsModalOpen} onOpenChange={setIsNewsModalOpen}>
            <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
              {/* Header */}
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      {editingNews?.id?.startsWith('temp-') ? 'Create News Item' : 'Edit News Item'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-0.5">
                      {editingNews?.id?.startsWith('temp-') 
                        ? 'Create a new news item for your announcements.' 
                        : 'Update the details for this news item and click Save to persist changes.'}
                    </DialogDescription>
                  </div>
                </div>
                {/* Shared Toolbar */}
                <div className="pt-3">
                  <SharedToolbar onCommand={handleNewsCommand} />
                </div>
              </DialogHeader>

              {/* Scrollable body */}
              <div
                className="flex-1 overflow-y-auto px-6 pb-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {editingNews && (
                  <div className="space-y-5 pt-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <Label htmlFor="news-title" className="text-sm font-semibold">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="news-title"
                        value={editingNews.title}
                        onChange={(e) => { 
                          const u = { ...editingNews, title: e.target.value }; 
                          setEditingNews(u); 
                          updateNewsItem((editingNews as NewsItemForm).id, 'title', e.target.value); 
                        }}
                        placeholder="Enter news title..."
                        className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label htmlFor="news-date" className="text-sm font-semibold">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="news-date"
                        type="date"
                        value={editingNews.date}
                        min="2000-01-01"
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => { 
                          const u = { ...editingNews, date: e.target.value }; 
                          setEditingNews(u); 
                          updateNewsItem((editingNews as NewsItemForm).id, 'date', e.target.value); 
                        }}
                        className="focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                      />
                    </div>

                    {/* Content (Abstract/Description) */}
                    <VisualRichEditor
                      id="news-content"
                      label="Abstract/Description"
                      value={editingNews.content}
                      onChange={(value: string) => { 
                        const u = { ...editingNews, content: value }; 
                        setEditingNews(u); 
                        updateNewsItem((editingNews as NewsItemForm).id, 'content', value); 
                      }}
                      rows={8}
                      placeholder="Enter news abstract or description"
                      required
                      showToolbar={false}
                      onCommand={(cmd) => {
                        if (cmd === 'focus') {
                          setNewsActiveField('news-content');
                        }
                      }}
                    />

                    {/* Cover Image */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Cover Image (Drag & Drop)</Label>
                      <p className="text-xs text-gray-500 mb-2">Upload a cover image for this news article</p>
                      <ImageDropzone
                        value={typeof (editingNews as NewsItemForm).imageUrl === 'string' ? ((editingNews as NewsItemForm).imageUrl as string) : ''}
                        onChange={(url) => {
                          const u = { ...editingNews, imageUrl: url };
                          setEditingNews(u);
                          if (typeof url === 'string') {
                            updateNewsItem((editingNews as NewsItemForm).id, 'imageUrl', url);
                          }
                        }}
                        label="Cover Image"
                      />
                    </div>

                    {/* Gallery Images */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Gallery Images (Drag & Drop)</Label>
                      <p className="text-xs text-gray-500 mb-2">Upload additional images for the gallery</p>
                      <MultiImageDropzone
                        images={(editingNews as NewsItemForm).images || []}
                        onChange={(images) => { 
                          const u = { ...editingNews, images }; 
                          setEditingNews(u); 
                          updateNewsItemImages((editingNews as NewsItemForm).id, images); 
                        }}
                        label="News Article Images"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
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
                        const exists = newsItems.find(item => item.id === editingNews.id);
                        if (!exists) {
                          const newsItemToAdd: NewsItem = {
                            ...(editingNews as NewsItemForm),
                            imageUrl: typeof (editingNews as NewsItemForm).imageUrl === 'string' ? ((editingNews as NewsItemForm).imageUrl as string) : undefined,
                            images: ((editingNews as NewsItemForm).images || []).filter((img) => typeof img === 'string') as string[],
                          };
                          setNewsItems([...newsItems, newsItemToAdd]);
                        }
                        await handleSaveNews(editingNews);
                        setIsNewsModalOpen(false);
                        setActiveTab('news');
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
            </DialogContent>
          </Dialog>

          {/* ── HIGHLIGHTS TAB ─────────────────────────────────────────────── */}
          <TabsContent value="highlights">
            <HighlightsManager highlights={highlights} onUpdate={updateHighlights} refreshContent={refreshContent} />
          </TabsContent>

          {/* ── TEAM TAB ───────────────────────────────────────────────────── */}
          <TabsContent value="team">
            <TeamManager teamMembers={teamMembers} onUpdate={updateTeamMembers} refreshContent={refreshContent} />
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
              <TabsContent value="internationally-funded"><ProjectManager projects={content.internationallyFundedProjects as Project[]} onUpdate={updateInternationallyFundedProjects} title="Internationally Funded Projects" category="internationally_funded" /></TabsContent>
              <TabsContent value="locally-funded"><ProjectManager projects={content.locallyFundedProjects as Project[]} onUpdate={updateLocallyFundedProjects} title="Locally Funded Projects" category="locally_funded" /></TabsContent>
              <TabsContent value="community"><ProjectManager projects={content.communityTransformationProjects as Project[]} onUpdate={updateCommunityTransformationProjects} title="Community Transformation" category="community_transformation" /></TabsContent>
              <TabsContent value="internship"><InternshipTestimonialManager testimonials={content.internshipTestimonials as InternshipTestimonial[]} onUpdate={updateInternshipTestimonials} /></TabsContent>
              <TabsContent value="financial"><FinancialStatementManager statements={content.financialStatements as FinancialStatement[]} onUpdate={updateFinancialStatements} /></TabsContent>
              <TabsContent value="findings"><ProjectManager projects={content.studyFindings as Project[]} onUpdate={updateStudyFindings} title="Findings from Our Latest Studies" category="study_findings" /></TabsContent>
            </Tabs>
          </TabsContent>

          {/* DUPLICATE PUBLICATIONS TAB - DO NOT EXECUTE */}
          <TabsContent value="publications-duplicate">
            <PublicationsManager publications={publications as Publication[]} onUpdate={updatePublications} />
          </TabsContent>

          {/* DUPLICATE PARTNERS TAB - DO NOT EXECUTE */}
          <TabsContent value="partners-duplicate">
            <PartnersManager partners={content.partners as Partner[]} onUpdate={updatePartners} />
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
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
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
            {/* Shared Toolbar */}
            <div className="pt-2">
              <SharedToolbar 
                onCommand={handleQuickBlogCommand} 
                onImageUpload={handleQuickBlogImageUpload}
              />
            </div>
          </DialogHeader>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto px-6 pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
              <VisualRichEditor
                id="quick-blog-content"
                label="Content"
                value={draft.content}
                onChange={(value: string) => setDraft({ ...draft, content: value })}
                rows={12}
                required
                placeholder="What's on your mind? Start writing here..."
                showToolbar={false}
                onCommand={(cmd) => {
                  if (cmd === 'focus') {
                    setQuickBlogActiveField('quick-blog-content');
                  }
                }}
                onImageUpload={handleQuickBlogImageUpload}
              />

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
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
            <Button variant="outline" className="flex-1 w-full" onClick={() => setIsQuickBlogOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
              onClick={publishQuickBlog}
              disabled={isSavingQuickBlog}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> {isSavingQuickBlog ? 'Publishing...' : 'Publish Blog Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── QUICK CREATE PUBLICATION MODAL ──────────────────────────────────── */}
      <Dialog open={isQuickPublicationOpen} onOpenChange={setIsQuickPublicationOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Create New Publication</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  Create a new publication entry. Your post will appear in the Pubs tab.
                </DialogDescription>
              </div>
            </div>
            {/* Shared Toolbar */}
            <div className="pt-3">
              <SharedToolbar onCommand={handleQuickPubCommand} />
            </div>
          </DialogHeader>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto px-6 pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                  placeholder="Enter publication title"
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
                  placeholder="e.g., John Doe, Jane Smith"
                  className="focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                />
              </div>

              {/* Content (Abstract/Description) */}
              <VisualRichEditor
                id="qp-content"
                label="Abstract/Description"
                value={publicationDraft.content || ''}
                onChange={(value: string) => setPublicationDraft(p => ({ ...p, content: value }))}
                rows={6}
                placeholder="Enter publication abstract or description"
                showToolbar={false}
                onCommand={(cmd) => {
                  if (cmd === 'focus') {
                    setQuickPubActiveField('qp-content');
                  }
                }}
              />

              {/* Link (External Link) */}
              <div className="space-y-1.5">
                <Label htmlFor="qp-link" className="text-sm font-semibold">
                  External Link
                </Label>
                <Input
                  id="qp-link"
                  value={publicationDraft.link}
                  onChange={(e) => setPublicationDraft(p => ({ ...p, link: e.target.value }))}
                  placeholder="https://..."
                  className="focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                />
              </div>

              {/* PDF File Upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  PDF File
                </Label>
                <PDFDropzone
                  value={publicationDraft.pdfUrl || ''}
                  onChange={(value) => setPublicationDraft(p => ({ ...p, pdfUrl: value }))}
                  label="Drop PDF file here or click to browse"
                />
              </div>

              {/* Published Date */}
              <div className="space-y-1.5">
                <Label htmlFor="qp-publishedDate" className="text-sm font-semibold">Published Date</Label>
                <Input 
                  id="qp-publishedDate" 
                  type="date" 
                  value={publicationDraft.publishedDate} 
                  min="2000-01-01" 
                  max={new Date().toISOString().split('T')[0]} 
                  onChange={(e) => setPublicationDraft(p => ({ ...p, publishedDate: e.target.value }))}
                  className="focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
            <Button variant="outline" className="flex-1 w-full" onClick={() => setIsQuickPublicationOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
              onClick={publishQuickPublication}
              disabled={isSavingQuickPublication}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> {isSavingQuickPublication ? 'Publishing...' : 'Publish Publication'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

          {/* ── HIGHLIGHT MODAL (accessible from Home tab Quick Actions) ──────────── */}
          <Dialog open={isHighlightModalOpen} onOpenChange={setIsHighlightModalOpen}>
            <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
              {/* Header */}
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      {editingHighlight?.id?.startsWith('temp-') ? 'Create Highlight' : 'Edit Highlight'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-0.5">
                      {editingHighlight?.id?.startsWith('temp-')
                        ? 'Create a new highlight to feature your work on the Home page.'
                        : 'Update the details for this highlight and click Save to persist changes.'}
                    </DialogDescription>
                  </div>
                </div>
                {/* Shared Toolbar */}
                <div className="pt-3">
                  <SharedToolbar onCommand={handleHighlightCommand} />
                </div>
              </DialogHeader>

              {/* Scrollable body */}
              <div
                className="flex-1 overflow-y-auto px-6 pb-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {editingHighlight && (
                  <div className="space-y-5 pt-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <Label htmlFor="highlight-title" className="text-sm font-semibold">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="highlight-title"
                        value={editingHighlight.title}
                        onChange={(e) => { 
                          const u = { ...editingHighlight, title: e.target.value }; 
                          setEditingHighlight(u); 
                          updateHighlight(editingHighlight.id, 'title', e.target.value); 
                        }}
                        placeholder="Enter highlight title..."
                        className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                      />
                    </div>

                    {/* Description */}
                    <VisualRichEditor
                      id="highlight-description"
                      label="Description *"
                      value={editingHighlight.description}
                      onChange={(value: string) => { 
                        const u = { ...editingHighlight, description: value }; 
                        setEditingHighlight(u); 
                        updateHighlight(editingHighlight.id, 'description', value); 
                      }}
                      rows={4}
                      placeholder="Enter a brief description..."
                      required
                      showToolbar={false}
                      onCommand={(cmd) => {
                        if (cmd === 'focus') {
                          setHighlightActiveField('highlight-description');
                        }
                      }}
                    />

                    {/* Icon */}
                    <div className="space-y-1.5">
                      <Label htmlFor="highlight-icon" className="text-sm font-semibold">Icon</Label>
                      <Select
                        value={editingHighlight.iconName}
                        onValueChange={(v) => { 
                          const u = { ...editingHighlight, iconName: v }; 
                          setEditingHighlight(u); 
                          updateHighlight(editingHighlight.id, 'iconName', v); 
                        }}
                      >
                        <SelectTrigger id="highlight-icon" className="focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Satellite">Satellite</SelectItem>
                          <SelectItem value="Sprout">Sprout</SelectItem>
                          <SelectItem value="BarChart3">BarChart3</SelectItem>
                          <SelectItem value="Globe">Globe</SelectItem>
                          <SelectItem value="Star">Star</SelectItem>
                          <SelectItem value="Award">Award</SelectItem>
                          <SelectItem value="TrendingUp">TrendingUp</SelectItem>
                          <SelectItem value="CheckCircle">CheckCircle</SelectItem>
                          <SelectItem value="Info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Detailed Content */}
                    <VisualRichEditor
                      id="highlight-content"
                      label="Detailed Content"
                      value={editingHighlight.content || ''}
                      onChange={(value: string) => { 
                        const u = { ...editingHighlight, content: value }; 
                        setEditingHighlight(u); 
                        updateHighlight(editingHighlight.id, 'content', value); 
                      }}
                      rows={6}
                      placeholder="Write detailed content here..."
                      showToolbar={false}
                      onCommand={(cmd) => {
                        if (cmd === 'focus') {
                          setHighlightActiveField('highlight-content');
                        }
                      }}
                    />

                    {/* Published Date */}
                    <div className="space-y-1.5">
                      <Label htmlFor="highlight-date" className="text-sm font-semibold">Published Date</Label>
                      <Input
                        id="highlight-date"
                        type="date"
                        value={editingHighlight.publishedDate || ''}
                        min="2000-01-01"
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => { 
                          const u = { ...editingHighlight, publishedDate: e.target.value }; 
                          setEditingHighlight(u); 
                          updateHighlight(editingHighlight.id, 'publishedDate', e.target.value); 
                        }}
                        className="focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                      />
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Cover Image (Drag & Drop)</Label>
                      <p className="text-xs text-gray-500 mb-2">Upload a cover image for this highlight</p>
                      <ImageDropzone
                        value={typeof (editingHighlight as HighlightForm).imageUrl === 'string' ? ((editingHighlight as HighlightForm).imageUrl as string) : ''}
                        onChange={(url) => {
                          const u = { ...editingHighlight, imageUrl: url };
                          setEditingHighlight(u);
                          if (typeof url === 'string') {
                            updateHighlight((editingHighlight as HighlightForm).id, 'imageUrl', url);
                          }
                        }}
                        label="Cover Image"
                      />
                    </div>

                    {/* Gallery Images */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Gallery Images (Drag & Drop)</Label>
                      <p className="text-xs text-gray-500 mb-2">Upload additional images for the gallery</p>
                      <MultiImageDropzone
                        images={(editingHighlight as HighlightForm).images || []}
                        onChange={(images) => { 
                          const u = { ...editingHighlight, images }; 
                          setEditingHighlight(u); 
                          updateHighlightImages((editingHighlight as HighlightForm).id, images); 
                        }}
                        label="Highlight Images"
                      />
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="featured-highlight-checkbox"
                        checked={editingHighlight.featured || false}
                        onChange={(e) => {
                          const featuredCount = highlights.filter(h => h.featured && h.id !== editingHighlight.id).length;
                          if (e.target.checked && featuredCount >= 4) {
                            alert('You can only have 4 featured highlights. Please unfeature another highlight first.');
                            return;
                          }
                          const u = { ...editingHighlight, featured: e.target.checked };
                          setEditingHighlight(u);
                          updateHighlight(editingHighlight.id, 'featured', e.target.checked);
                        }}
                        className="w-5 h-5 text-[#1887FC] border-gray-300 rounded focus:ring-[#1887FC]"
                      />
                      <div className="flex-1">
                        <Label htmlFor="featured-highlight-checkbox" className="text-sm font-semibold text-blue-900 cursor-pointer flex items-center gap-2">
                          <Star className="w-4 h-4 text-blue-600" />
                          Featured Highlight
                        </Label>
                        <p className="text-xs text-blue-700 mt-1">Display this highlight on the home page (max 4)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
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
                        const exists = highlights.find(item => item.id === editingHighlight.id);
                        if (!exists) {
                          const highlightToAdd: Highlight = {
                            ...(editingHighlight as HighlightForm),
                            imageUrl: typeof (editingHighlight as HighlightForm).imageUrl === 'string' ? ((editingHighlight as HighlightForm).imageUrl as string) : '',
                            images: ((editingHighlight as HighlightForm).images || []).filter((img) => typeof img === 'string') as string[],
                          };
                          setHighlights([...highlights, highlightToAdd]);
                        }
                        await handleSaveHighlights(editingHighlight);
                        setIsHighlightModalOpen(false);
                        setActiveTab('highlights');
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
            </DialogContent>
          </Dialog>

      {/* ── TEAM MEMBER MODAL (accessible from Home tab Quick Actions) ──────────── */}
      <Dialog open={isTeamMemberModalOpen} onOpenChange={setIsTeamMemberModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {editingTeamMember?.id?.startsWith('temp-') ? 'Create Team Member' : 'Edit Team Member'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  {editingTeamMember?.id?.startsWith('temp-')
                    ? 'Add a new team member to showcase on your website.'
                    : 'Update the details for this team member and click Save to persist changes.'}
                </DialogDescription>
              </div>
            </div>
            {/* Shared Toolbar */}
            <div className="pt-3">
              <SharedToolbar onCommand={handleTeamCommand} />
            </div>
          </DialogHeader>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto px-6 pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {editingTeamMember && (
              <div className="space-y-5 pt-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="team-name" className="text-sm font-semibold">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="team-name"
                    value={editingTeamMember.name}
                    onChange={(e) => { 
                      const u = { ...editingTeamMember, name: e.target.value }; 
                      setEditingTeamMember(u); 
                      updateTeamMember(editingTeamMember.id, 'name', e.target.value); 
                    }}
                    placeholder="Enter member name..."
                    className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label htmlFor="team-role" className="text-sm font-semibold">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="team-role"
                    value={editingTeamMember.role}
                    onChange={(e) => { 
                      const u = { ...editingTeamMember, role: e.target.value }; 
                      setEditingTeamMember(u); 
                      updateTeamMember(editingTeamMember.id, 'role', e.target.value); 
                    }}
                    placeholder="Enter member role..."
                    className="focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                  />
                </div>

                {/* Description */}
                <VisualRichEditor
                  id="team-description"
                  label="Description"
                  value={editingTeamMember.description}
                  onChange={(value: string) => { 
                    const u = { ...editingTeamMember, description: value }; 
                    setEditingTeamMember(u); 
                    updateTeamMember(editingTeamMember.id, 'description', value); 
                  }}
                  rows={6}
                  placeholder="Enter member description..."
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setTeamActiveField('team-description');
                    }
                  }}
                />

                {/* Member Photo */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Member Photo</Label>
                  <p className="text-xs text-gray-500 mb-2">Upload a photo for this team member</p>
                  <ImageDropzone
                    value={typeof (editingTeamMember as TeamMemberForm).imageUrl === 'string' ? (((editingTeamMember as TeamMemberForm).imageUrl as string) || '') : ''}
                    onChange={(url) => { 
                      const u = { ...editingTeamMember, imageUrl: url }; 
                      setEditingTeamMember(u); 
                      if (typeof url === 'string') { 
                        updateTeamMember((editingTeamMember as TeamMemberForm).id, 'imageUrl', url); 
                      } 
                    }}
                    label="Member Photo"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
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
                    const exists = teamMembers.find(item => item.id === editingTeamMember.id);
                    if (!exists) {
                      const memberToAdd: TeamMember = {
                        ...(editingTeamMember as TeamMemberForm),
                        imageUrl: typeof (editingTeamMember as TeamMemberForm).imageUrl === 'string' ? ((editingTeamMember as TeamMemberForm).imageUrl as string) : undefined,
                      };
                      setTeamMembers([...teamMembers, memberToAdd]);
                    }
                    await handleSaveTeamMembers(editingTeamMember);
                    setIsTeamMemberModalOpen(false);
                    setActiveTab('team');
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
        </DialogContent>
      </Dialog>

      {/* ── PARTNER MODAL (accessible from Home tab Quick Actions) ──────────── */}
      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {editingPartner?.id?.startsWith('temp-') ? 'Create Partner' : 'Edit Partner'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  {editingPartner?.id?.startsWith('temp-')
                    ? 'Add a new partner to showcase your collaborations.'
                    : 'Update the details for this partner and click Save to persist changes.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto px-6 pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {editingPartner && (
              <div className="space-y-5 pt-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="partner-name" className="text-sm font-semibold">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="partner-name"
                    value={editingPartner.name}
                    onChange={(e) => { 
                      const u = { ...editingPartner, name: e.target.value }; 
                      setEditingPartner(u); 
                      updatePartner(editingPartner.id, 'name', e.target.value); 
                    }}
                    placeholder="Enter partner name..."
                    className="text-base font-medium focus:ring-2 focus:ring-[#1887FC] focus:border-[#1887FC]"
                  />
                </div>

                {/* Partner Logo */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Partner Logo</Label>
                  <p className="text-xs text-gray-500 mb-2">Upload a logo for this partner</p>
                  <ImageDropzone
                    value={typeof editingPartner.logoUrl === 'string' ? editingPartner.logoUrl : ''}
                    onChange={(url) => { 
                      const u = { ...editingPartner, logoUrl: url }; 
                      setEditingPartner(u); 
                      if (typeof url === 'string') { 
                        updatePartner(editingPartner.id, 'logoUrl', url); 
                      } 
                    }}
                    label="Partner Logo"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
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
                    const exists = partners.find(item => item.id === editingPartner.id);
                    if (!exists) {
                      const partnerToAdd: Partner = {
                        ...(editingPartner as PartnerForm),
                        logoUrl: typeof (editingPartner as PartnerForm).logoUrl === 'string' ? ((editingPartner as PartnerForm).logoUrl as string) : '',
                      };
                      setPartners([...partners, partnerToAdd]);
                    }
                    await handleSavePartners(editingPartner);
                    setIsPartnerModalOpen(false);
                    setActiveTab('partners');
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
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog />
    </div>
  );
};