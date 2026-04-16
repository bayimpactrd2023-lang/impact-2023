import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Publication } from '@/app/types/content';
import { BookOpen, ExternalLink, Download, Eye } from 'lucide-react';
import { RichTextContent } from '@/app/components/RichTextContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { PublicationDetailModal } from '@/app/components/PublicationDetailModal';
import { PDFViewerModal } from '@/app/components/PDFViewerModal';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getPublicationsPaginated } from '@/services/optimizedSupabaseService';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { downloadPDF } from '@/utils/downloadHelpers';
import { useScrollToTop } from '@/hooks/useScrollToTop';

// Publications Page Component
export const PublicationsPage: React.FC = () => {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState<{ url: string; title: string } | null>(null);

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Publication>({
    fetchFunction: getPublicationsPaginated,
    itemsPerPage: 6,
  });

  // Production-ready scroll-to-top using native browser API
  const scrollRef = useScrollToTop([pagination.currentPage]);

  // Show full-page skeleton during any loading
  if (pagination.loading) {
    return <PageSkeletonLoader message="Loading Publications..." />;
  }

  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
  };
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
        {/* Scroll anchor point */}
        <div ref={scrollRef} className="absolute top-0 left-0" />
        
        <PageHeaderTheme theme="transparent" scrollThreshold={700} />
        
        {/* Hero Section - Match Home Page Style */}
        <SectionTheme theme="transparent">
          <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
            {/* High-Quality Background Image with Overlay */}
            <div className="absolute inset-0">
              {/* Agricultural Research Image */}
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
                alt="Agricultural Research"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Modern Gradient Overlay - Instagram-style */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />
              
              {/* Animated Gradient Accent */}
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
              
              {/* Floating Particles */}
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
              
              {/* Futuristic Grid Overlay */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }}
              />
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                  className="text-3xl sm:text-5xl font-bold text-white mb-2"
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)',
                  }}
                >
                  Publications
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-base sm:text-xl text-white/90"
                  style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  Explore our research contributions and scholarly publications
                </motion.p>
              </motion.div>
            </div>
          </section>
        </SectionTheme>

        {/* Publications List */}
        <SectionTheme theme="light">
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Keyed container for React re-mounting */}
              <div key={pagination.currentPage}>
                {pagination.data.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1887FC]/10 to-blue-100 mb-6">
                      <BookOpen className="w-10 h-10 text-[#1887FC]" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Publications Yet</h3>
                    <p className="text-gray-600 text-base max-w-md mx-auto">
                      Check back soon for our latest research papers and publications.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {pagination.data.map((publication) => (
                        <div
                          key={publication.id}
                        >
                          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md cursor-pointer"
                                onClick={() => {
                                  setSelectedPublication(publication);
                                  setIsModalOpen(true);
                                }}
                          >
                            <CardHeader>
                              <CardTitle className="text-xl font-bold text-gray-900 hover:text-[#1887FC] transition-colors">
                                {publication.title}
                              </CardTitle>
                              <CardDescription className="text-gray-600">
                                {publication.authors}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {publication.excerpt && (
                                <div className="text-gray-700 mb-4 leading-relaxed">
                                  <RichTextContent text={publication.excerpt} />
                                </div>
                              )}
                              <div className="flex gap-3 mt-4">
                                {publication.link && (
                                  <a
                                    href={publication.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1887FC] hover:bg-[#0b5ab8] text-white rounded-lg font-medium transition-colors text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    View Online
                                  </a>
                                )}
                                {(() => {
                                  const pdfUrl = publication.pdfUrl;
                                  if (!pdfUrl) return null;
                                  return (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // View PDF in modal
                                          if (pdfUrl.startsWith('data:')) {
                                            const base64Data = pdfUrl.split(',')[1];
                                            const byteCharacters = atob(base64Data);
                                            const byteNumbers = new Array(byteCharacters.length);
                                            for (let i = 0; i < byteCharacters.length; i++) {
                                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                                            }
                                            const byteArray = new Uint8Array(byteNumbers);
                                            const blob = new Blob([byteArray], { type: 'application/pdf' });
                                            const blobUrl = URL.createObjectURL(blob);
                                            setPdfToView({ url: blobUrl, title: publication.title });
                                            setIsPDFViewerOpen(true);
                                          } else {
                                            setPdfToView({ url: pdfUrl, title: publication.title });
                                            setIsPDFViewerOpen(true);
                                          }
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1887FC] hover:bg-[#0b5ab8] text-white rounded-lg font-medium transition-colors text-sm shadow-sm hover:shadow-md"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View PDF
                                      </button>
                                      {publication.pdfAccessType === 'download' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            downloadPDF(pdfUrl, publication.title);
                                          }}
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm border border-gray-300"
                                        >
                                          <Download className="w-4 h-4" />
                                          Download PDF
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <PaginationControls
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        loading={pagination.loading}
                        onPageChange={handlePageChange}
                        onPrevious={pagination.prevPage}
                        onNext={pagination.nextPage}
                        itemCount={pagination.data.length}
                        totalItems={pagination.totalItems}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </SectionTheme>
      </div>

      {/* Publication Detail Modal */}
      <PublicationDetailModal
        publication={selectedPublication}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPublication(null);
        }}
        onViewPDF={(url, title) => {
          setIsModalOpen(false);
          setPdfToView({ url, title });
          setIsPDFViewerOpen(true);
        }}
      />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        pdfUrl={pdfToView?.url || ''}
        title={pdfToView?.title || ''}
        isOpen={isPDFViewerOpen}
        onClose={() => {
          setIsPDFViewerOpen(false);
          setPdfToView(null);
        }}
      />
    </>
  );
};