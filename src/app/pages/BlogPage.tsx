import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BlogPost } from '@/app/types/content';
import { BookOpen, Calendar, User } from 'lucide-react';
import { RichTextContent } from '@/app/components/RichTextContent';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { GalleryModal } from '@/app/components/GalleryModal';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getBlogPostsPaginated } from '@/services/optimizedSupabaseService';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useLocation, useNavigate } from 'react-router';
import { stripHtmlAndImages } from '@/app/components/admin/utils/adminHelpers';

const validateUUID = (id: string | null): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const BlogPage: React.FC = () => {
  const [targetPostId, setTargetPostId] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use server-side pagination with 4 items per page (1 featured + 3 stories)
  const pagination = useServerPagination<BlogPost>({
    fetchFunction: getBlogPostsPaginated,
    itemsPerPage: 4,
  });

  // Production-ready scroll-to-top
  const scrollRef = useScrollToTop([pagination.currentPage, targetPostId]);

  // Handle selection from internal state (Hides ID from URL)
  useEffect(() => {
    // Check if a post was passed through navigation state (hidden from URL)
    const statePostId = location.state?.postId;
    
    if (statePostId && validateUUID(statePostId)) {
      setTargetPostId(statePostId);
    } else {
      // Also check query params just in case of refresh/legacy, but we won't generate these anymore
      const params = new URLSearchParams(location.search);
      const queryPostId = params.get('post');
      
      if (queryPostId && validateUUID(queryPostId)) {
        setTargetPostId(queryPostId);
      } else {
        setTargetPostId(null);
      }
    }
  }, [location.state, location.search]);

  // Show full-page skeleton during initial loading
  if (pagination.loading && pagination.currentPage === 1 && pagination.data.length === 0) {
    return <PageSkeletonLoader message="Loading Blog..." />;
  }

  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
  };

  const openGallery = (imageUrl: string) => {
    setGalleryImages([imageUrl]);
    setIsGalleryOpen(true);
  };

  // Logic to determine which post to show as "featured" (the main article at the top)
  // 1. If targetPostId is set, find that post
  // 2. Otherwise use the first post on the current page
  const selectedPost = targetPostId
    ? pagination.data.find(p => p.id === targetPostId) 
    : (pagination.currentPage === 1 ? pagination.data[0] : null);

  // Remaining posts for the grid
  const regularPosts = selectedPost 
    ? pagination.data.filter(p => p.id !== selectedPost.id)
    : pagination.data;

  return (
    <div className="min-h-screen bg-white">
      {/* Scroll anchor point */}
      <div ref={scrollRef} className="absolute top-0 left-0" />
      
      {/* Light header since we're going straight to content */}
      <PageHeaderTheme theme="light" scrollThreshold={50} />
      
      <main className="pt-24 sm:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Article Display - No Modal */}
          {selectedPost ? (
            <motion.article 
              key={selectedPost.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-20"
            >
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-[#1887FC] text-xs sm:text-sm font-bold mb-8 uppercase tracking-wider">
                    {targetPostId ? 'Reading Article' : 'Latest Insight'}
                  </span>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-12 leading-[1.1] tracking-tight w-full max-w-4xl mx-auto">
                    {selectedPost.title}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-gray-500 text-base sm:text-lg border-y border-gray-100 py-10 mb-16">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#1887FC] shadow-sm">
                        <User size={26} />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-1">Author</p>
                        <p className="font-bold text-gray-900 text-xl leading-tight">{selectedPost.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#1887FC] shadow-sm">
                        <Calendar size={26} />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-1">Published</p>
                        <p className="font-bold text-gray-900 text-xl leading-tight">{new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="relative flex items-center justify-center mb-16 group transition-all duration-500 overflow-hidden cursor-pointer w-full"
                  onClick={() => selectedPost.imageUrl && openGallery(selectedPost.imageUrl)}
                >
                  {selectedPost.imageUrl ? (
                    <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
                      <ImageWithFallback
                        src={selectedPost.imageUrl}
                        alt={selectedPost.title}
                        className="w-full h-auto max-h-[850px] object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                      <div className="absolute inset-0 ring-1 ring-black/5 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-[#f8fafc] flex items-center justify-center rounded-2xl border border-blue-100/30 overflow-hidden relative min-h-[220px] sm:min-h-[280px]">
                      {/* Subtle Pattern Background */}
                      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                        style={{ 
                          backgroundImage: `radial-gradient(#1887FC 1.5px, transparent 1.5px)`, 
                          backgroundSize: '32px 32px' 
                        }} 
                      />
                      
                      {/* Large Animated Gradient Glow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-blue-100/30 blur-[100px] rounded-full" />
                      
                      <div className="relative flex flex-col items-center">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-[4rem] bg-white shadow-[0_20px_50px_rgba(24,135,252,0.15)] flex items-center justify-center overflow-hidden border border-white/50 p-6 sm:p-8"
                        >
                          <img 
                            src="/images/logos/placeholder.png" 
                            alt="Placeholder" 
                            className="w-full h-full object-contain opacity-90"
                          />
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="prose prose-lg sm:prose-xl max-w-none px-0">
                  <RichTextContent 
                    text={selectedPost.content} 
                    className="text-gray-800 leading-[1.8] text-lg sm:text-xl text-left"
                    onImageClick={openGallery}
                  />
                </div>
              </div>
            </motion.article>
          ) : targetPostId && (
            <div className="text-center py-20">
              <p className="text-gray-500">Post not found or loading...</p>
            </div>
          )}

          {/* Separation Line */}
          {pagination.data.length > 1 && (
            <div className="h-px bg-gray-100 w-full mb-20" />
          )}

          {/* More Stories Grid */}
          {pagination.data.length > 1 && (
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-12">More Stories</h2>
              
              {pagination.loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[16/10] bg-gray-100 rounded-2xl mb-6" />
                      <div className="h-8 bg-gray-100 rounded w-3/4 mb-4" />
                      <div className="h-5 bg-gray-100 rounded w-full mb-3" />
                      <div className="h-5 bg-gray-100 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : regularPosts.length === 0 && !selectedPost ? (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <BookOpen size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No stories yet</h3>
                  <p className="text-gray-500 text-lg">Check back later for new insights.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                  {regularPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="group cursor-pointer"
                      onClick={() => {
                        // Navigate to the post using internal state to keep the URL hidden
                        if (validateUUID(post.id)) {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setTargetPostId(post.id);
                          navigate('/blog', { state: { postId: post.id }, replace: true });
                        }
                      }}
                    >
                      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-[#f8fafc] rounded-2xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all duration-500">
                        {post.imageUrl ? (
                          <>
                            <ImageWithFallback
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                openGallery(post.imageUrl!);
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center">
                            <div className="w-28 h-28 rounded-[2.5rem] bg-white shadow-[0_15px_40px_rgba(24,135,252,0.12)] flex items-center justify-center overflow-hidden border border-white/80 p-7">
                              <img 
                                src="/images/logos/placeholder.png" 
                                alt="Placeholder" 
                                className="w-full h-full object-contain opacity-95"
                              />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-black/5 rounded-2xl pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-[#1887FC] uppercase tracking-wider mb-4">
                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#1887FC] transition-colors line-clamp-2 leading-tight mb-4">
                        {post.title}
                      </h3>
                      <div className="text-gray-600 text-lg line-clamp-3 leading-relaxed">
                        {stripHtmlAndImages(post.content)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (regularPosts.length > 0 || selectedPost) && (
            <div className="mt-16">
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
            </div>
          )}
        </div>
      </main>

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImages}
        title="Blog Image"
      />
    </div>
  );
};