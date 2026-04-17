import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Highlight } from '@/app/context/ContentContext';
import { Calendar, ChevronRight } from 'lucide-react';
import { RichTextContent } from '@/app/components/RichTextContent';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from "@/app/components/SectionTheme";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { HighlightDetailModal } from "@/app/components/HighlightDetailModal";
import { useServerPagination } from '@/hooks/useServerPagination';
import { getHighlightsPaginated } from '@/services/optimizedSupabaseService';

export const HighlightsPage: React.FC = () => {
  const [selectedHighlight, setSelectedHighlight] =
    useState<Highlight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Highlight>({
    fetchFunction: getHighlightsPaginated,
    itemsPerPage: 6,
  });

  // Production-ready scroll-to-top using native browser API
  const topRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever page changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [pagination.currentPage]);

  const handleHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    pagination.goToPage(newPage);
  };

  const handlePrevPage = () => {
    pagination.prevPage();
  };

  const handleNextPage = () => {
    pagination.nextPage();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      {/* Scroll anchor point */}
      <div ref={topRef} className="absolute top-0 left-0" />
      
      <PageHeaderTheme
        theme="transparent"
        scrollThreshold={700}
      />

      {/* Hero Section */}
      <SectionTheme theme="transparent">
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
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
                animation:
                  "gradientShift 10s ease-in-out infinite alternate",
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
                  ease: "linear",
                }}
              />
            ))}

            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{
                textShadow:
                  "0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)",
              }}
            >
              Our Highlights
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto"
              style={{
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              Celebrating our milestones and achievements in research and community impact
            </motion.p>
          </div>
        </section>
      </SectionTheme>

      {/* Main Highlights - News Style Cards */}
      <SectionTheme theme="light">
        <section
          className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Show inline skeleton during loading instead of full-page */}
          {pagination.loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 p-6 sm:p-8"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Image Skeleton */}
                    <div className="h-64 md:h-80 bg-gray-200 rounded-2xl animate-pulse" />
                    
                    {/* Text Skeleton */}
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-3" />
                        <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2 w-3/4" />
                        <div className="space-y-2 mt-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                        </div>
                      </div>
                      <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Keyed container for React re-mounting */}
              <div key={pagination.currentPage}>
                <div className="space-y-6">
                  {pagination.data.map((highlight, index) => {
                    const isImageOnRight = index % 2 === 1;

                    return (
                      <motion.div
                        key={highlight.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                        }}
                        viewport={{ once: true }}
                        className="group"
                      >
                        {/* News-Style Card Container */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 hover:shadow-3xl transition-all duration-500">
                          <div className="p-6 sm:p-8">
                            <div
                              className={`grid md:grid-cols-2 gap-6 ${isImageOnRight ? "md:grid-flow-dense" : ""}`}
                            >
                              {/* Image Section - Alternating Position */}
                              <div
                                className={`relative flex items-center justify-center bg-[#f8fafc] rounded-2xl overflow-hidden group/img ${isImageOnRight ? "md:col-start-2" : ""}`}
                              >
                                <ImageWithFallback
                                  src={highlight.imageUrl || '/images/logos/placeholder.png'}
                                  alt={highlight.title}
                                  className={`w-full h-auto max-h-[500px] transition-all duration-700 group-hover/img:scale-105 ${!highlight.imageUrl ? 'p-16 object-contain' : 'object-cover'}`}
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-all duration-500" />

                                {/* Date Badge */}
                                <div className="absolute top-4 right-4 backdrop-blur-md bg-white/90 px-4 py-2 rounded-full shadow-lg border border-white/50">
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <Calendar className="w-4 h-4 text-[#1887FC]" />
                                    <span>
                                      {formatDate(highlight.publishedDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Text Section - Alternating Position */}
                              <div className="flex flex-col justify-between h-full">
                                <div className="flex-1">
                                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight group-hover:text-[#1887FC] transition-colors duration-300 mb-3 break-words line-clamp-3">
                                    {highlight.title}
                                  </h3>
                                  <div className="text-gray-600 text-base leading-relaxed h-48 overflow-hidden relative">
                                    <div className="mb-3">
                                      <RichTextContent text={highlight.description} className="text-base leading-relaxed" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                  </div>
                                </div>
                                <div
                                  className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"} mt-4`}
                                >
                                  <motion.button
                                    onClick={() =>
                                      handleHighlightClick(
                                        highlight,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 hover:gap-3 transition-all duration-300 transform hover:scale-105 group/btn"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <span>Learn More</span>
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={!pagination.canGoPrev}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </Button>

                    {(() => {
                      const maxVisiblePages = 5;
                      const totalPages = pagination.totalPages;
                      const currentPage = pagination.currentPage;
                      
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust startPage if we're near the end
                      if (endPage - startPage < maxVisiblePages - 1) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      const pageNumbers = Array.from(
                        { length: endPage - startPage + 1 },
                        (_, i) => startPage + i
                      );
                      
                      return pageNumbers.map((page) => (
                        <Button
                          key={page}
                          variant={
                            pagination.currentPage === page ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => handlePageChange(page)}
                          disabled={pagination.loading || pagination.currentPage === page}
                          className={`${
                            pagination.currentPage === page
                              ? "bg-[#1887FC] hover:bg-[#0b5ab8]"
                              : ""
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {page}
                        </Button>
                      ));
                    })()}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.canGoNext}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </SectionTheme>

      {/* Highlight Detail Modal */}
      <HighlightDetailModal
        highlight={selectedHighlight}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};