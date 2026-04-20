import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Quote, Calendar, GraduationCap, ChevronDown, ChevronUp, Image as ImageIcon, BookOpen, Target, FileText, Eye } from 'lucide-react';
import { useContent, InternshipTestimonial, FinancialStatement, Project } from '@/app/context/ContentContext';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Pagination } from '@/app/components/Pagination';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { ProjectList } from '@/app/components/ProjectList';
import { RichTextContent } from '@/app/components/RichTextContent';
import { GalleryModal } from '@/app/components/GalleryModal';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getProjectsPaginated } from '@/services/optimizedSupabaseService';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { FinancialStatementModal } from '@/app/components/FinancialStatementModal';
import { PDFViewerModal } from '@/app/components/PDFViewerModal';

const FINANCIAL_ITEMS_PER_PAGE = 4;
const ITEMS_PER_PAGE = 5;

export const ResearchStudentSupportPage: React.FC = () => {
  const { content, loadingStates, fetchInternshipTestimonials, fetchFinancialStatements } = useContent();
  const [pageLoading, setPageLoading] = useState(true);

  // Use server-side pagination for thesis projects
  const thesisPagination = useServerPagination<Project>({
    fetchFunction: (page, itemsPerPage) => 
      getProjectsPaginated('thesis_support', page, itemsPerPage),
    itemsPerPage: 6,
  });

  // State for pagination per year: { [year]: currentPage }
  const [yearPages, setYearPages] = useState<{ [key: string]: number }>({});

  // State for expanded years
  const [expandedYears, setExpandedYears] = useState<{ [key: string]: boolean }>({});

  // Image carousel modal
  const [selectedTestimonial, setSelectedTestimonial] = useState<InternshipTestimonial | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeGalleryImages, setActiveGalleryImages] = useState<string[]>([]);

  // Financial Statements pagination and modal state
  const [financialPage, setFinancialPage] = useState(1);
  const [selectedStatement, setSelectedStatement] = useState<FinancialStatement | null>(null);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState<{ url: string; title: string; year: string } | null>(null);

  const totalFinancialPages = Math.ceil(content.financialStatements.length / 4);
  const currentFinancialStatements = useMemo(() => {
    const start = (financialPage - 1) * 4;
    return content.financialStatements.slice(start, start + 4);
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
  
  // Fetch data when component mounts
  useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchInternshipTestimonials(),
          fetchFinancialStatements(),
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

  const handleImageClick = (testimonial: InternshipTestimonial, imageUrl?: string) => {
    setSelectedTestimonial(testimonial);
    
    const clickedImage = imageUrl || (testimonial.images && testimonial.images[0]) || '';
    
    // Always show the full gallery of images for the testimonial
    if (testimonial.images && testimonial.images.length > 0) {
      setActiveGalleryImages(testimonial.images);
      const idx = testimonial.images.indexOf(clickedImage);
      setGalleryIndex(idx !== -1 ? idx : 0);
    } else {
      setActiveGalleryImages([clickedImage]);
      setGalleryIndex(0);
    }
    
    setIsGalleryOpen(true);
  };

  const handleCloseModal = () => {
    setIsGalleryOpen(false);
    setSelectedTestimonial(null);
    setActiveGalleryImages([]);
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
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1887FC] to-blue-600 shadow-lg shadow-blue-200 mb-6"
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
              Thesis Support
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Discover the academic research and innovative studies conducted by students with our technical and financial guidance.
            </motion.p>
          </div>

          <ProjectList 
            projects={thesisPagination.data}
            pagination={thesisPagination}
            variant="simple"
          />
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
                              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-[#1887FC] flex-shrink-0 mt-1" />
                              <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 italic leading-relaxed">
                                <RichTextContent text={testimonial.quote} />
                              </div>
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
                                      onClick={() => handleImageClick(testimonial, image)}
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
                            itemsPerPage={5}
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

      {/* Gallery Modal for Testimonials */}
      {selectedTestimonial && (
        <GalleryModal
          images={activeGalleryImages}
          isOpen={isGalleryOpen}
          onClose={handleCloseModal}
          title={selectedTestimonial.name}
          initialIndex={galleryIndex}
        />
      )}

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
    </div>
  );
};
