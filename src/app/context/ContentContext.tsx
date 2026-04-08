import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
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
} from "@/services/optimizedSupabaseService";
import { getImageUrl } from "@/utils/r2Upload";

// Import ResearchBayanihan image (keeping this as a static asset)
const researchBayanihanImg = '/images/backgrounds/research-bayanihan.png'; // Updated to use local image

// Extended interfaces that support File objects for form handling
export interface NewsItemForm extends Omit<NewsItem, 'imageUrl' | 'images'> {
  imageUrl?: string | File;
  images?: (string | File)[];
}

export interface HighlightForm extends Omit<Highlight, 'imageUrl' | 'images'> {
  imageUrl?: string | File;
  images?: (string | File)[];
}

export interface TeamMemberForm extends Omit<TeamMember, 'imageUrl'> {
  imageUrl?: string | File;
}

export interface PartnerForm extends Omit<Partner, 'logoUrl'> {
  logoUrl?: string | File;
}

export interface ProjectForm extends Omit<Project, 'imageUrl' | 'images'> {
  imageUrl?: string | File;
  images?: (string | File)[];
}

export interface BlogPostForm extends Omit<BlogPost, 'imageUrl' | 'images'> {
  imageUrl?: string | File;
  images?: (string | File)[];
}

export interface PublicationForm extends Omit<Publication, 'imageUrl' | 'galleryImages' | 'pdfUrl'> {
  imageUrl?: string | File;
  galleryImages?: (string | File)[];
  pdfUrl?: string | File;
}

export interface FinancialStatementForm extends Omit<FinancialStatement, 'pdfUrl'> {
  pdfUrl?: string | File;
}

export interface InternshipTestimonialForm extends Omit<InternshipTestimonial, 'imageUrl' | 'images'> {
  imageUrl?: string | File;
  images?: (string | File)[];
}

