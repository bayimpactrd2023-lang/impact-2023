import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BlogPost } from '@/app/types/content';
import { BookOpen, ExternalLink } from 'lucide-react';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { BlogDetailModal } from '@/app/components/BlogDetailModal';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getBlogPostsPaginated } from '@/services/optimizedSupabaseService';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export const BlogPage: React.FC = () => {
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<BlogPost>({
    fetchFunction: getBlogPostsPaginated,
    itemsPerPage: 6,
  });

  // Production-ready scroll-to-top using native browser API
  const scrollRef = useScrollToTop([pagination.currentPage]);

  // Show full-page skeleton during any loading
  if (pagination.loading) {
    return <PageSkeletonLoader message="Loading Blog..." />;
  }

  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
  };

  return (
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
                Blog
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
                Insights, stories, and updates from our team on agricultural research and community development
              </motion.p>
            </motion.div>
          </div>
        </section>
      </SectionTheme>

      {/* Blog Posts Grid */}
      <SectionTheme theme="light">
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Keyed container for React re-mounting */}
          <div key={pagination.currentPage}>
            {pagination.loading ? (
              // Show loading skeleton when changing pages
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-full flex flex-col overflow-hidden bg-white rounded-3xl shadow-lg animate-pulse">
                    <div className="h-56 bg-gray-200" />
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="h-6 bg-gray-200 rounded mb-3" />
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded mb-6 w-2/3" />
                      <div className="h-12 bg-gray-200 rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pagination.data.length === 0 ? (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1887FC]/10 to-blue-100 mb-6">
                  <BookOpen className="w-10 h-10 text-[#1887FC]" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
                <p className="text-gray-600 text-base max-w-md mx-auto">
                  Check back soon for insights, stories, and updates from our team on agricultural research and community development.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
                  {pagination.data.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="h-full flex flex-col overflow-hidden cursor-pointer group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300">
                        {/* Cover Image or Fallback */}
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#1887FC] via-[#3b82f6] to-[#60a5fa]">
                          {post.imageUrl ? (
                            <ImageWithFallback
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-24 h-24 text-white/90" strokeWidth={1.5} />
                            </div>
                          )}
                          {/* Gradient Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* White Bottom Section with Content */}
                        <div className="p-6 flex-grow flex flex-col bg-white">
                          {/* Title */}
                          <h3 className="text-xl font-bold text-[#1887FC] mb-3 line-clamp-2 leading-tight">
                            {post.title || "Untitled Story"}
                          </h3>

                          {/* Content Preview */}
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                            {post.content}
                          </p>

                          {/* Read More Button */}
                          <button
                            onClick={() => {
                              setSelectedBlogPost(post);
                              setIsModalOpen(true);
                            }}
                            className="w-full bg-[#1887FC] hover:bg-[#0b5ab8] text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                          >
                            <span>Read More</span>
                            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
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
        </section>
      </SectionTheme>

      {/* Blog Detail Modal */}
      <BlogDetailModal
        blogPost={selectedBlogPost}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBlogPost(null);
        }}
      />
    </div>
  );
};