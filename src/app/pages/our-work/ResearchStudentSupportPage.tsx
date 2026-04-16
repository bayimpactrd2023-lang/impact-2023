import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Quote, Calendar, GraduationCap, ChevronDown, ChevronUp, Image as ImageIcon, ChevronLeft, ChevronRight, X, BookOpen, Target, FileText, Eye, ArrowRight } from 'lucide-react';
import { useContent, InternshipTestimonial, FinancialStatement, Project } from '@/app/context/ContentContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogPortal } from '@/app/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import useEmblaCarousel from 'embla-carousel-react';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Pagination } from '@/app/components/Pagination';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { RichTextContent } from '@/app/components/RichTextContent';
import { GalleryModal } from '@/app/components/GalleryModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { FinancialStatementModal } from '@/app/components/FinancialStatementModal';
import { PDFViewerModal } from '@/app/components/PDFViewerModal';

const ITEMS_PER_PAGE = 3;
const FINANCIAL_ITEMS_PER_PAGE = 4;

export const ResearchStudentSupportPage: React.FC = () => {
  const { content, loadingStates, fetchInternshipTestimonials, fetchFinancialStatements, fetchStudentSupportProjects } = useContent();
  const [pageLoading, setPageLoading] = useState(true);

  // State for pagination per year: { [year]: currentPage }
  const [yearPages, setYearPages] = useState<{ [key: string]: number }>({});

  // State for expanded years
  const [expandedYears, setExpandedYears] = useState<{ [key: string]: boolean }>({});

  // Image carousel modal
  const [selectedTestimonial, setSelectedTestimonial] = useState<InternshipTestimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [showOnlyOneImage, setShowOnlyOneImage] = useState(false);

  // Financial Statements pagination and modal state
  const [financialPage, setFinancialPage] = useState(1);
  const [selectedStatement, setSelectedStatement] = useState<FinancialStatement | null>(null);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState<{ url: string; title: string; year: string } | null>(null);

  // Thesis Project modal state
  const [selectedThesisProject, setSelectedThesisProject] = useState<Project | null>(null);
  const [isThesisModalOpen, setIsThesisModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handleThesisProjectClick = (project: Project) => {
    setSelectedThesisProject(project);
    setIsThesisModalOpen(true);
  };

  const closeThesisModal = () => {
    setSelectedThesisProject(null);
    setIsThesisModalOpen(false);
  };

  const totalFinancialPages = Math.ceil(content.financialStatements.length / FINANCIAL_ITEMS_PER_PAGE);
  const currentFinancialStatements = useMemo(() => {
    const start = (financialPage - 1) * FINANCIAL_ITEMS_PER_PAGE;
    return content.financialStatements.slice(start, start + FINANCIAL_ITEMS_PER_PAGE);
  }, [content.financialStatements, financialPage]);

  const handleFinancialPageChange = (page: number) => {
    setFinancialPage(page);
  };

  const handleFinancialCardClick = (statement: FinancialStatement) => {
    setSelectedStatement(statement);
    setIsFinancialModalOpen(true);
  };

  const closeFinancialModal = () => {
    setSelectedStatement(null);
    setIsFinancialModalOpen(false);
  };

  const openPDFViewer = (url: string, title: string, year: string) => {
    setPdfToView({ url, title, year });
    setIsPDFViewerOpen(true);
  };

  const closePDFViewer = () => {
    setPdfToView(null);
    setIsPDFViewerOpen(false);
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Effect to scroll to the selected slide when modal opens
  React.useEffect(() => {
    if (emblaApi && isModalOpen) {
      emblaApi.scrollTo(selectedIndex, false);
    }
  }, [emblaApi, isModalOpen, selectedIndex]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Fetch data when component mounts
  useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchInternshipTestimonials(),
          fetchFinancialStatements(),
          fetchStudentSupportProjects(),
        ]);
      } catch (error) {
        console.error('[ResearchStudentSupportPage] Error fetching data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    loadPageData();
  }, []);
  
  // Group testimonials by year
  const groupedByYear = content.internshipTestimonials.reduce((acc, testimonial) => {
    if (!acc[testimonial.year]) {
      acc[testimonial.year] = [];
    }
    acc[testimonial.year].push(testimonial);
    return acc;
  }, {} as Record<string, typeof content.internshipTestimonials>);

  // Sort years in descending order
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  // Update expanded years when data is loaded (only once)
  React.useEffect(() => {
    if (sortedYears.length > 0 && Object.keys(expandedYears).length === 0) {
      setExpandedYears({ [sortedYears[0]]: true });
    }
  }, [sortedYears.length]);

  // Show loading state
  if (pageLoading || loadingStates.internshipTestimonials || loadingStates.financialStatements) {
    return <PageSkeletonLoader message="Loading Research, Student, and Financial Support..." />;
  }

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const handleYearPageChange = (year: string, page: number) => {
    setYearPages(prev => ({ ...prev, [year]: page }));
  };

  const handleImageClick = (testimonial: InternshipTestimonial, imageUrl?: string, isFromGallery: boolean = false) => {
    setSelectedTestimonial(testimonial);
    setShowOnlyOneImage(!isFromGallery);
    
    // Determine which image to show first
    if (testimonial.images && testimonial.images.length > 0) {
      const clickedImage = imageUrl || testimonial.images[0];
      const idx = testimonial.images.indexOf(clickedImage);
      if (idx !== -1) {
        setSelectedIndex(idx);
      } else {
        setSelectedIndex(0);
      }
    } else {
      setSelectedIndex(0);
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <PageHeaderTheme theme="transparent" scrollThreshold={700} />
      
      {/* Hero Section */}
      <SectionTheme theme="transparent">
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            {/* Agricultural Research Image */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
              alt="Agricultural Research"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />
            
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 50%, rgba(24,135,252,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 70% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)
                `,
                animation: 'gradientShift 10s ease-in-out infinite alternate'
              }}
            />
            
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: 0,
                }}
                animate={{
                  y: [0, -500],
                  x: [0, (Math.random() - 0.5) * 150],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 12 + Math.random() * 8,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)',
              }}
            >
              Research, Student, and Financial Support
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Comprehensive support including thesis funding, internships, and financial assistance
            </motion.p>
          </div>
        </section>
      </SectionTheme>

      {/* Support Overview Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Thesis Support */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-[#1887FC] rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thesis Support</h3>
              <p className="text-gray-600">
                Funding and mentorship for undergraduate and graduate thesis research in agriculture and related fields.
              </p>
            </div>

            {/* Internship Program */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-[#1887FC] rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Internship Program</h3>
              <p className="text-gray-600">
                Hands-on research experience working with our team on real-world agricultural projects and studies.
              </p>
            </div>

            {/* Financial Statements */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-[#1887FC] rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Statements</h3>
              <p className="text-gray-600">
                Transparent financial reporting showing our stewardship of resources for research and thesis support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Thesis Support Projects Section */}
      <div className="py-16 bg-[#f8fbff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1887FC] to-blue-600 shadow-lg shadow-blue-500/30 mb-4"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Thesis Support Projects
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Explore the research projects we are supporting through our thesis funding program
            </motion.p>
          </div>

          {content.studentSupportProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1887FC]/10 to-blue-100 mb-4">
                <BookOpen className="w-8 h-8 text-[#1887FC]" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Thesis support projects will be displayed here once they are added.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {content.studentSupportProjects.map((project) => {
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 cursor-pointer group"
                  onClick={() => handleThesisProjectClick(project)}
                >
                  <div className="flex flex-col md:flex-row gap-4 p-6">
                    {/* Image */}
                    <div className="md:w-64 flex-shrink-0">
                      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl w-full aspect-video md:aspect-square">
                        <ImageWithFallback
                          src={project.imageUrl || "/images/logos/placeholder.png"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>
                    </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#1887FC] transition-colors leading-tight">
                              {project.title}
                            </h3>
                            <ArrowRight className="w-6 h-6 text-[#1887FC] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </div>
                          {project.description && (
                            <div className="text-gray-600 mt-3 line-clamp-3 whitespace-pre-line text-sm sm:text-base">
                              <RichTextContent text={project.description} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          {project.date && (
                            <div className="flex items-center gap-2 text-sm text-[#1887FC]">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">{new Date(project.date).getFullYear()}</span>
                            </div>
                          )}
                          <span className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg group-hover:shadow-xl transition-all duration-200">
                            Read Full Article
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Financial Transparency Section */}
      <div className="py-16 bg-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1887FC] to-blue-600 shadow-lg shadow-blue-500/30 mb-4"
            >
              <FileText className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Financial Transparency
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-300 max-w-2xl mx-auto"
            >
              We are committed to transparency in our financial operations. Below are our annual financial statements
              demonstrating our stewardship of resources allocated for research and thesis support.
            </motion.p>
          </div>

          {/* Financial Statements Grid - Bigger Cards */}
          <div key={financialPage}>
            {content.financialStatements.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1887FC]/20 to-blue-900/50 mb-4">
                  <FileText className="w-8 h-8 text-[#1887FC]" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Financial Statements Yet</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Financial statements have not been uploaded yet. Check back later for transparency reports!
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap justify-center gap-8">
                  {currentFinancialStatements.map((statement, index) => (
                    <motion.div
                      key={statement.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="w-full max-w-sm"
                    >
                      <Card
                        className="h-full hover:shadow-2xl transition-all duration-300 border-none shadow-xl cursor-pointer bg-white rounded-[2rem] overflow-hidden group"
                        onClick={() => handleFinancialCardClick(statement)}
                      >
                        <CardHeader className="pb-2 p-8">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-black text-gray-900 group-hover:text-[#1887FC] transition-colors leading-tight">
                                {statement.title}
                              </CardTitle>
                              <CardDescription className="text-gray-400 mt-2 text-sm font-semibold uppercase tracking-wider">
                                Financial Year {statement.year}
                              </CardDescription>
                            </div>
                            <div className="ml-4">
                              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <FileText className="w-7 h-7 text-[#1887FC]" />
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-2">
                          {statement.description && (
                            <p className="text-gray-500 mb-8 leading-relaxed text-sm font-medium line-clamp-2">
                              {statement.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto">
                            {statement.pdfUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPDFViewer(statement.pdfUrl, statement.title, statement.year);
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1887FC] hover:bg-blue-600 text-white rounded-full font-bold transition-all text-sm shadow-lg shadow-blue-500/25 active:scale-95"
                              >
                                <Eye className="w-4 h-4" />
                                View PDF
                              </button>
                            )}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalFinancialPages > 1 && (
                  <Pagination
                    currentPage={financialPage}
                    totalPages={totalFinancialPages}
                    onPageChange={handleFinancialPageChange}
                    itemsPerPage={FINANCIAL_ITEMS_PER_PAGE}
                    totalItems={content.financialStatements.length}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1887FC] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the researchers and students who have benefited from our support programs
            </p>
          </div>

          {/* Year Groups */}
          {sortedYears.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="w-10 h-10 text-[#1887FC]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                No testimonials yet
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Testimonials from our supported students will be displayed here. Check back soon for inspiring stories!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedYears.map((year, groupIndex) => {
                const yearTestimonials = groupedByYear[year];
                const currentPage = yearPages[year] || 1;
                const totalPages = Math.ceil(yearTestimonials.length / ITEMS_PER_PAGE);
                
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const currentTestimonials = yearTestimonials.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                return (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    {/* Year Header - Clickable */}
                    <button
                      onClick={() => toggleYear(year)}
                      className="w-full bg-gradient-to-r from-[#1887FC] to-blue-600 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between hover:from-[#1570d8] hover:to-[#3d8ae6] transition-all"
                    >
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">{year}</h2>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-white/90 text-xs sm:text-sm">
                          {yearTestimonials.length} {yearTestimonials.length === 1 ? 'testimonial' : 'testimonials'}
                        </span>
                        {expandedYears[year] ? (
                          <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                      </div>
                    </button>

                    {/* Testimonials - Expandable */}
                    {expandedYears[year] && (
                      <div key={currentPage} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                        {currentTestimonials.map((testimonial, index) => (
                          <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 sm:p-6 border border-blue-100"
                          >
                            {/* Quote */}
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                              <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-[#1887FC] flex-shrink-0 mt-1" />
                              <p className="text-base sm:text-lg md:text-xl font-medium text-gray-900 italic">
                                {testimonial.quote}
                              </p>
                            </div>

                            {/* Author Info */}
                            <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[#1887FC] ml-8 sm:ml-10">
                              <span className="font-semibold text-sm sm:text-base">— {testimonial.name}</span>
                              <span className="hidden sm:inline text-gray-400">•</span>
                              <div className="flex items-center gap-1 text-xs sm:text-sm">
                                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>{testimonial.degree}, {testimonial.institution}</span>
                              </div>
                            </div>

                            {/* Full Story */}
                            <div className="ml-8 sm:ml-10 border-l-2 sm:border-l-4 border-[#1887FC] pl-4 sm:pl-6">
                              <div className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                                <RichTextContent text={testimonial.fullText} />
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-sm">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Published on {testimonial.publishedDate}</span>
                              </div>
                            </div>

                            {/* Images Gallery */}
                            {testimonial.images && testimonial.images.length > 0 && (
                              <div className="mt-6 ml-8 sm:ml-10">
                                <div className="flex items-center gap-2 mb-3">
                                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1887FC]" />
                                  <h4 className="text-sm sm:text-base font-semibold text-gray-800">
                                    Photos ({testimonial.images.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                  {testimonial.images.map((image, imgIndex) => (
                                    <button
                                      key={imgIndex}
                                      onClick={() => handleImageClick(testimonial, image, true)}
                                      className="relative group overflow-hidden rounded-lg border border-blue-200 hover:border-[#1887FC] transition-all aspect-square"
                                    >
                                      <ImageWithFallback
                                        src={image}
                                        alt={`${testimonial.name} - Photo ${imgIndex + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-full p-2">
                                          <ImageIcon className="w-5 h-5 text-[#1887FC]" />
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}

                        {totalPages > 1 && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => handleYearPageChange(year, page)}
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={yearTestimonials.length}
                          />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Image Carousel Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        {selectedTestimonial && (() => {
          const imagesToShow = selectedTestimonial.images && selectedTestimonial.images.length > 0
            ? selectedTestimonial.images
            : [];
          const hasMultipleImages = imagesToShow.length > 1;

          return (
            <>
              {/* Custom Blurred Overlay */}
              <DialogPortal>
                <DialogPrimitive.Overlay asChild>
                  <div className="fixed inset-0 z-50 bg-black">
                    {/* Blurred Background Image - Full Coverage */}
                    {imagesToShow.length > 0 && (
                      <div className="absolute inset-0 overflow-hidden">
                        <ImageWithFallback
                          src={imagesToShow[selectedIndex] || imagesToShow[0]}
                          alt=""
                          className="w-full h-full object-cover blur-2xl scale-110"
                        />
                        {/* Dark overlay for better contrast */}
                        <div className="absolute inset-0 bg-black/40" />
                      </div>
                    )}
                  </div>
                </DialogPrimitive.Overlay>

                <DialogPrimitive.Content
                  className="fixed inset-0 z-50 flex items-center justify-center outline-none"
                >
                  <div className="relative w-full h-full">
                    {/* Accessibility - Hidden title and description */}
                    <DialogTitle className="sr-only">
                      {selectedTestimonial ? `${selectedTestimonial.name} - Photos` : 'Photos'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      {selectedTestimonial
                        ? `View photos from ${selectedTestimonial.name}`
                        : 'View photos'}
                    </DialogDescription>

                    {/* Conditional rendering: Carousel for gallery mode, single image otherwise */}
                    {(!showOnlyOneImage && imagesToShow.length > 1) ? (
                      <>
                        {/* Carousel */}
                        <div className="relative overflow-hidden h-full" ref={emblaRef}>
                          <div className="flex h-full">
                            {imagesToShow.map((imageUrl, index) => (
                              <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                                <div className="relative w-full h-full flex items-center justify-center p-8">
                                  <ImageWithFallback
                                    src={imageUrl}
                                    alt={`${selectedTestimonial.name} - Photo ${index + 1}`}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Navigation Buttons */}
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={scrollPrev}
                              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors backdrop-blur-sm shadow-lg"
                            >
                              <ChevronLeft className="w-7 h-7" />
                            </button>
                            <button
                              onClick={scrollNext}
                              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors backdrop-blur-sm shadow-lg"
                            >
                              <ChevronRight className="w-7 h-7" />
                            </button>
                          </>
                        )}

                        {/* Image Counter - Small and subtle */}
                        {hasMultipleImages && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/10 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm font-medium">
                            {imagesToShow.length} photos
                          </div>
                        )}
                      </>
                    ) : (
                      // Single Image Mode
                      <div className="relative h-full flex items-center justify-center p-8">
                        <ImageWithFallback
                          src={imagesToShow[selectedIndex] || imagesToShow[0]}
                          alt={`${selectedTestimonial.name} - Photo`}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                      </div>
                    )}

                    {/* Close Button */}
                    <DialogPrimitive.Close className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 opacity-70 transition-all duration-200 hover:opacity-100 z-50">
                      <X className="text-gray-700 w-5 h-5" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  </div>
                </DialogPrimitive.Content>
              </DialogPortal>
            </>
          );
        })()}
      </Dialog>

      {/* Financial Statement Modal */}
      <FinancialStatementModal
        statement={selectedStatement}
        isOpen={isFinancialModalOpen}
        onClose={closeFinancialModal}
        onViewPDF={(url, title, year) => {
          closeFinancialModal();
          openPDFViewer(url, title, year);
        }}
      />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={isPDFViewerOpen}
        onClose={closePDFViewer}
        pdfUrl={pdfToView?.url || ''}
        title={pdfToView?.title || ''}
        year={pdfToView?.year}
      />

      {/* Thesis Project Detail Modal */}
      <Dialog open={isThesisModalOpen} onOpenChange={closeThesisModal}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-3xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedThesisProject?.title || 'Thesis Project'}</DialogTitle>
            <DialogDescription>Thesis project details</DialogDescription>
          </DialogHeader>
          {selectedThesisProject && (
            <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
              {/* Hero Section */}
              <div className="relative h-64 sm:h-96 overflow-hidden">
                <ImageWithFallback
                  src={selectedThesisProject.imageUrl || "/images/logos/placeholder.png"}
                  alt={selectedThesisProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                  <div className="max-w-3xl">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 mb-4"
                    >
                      <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
                        Thesis Support Project
                      </div>
                      {selectedThesisProject.date && (
                        <div className="px-4 py-1.5 bg-[#1887FC]/80 backdrop-blur-md rounded-full text-white text-xs font-bold">
                          FY {new Date(selectedThesisProject.date).getFullYear()}
                        </div>
                      )}
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl sm:text-4xl font-bold text-white leading-tight" 
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                    >
                      {selectedThesisProject.title}
                    </motion.h2>
                  </div>
                </div>
                
                {/* Close button for mobile inside hero */}
                <button
                  onClick={closeThesisModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors sm:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Grid */}
              <div className="p-6 sm:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Project Overview */}
                    {selectedThesisProject.description && (
                      <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#1887FC]/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-[#1887FC]" />
                          </div>
                          Project Overview
                        </h3>
                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed text-justify">
                          <RichTextContent text={selectedThesisProject.description} />
                        </div>
                      </section>
                    )}

                    {/* Context */}
                    {selectedThesisProject.context && (
                      <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center">
                            <Target className="w-4 h-4 text-blue-600" />
                          </div>
                          Research Context
                        </h3>
                        <div className="text-gray-700 leading-relaxed text-justify">
                          <RichTextContent text={selectedThesisProject.context} />
                        </div>
                      </section>
                    )}

                    {/* Gallery Section */}
                    {selectedThesisProject.images && selectedThesisProject.images.length > 0 && (
                      <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          Project Gallery
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedThesisProject.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setGalleryIndex(idx);
                                setIsGalleryOpen(true);
                              }}
                              className="relative aspect-square rounded-xl overflow-hidden group"
                            >
                              <ImageWithFallback
                                src={img}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            </button>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    {/* Objectives */}
                    {selectedThesisProject.objectives && (
                      <div className="bg-[#1887FC]/5 rounded-2xl p-6 border border-[#1887FC]/10">
                        <h4 className="text-sm font-bold text-[#1887FC] uppercase tracking-wider mb-4">Objectives</h4>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          <RichTextContent text={selectedThesisProject.objectives} />
                        </div>
                      </div>
                    )}

                    {/* Methodology */}
                    {selectedThesisProject.methodology && (
                      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                        <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-4">Methodology</h4>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          <RichTextContent text={selectedThesisProject.methodology} />
                        </div>
                      </div>
                    )}

                    {/* Quick Info */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Information</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Project Year</p>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedThesisProject.date ? new Date(selectedThesisProject.date).getFullYear() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <GraduationCap className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Category</p>
                            <p className="text-sm font-bold text-gray-900">Thesis Support</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={closeThesisModal}
                      className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors shadow-lg"
                    >
                      Close Article
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gallery Modal */}
      {selectedThesisProject && (
        <GalleryModal
          images={selectedThesisProject.images && selectedThesisProject.images.length > 0 
            ? selectedThesisProject.images 
            : (selectedThesisProject.imageUrl ? [selectedThesisProject.imageUrl] : [])}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          title={selectedThesisProject.title}
          initialIndex={galleryIndex}
        />
      )}
    </div>
  );
};