// Original database interfaces (unchanged)
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  images?: string[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  link: string;
  featured?: boolean;
  pdfUrl?: string;
  imageUrl?: string;
  content?: string;
  publishedDate?: string;
  excerpt?: string;
  sentence?: string;
  optionalLinks?: string;
  contactInfo?: string;
  reference?: string;
  pdfAccessType?: 'view' | 'download';
  galleryImages?: string[];
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Highlight {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  images?: string[];
  iconName: string;
  content?: string;
  publishedDate?: string;
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  date?: string;
  context?: string;
  objectives?: string;
  methodology?: string;
  category?: string;
}

export interface FinancialStatement {
  id: string;
  title: string;
  year: string;
  pdfUrl: string;
  description?: string;
  pdfAccessType?: 'view' | 'download';
}

export interface InternshipTestimonial {
  id: string;
  name: string;
  degree: string;
  institution: string;
  quote: string;
  fullText: string;
  publishedDate: string;
  year: string;
  images?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  imageUrl?: string;
  images?: string[];
  likes: number;
}

interface ContentData {
  newsItems: NewsItem[];
  publications: Publication[];
  partners: Partner[];
  highlights: Highlight[];
  teamMembers: TeamMember[];
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  aboutVision: string;
  aboutMission: string;
  aboutDescription: string;
  heroBackgroundUrl: string;
  researchBayanihanImage: string;
  internationallyFundedProjects: Project[];
  locallyFundedProjects: Project[];
  communityTransformationProjects: Project[];
  internshipPrograms: Project[];
  financialStatements: FinancialStatement[];
  studyFindings: Project[];
  internshipTestimonials: InternshipTestimonial[];
  blogPosts: BlogPost[];
}

interface ContentContextType {
  content: ContentData;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  updateNews: (news: NewsItem[]) => void;
  updatePublications: (publications: Publication[]) => void;
  updatePartners: (partners: Partner[]) => void;
  updateHighlights: (highlights: Highlight[]) => void;
  updateTeamMembers: (teamMembers: TeamMember[]) => void;
  updateHero: (title: string, subtitle: string) => void;
  updateAbout: (text: string) => void;
  updateHeroBackground: (url: string) => void;
  updateInternationallyFundedProjects: (projects: Project[]) => void;
  updateLocallyFundedProjects: (projects: Project[]) => void;
  updateCommunityTransformationProjects: (projects: Project[]) => void;
  updateInternshipPrograms: (programs: Project[]) => void;
  updateFinancialStatements: (statements: FinancialStatement[]) => void;
  updateStudyFindings: (findings: Project[]) => void;
  updateInternshipTestimonials: (testimonials: InternshipTestimonial[]) => void;
  updateBlogPosts: (posts: BlogPost[]) => void;
  // New lazy fetch functions
  fetchNews: () => Promise<void>;
  fetchHighlights: () => Promise<void>;
  fetchPartners: () => Promise<void>;
  fetchPublications: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  fetchBlogPosts: () => Promise<void>;
  fetchHeroSection: () => Promise<void>;
  fetchAboutSection: () => Promise<void>;
  fetchInternationallyFundedProjects: () => Promise<void>;
  fetchLocallyFundedProjects: () => Promise<void>;
  fetchCommunityTransformationProjects: () => Promise<void>;
  fetchInternshipPrograms: () => Promise<void>;
  fetchStudyFindings: () => Promise<void>;
  fetchFinancialStatements: () => Promise<void>;
  fetchInternshipTestimonials: () => Promise<void>;
  // Loading states for each data type
  loadingStates: {
    news: boolean;
    highlights: boolean;
    partners: boolean;
    publications: boolean;
    teamMembers: boolean;
    blogPosts: boolean;
    hero: boolean;
    about: boolean;
    internationallyFunded: boolean;
    locallyFunded: boolean;
    communityTransformation: boolean;
    internshipPrograms: boolean;
    studyFindings: boolean;
    financialStatements: boolean;
    internshipTestimonials: boolean;
  };
}

const initialContent: ContentData = {
  newsItems: [],
  publications: [],
  partners: [],
  highlights: [],
  teamMembers: [],
  heroTitle: "",
  heroSubtitle: "",
  aboutText: "",
  aboutVision: "",
  aboutMission: "",
  aboutDescription: "",
  heroBackgroundUrl: "",
  researchBayanihanImage: researchBayanihanImg,
  internationallyFundedProjects: [],
  locallyFundedProjects: [],
  communityTransformationProjects: [],
  internshipPrograms: [],
  financialStatements: [],
  studyFindings: [],
  internshipTestimonials: [],
  blogPosts: [],
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentData>(initialContent);
  const [loading, setLoading] = useState(false); // Changed to false - no automatic loading on mount
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    news: false,
    highlights: false,
    partners: false,
    publications: false,
    teamMembers: false,
    blogPosts: false,
    hero: false,
    about: false,
    internationallyFunded: false,
    locallyFunded: false,
    communityTransformation: false,
    internshipPrograms: false,
    studyFindings: false,
    financialStatements: false,
    internshipTestimonials: false,
  });

  // Function to map database format to app format
  const mapDbToApp = (data: any): any => {
    if (!data) return null;

    const mapping: any = {
      // Map snake_case to camelCase
      image_url: 'imageUrl',
      pdf_url: 'pdfUrl',
      published_date: 'publishedDate',
      optional_links: 'optionalLinks',
      contact_info: 'contactInfo',
      icon_name: 'iconName',
      logo_url: 'logoUrl',
      author_role: 'authorRole',
      full_text: 'fullText',
      pdf_access_type: 'pdfAccessType',
    };

    const mapped: any = { ...data };
    Object.keys(mapping).forEach(dbKey => {
      if (mapped[dbKey] !== undefined) {
        mapped[mapping[dbKey]] = mapped[dbKey];
        delete mapped[dbKey];
      }
    });

    if (typeof mapped.imageUrl === 'string') {
      mapped.imageUrl = getImageUrl(mapped.imageUrl);
    }
    if (typeof mapped.logoUrl === 'string') {
      mapped.logoUrl = getImageUrl(mapped.logoUrl);
    }
    if (typeof mapped.pdfUrl === 'string') {
      mapped.pdfUrl = getImageUrl(mapped.pdfUrl);
    }
    if (Array.isArray(mapped.images)) {
      mapped.images = mapped.images.map((u: any) => (typeof u === 'string' ? getImageUrl(u) : u));
    }
    if (Array.isArray(mapped.galleryImages)) {
      mapped.galleryImages = mapped.galleryImages.map((u: any) => (typeof u === 'string' ? getImageUrl(u) : u));
    }

    return mapped;
  };

  // Fetch all content from Supabase
  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        heroData,
        newsData,
        highlightsData,
        partnersData,
        publicationsData,
        teamData,
        blogData,
        internationalProjects,
        localProjects,
        communityProjects,
        internshipProjects,
        studyFindingsData,
        financialStatementsData,
        internshipTestimonialsData,
        aboutData,
      ] = await Promise.all([
        getHeroSection(),
        getAllNews(),
        getAllHighlights(),
        getAllPartners(),
        getAllPublications(),
        getAllTeamMembers(),
        getAllBlogPosts(),
        getProjectsByCategory('internationally_funded'),
        getProjectsByCategory('locally_funded'),
        getProjectsByCategory('community_transformation'),
        getProjectsByCategory('internship_program'),
        getProjectsByCategory('study_findings'),
        getAllFinancialStatements(),
        getAllInternshipTestimonials(),
        getAboutSection(),
      ]);

      // Check if we got null responses (which indicates table not found)
      // At least one of the core tables should have data or exist
      const hasAnyData = newsData || highlightsData || partnersData || publicationsData || teamData || blogData;
      
      if (!hasAnyData && (
        newsData === null && highlightsData === null && 
        partnersData === null && publicationsData === null && 
        teamData === null && blogData === null
      )) {
        // All core queries returned null - likely tables don't exist
        // Set error state instead of throwing to prevent breaking the app
        setError('Database tables not found. Please run /database_schema.sql in Supabase SQL Editor.');
        setLoading(false);
        setContent(initialContent);
        return; // Exit early
      }

      // Map database format to application format
      const mappedNews = (newsData || []).map((item: any) => mapDbToApp(item));
      const mappedHighlights = (highlightsData || []).map((item: any) => mapDbToApp(item));
      const mappedPartners = (partnersData || []).map((item: any) => mapDbToApp(item));
      const mappedPublications = (publicationsData || []).map((item: any) => mapDbToApp(item));
      const mappedTeam = (teamData || []).map((item: any) => mapDbToApp(item));
      const mappedBlogs = (blogData || []).map((item: any) => mapDbToApp(item));
      const mappedInternational = (internationalProjects || []).map((item: any) => mapDbToApp(item));
      const mappedLocal = (localProjects || []).map((item: any) => mapDbToApp(item));
      const mappedCommunity = (communityProjects || []).map((item: any) => mapDbToApp(item));
      const mappedInternship = (internshipProjects || []).map((item: any) => mapDbToApp(item));
      const mappedFindings = (studyFindingsData || []).map((item: any) => mapDbToApp(item));
      const mappedFinancialStatements = (financialStatementsData || []).map((item: any) => mapDbToApp(item));
      const mappedInternshipTestimonials = (internshipTestimonialsData || []).map((item: any) => mapDbToApp(item));

      const newContent = {
        newsItems: mappedNews,
        highlights: mappedHighlights,
        partners: mappedPartners,
        publications: mappedPublications,
        teamMembers: mappedTeam,
        blogPosts: mappedBlogs,
        internationallyFundedProjects: mappedInternational,
        locallyFundedProjects: mappedLocal,
        communityTransformationProjects: mappedCommunity,
        internshipPrograms: mappedInternship,
        studyFindings: mappedFindings,
        heroTitle: (heroData as any)?.title || initialContent.heroTitle,
        heroSubtitle: (heroData as any)?.subtitle || initialContent.heroSubtitle,
        heroBackgroundUrl: (heroData as any)?.background_url || "",
        aboutText: (aboutData as any)?.description || "",
        aboutVision: (aboutData as any)?.vision || "",
        aboutMission: (aboutData as any)?.mission || "",
        aboutDescription: (aboutData as any)?.description || "",
        researchBayanihanImage: researchBayanihanImg,
        financialStatements: mappedFinancialStatements,
        internshipTestimonials: mappedInternshipTestimonials,
      };
      
      setContent(newContent);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching content:", err);
      
      // Check error type and set appropriate message
      const errorMessage = (err as any)?.message || '';
      
      // Check for connection/network errors
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('fetch') || 
          errorMessage.includes('network') ||
          errorMessage.includes('NetworkError')) {
        setError("Supabase connection error. Please check your internet connection and Supabase project status.");
      }
      // Check for table not found errors
      else if (errorMessage.includes('table') || 
               errorMessage.includes('PGRST205') || 
               errorMessage.includes('Database tables')) {
        setError("Database tables not found. Please run /database_schema.sql in Supabase SQL Editor.");
      }
      // Generic error
      else {
        setError("Failed to load content. Please check your Supabase configuration.");
      }
      
      setLoading(false);
      
      // Set to initial empty content on error
      setContent(initialContent);
    }
  };

  // Removed automatic fetch on mount - pages will fetch their own data
  // useEffect(() => {
  //   fetchContent();
  // }, []);

  // Refresh content function
  const refreshContent = async () => {
    await fetchContent();
  };

  // Update functions (these will trigger local state updates and can be synced with Supabase)
  const updateNews = (news: NewsItem[]) => {
    setContent((prev) => ({ ...prev, newsItems: news }));
  };

  const updatePublications = (publications: Publication[]) => {
    setContent((prev) => ({ ...prev, publications }));
  };

  const updatePartners = (partners: Partner[]) => {
    setContent((prev) => ({ ...prev, partners }));
  };

  const updateHighlights = (highlights: Highlight[]) => {
    setContent((prev) => ({ ...prev, highlights }));
  };

  const updateTeamMembers = (teamMembers: TeamMember[]) => {
    setContent((prev) => ({ ...prev, teamMembers }));
  };

  const updateHero = (title: string, subtitle: string) => {
    setContent((prev) => ({ ...prev, heroTitle: title, heroSubtitle: subtitle }));
  };

  const updateAbout = (text: string) => {
    setContent((prev) => ({ ...prev, aboutText: text }));
  };

  const updateHeroBackground = (url: string) => {
    setContent((prev) => ({ ...prev, heroBackgroundUrl: url }));
  };

  const updateInternationallyFundedProjects = (projects: Project[]) => {
    setContent((prev) => ({ ...prev, internationallyFundedProjects: projects }));
  };

  const updateLocallyFundedProjects = (projects: Project[]) => {
    setContent((prev) => ({ ...prev, locallyFundedProjects: projects }));
  };

  const updateCommunityTransformationProjects = (projects: Project[]) => {
    setContent((prev) => ({ ...prev, communityTransformationProjects: projects }));
  };

  const updateInternshipPrograms = (programs: Project[]) => {
    setContent((prev) => ({ ...prev, internshipPrograms: programs }));
  };

  const updateFinancialStatements = (statements: FinancialStatement[]) => {
    setContent((prev) => ({ ...prev, financialStatements: statements }));
  };

  const updateStudyFindings = (findings: Project[]) => {
    setContent((prev) => ({ ...prev, studyFindings: findings }));
  };

  const updateInternshipTestimonials = (testimonials: InternshipTestimonial[]) => {
    setContent((prev) => ({ ...prev, internshipTestimonials: testimonials }));
  };

  const updateBlogPosts = (posts: BlogPost[]) => {
    setContent((prev) => ({ ...prev, blogPosts: posts }));
  };

  // Lazy fetch functions
  const fetchNews = async () => {
    setLoadingStates(prev => ({ ...prev, news: true }));
    try {
      const newsData = await getAllNews();
      const mappedNews = (newsData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, newsItems: mappedNews }));
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, news: false }));
    }
  };

  const fetchHighlights = async () => {
    setLoadingStates(prev => ({ ...prev, highlights: true }));
    try {
      const highlightsData = await getAllHighlights();
      const mappedHighlights = (highlightsData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, highlights: mappedHighlights }));
    } catch (err) {
      console.error("Error fetching highlights:", err);
      setError("Failed to load highlights. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, highlights: false }));
    }
  };

  const fetchPartners = async () => {
    setLoadingStates(prev => ({ ...prev, partners: true }));
    try {
      const partnersData = await getAllPartners();
      const mappedPartners = (partnersData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, partners: mappedPartners }));
    } catch (err) {
      console.error("Error fetching partners:", err);
      setError("Failed to load partners. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, partners: false }));
    }
  };

  const fetchPublications = async () => {
    setLoadingStates(prev => ({ ...prev, publications: true }));
    try {
      const publicationsData = await getAllPublications();
      const mappedPublications = (publicationsData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, publications: mappedPublications }));
    } catch (err) {
      console.error("Error fetching publications:", err);
      setError("Failed to load publications. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, publications: false }));
    }
  };

  const fetchTeamMembers = async () => {
    setLoadingStates(prev => ({ ...prev, teamMembers: true }));
    try {
      const teamData = await getAllTeamMembers();
      const mappedTeam = (teamData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, teamMembers: mappedTeam }));
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError("Failed to load team members. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, teamMembers: false }));
    }
  };

  const fetchBlogPosts = async () => {
    setLoadingStates(prev => ({ ...prev, blogPosts: true }));
    try {
      const blogData = await getAllBlogPosts();
      const mappedBlogs = (blogData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, blogPosts: mappedBlogs }));
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError("Failed to load blog posts. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, blogPosts: false }));
    }
  };

  const fetchHeroSection = async () => {
    setLoadingStates(prev => ({ ...prev, hero: true }));
    try {
      const heroData = await getHeroSection();
      setContent(prev => ({
        ...prev,
        heroTitle: (heroData as any)?.title || initialContent.heroTitle,
        heroSubtitle: (heroData as any)?.subtitle || initialContent.heroSubtitle,
        heroBackgroundUrl: (heroData as any)?.background_url || "",
      }));
    } catch (err) {
      console.error("Error fetching hero section:", err);
      setError("Failed to load hero section. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, hero: false }));
    }
  };

  const fetchAboutSection = async () => {
    setLoadingStates(prev => ({ ...prev, about: true }));
    try {
      const aboutData = await getAboutSection();
      setContent(prev => ({
        ...prev,
        aboutText: (aboutData as any)?.description || "",
        aboutVision: (aboutData as any)?.vision || "",
        aboutMission: (aboutData as any)?.mission || "",
        aboutDescription: (aboutData as any)?.description || "",
      }));
    } catch (err) {
      console.error("Error fetching about section:", err);
      setError("Failed to load about section. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, about: false }));
    }
  };

  const fetchInternationallyFundedProjects = async () => {
    setLoadingStates(prev => ({ ...prev, internationallyFunded: true }));
    try {
      const internationalProjects = await getProjectsByCategory('internationally_funded');
      const mappedInternational = (internationalProjects || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, internationallyFundedProjects: mappedInternational }));
    } catch (err) {
      console.error("Error fetching internationally funded projects:", err);
      setError("Failed to load internationally funded projects. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, internationallyFunded: false }));
    }
  };

  const fetchLocallyFundedProjects = async () => {
    setLoadingStates(prev => ({ ...prev, locallyFunded: true }));
    try {
      const localProjects = await getProjectsByCategory('locally_funded');
      const mappedLocal = (localProjects || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, locallyFundedProjects: mappedLocal }));
    } catch (err) {
      console.error("Error fetching locally funded projects:", err);
      setError("Failed to load locally funded projects. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, locallyFunded: false }));
    }
  };

  const fetchCommunityTransformationProjects = async () => {
    setLoadingStates(prev => ({ ...prev, communityTransformation: true }));
    try {
      const communityProjects = await getProjectsByCategory('community_transformation');
      const mappedCommunity = (communityProjects || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, communityTransformationProjects: mappedCommunity }));
    } catch (err) {
      console.error("Error fetching community transformation projects:", err);
      setError("Failed to load community transformation projects. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, communityTransformation: false }));
    }
  };

  const fetchInternshipPrograms = async () => {
    setLoadingStates(prev => ({ ...prev, internshipPrograms: true }));
    try {
      const internshipProjects = await getProjectsByCategory('internship_program');
      const mappedInternship = (internshipProjects || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, internshipPrograms: mappedInternship }));
    } catch (err) {
      console.error("Error fetching internship programs:", err);
      setError("Failed to load internship programs. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, internshipPrograms: false }));
    }
  };

  const fetchStudyFindings = async () => {
    setLoadingStates(prev => ({ ...prev, studyFindings: true }));
    try {
      const studyFindingsData = await getProjectsByCategory('study_findings');
      const mappedFindings = (studyFindingsData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, studyFindings: mappedFindings }));
    } catch (err) {
      console.error("Error fetching study findings:", err);
      setError("Failed to load study findings. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, studyFindings: false }));
    }
  };

  const fetchFinancialStatements = async () => {
    setLoadingStates(prev => ({ ...prev, financialStatements: true }));
    try {
      const financialStatementsData = await getAllFinancialStatements();
      const mappedFinancialStatements = (financialStatementsData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, financialStatements: mappedFinancialStatements }));
    } catch (err) {
      console.error("Error fetching financial statements:", err);
      setError("Failed to load financial statements. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, financialStatements: false }));
    }
  };

  const fetchInternshipTestimonials = async () => {
    setLoadingStates(prev => ({ ...prev, internshipTestimonials: true }));
    try {
      const internshipTestimonialsData = await getAllInternshipTestimonials();
      const mappedInternshipTestimonials = (internshipTestimonialsData || []).map((item: any) => mapDbToApp(item));
      setContent(prev => ({ ...prev, internshipTestimonials: mappedInternshipTestimonials }));
    } catch (err) {
      console.error("Error fetching internship testimonials:", err);
      setError("Failed to load internship testimonials. Please check your Supabase configuration.");
    } finally {
      setLoadingStates(prev => ({ ...prev, internshipTestimonials: false }));
    }
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        loading,
        error,
        refreshContent,
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
        // New lazy fetch functions
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
        // Loading states for each data type
        loadingStates,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};