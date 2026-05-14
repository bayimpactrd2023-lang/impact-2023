import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsModal } from '@/app/components/NewsModal';
import {
  Dialog,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NewsItem } from '@/app/context/ContentContext';
import { RichTextContent } from '@/app/components/RichTextContent';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/app/components/ui/button';
import { getImageUrl } from '@/utils/r2Upload';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const NewsCarousel: React.FC = React.memo(() => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    dragFree: false, // Set to false to prevent slides from stopping in-between
    duration: 35,   // Faster transitions
  });
  const { content, fetchNews, loadingStates } = useContent();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');

  // Handle lazy loading when approaching the end of the carousel
  useEffect(() => {
    if (!emblaApi || !content.newsHasMore || loadingStates.news) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setCurrentIndex(index);
      
      // Much earlier prefetching: trigger when only 6 items left
      if (index >= content.newsItems.length - 6) {
        fetchNews(content.newsNextCursor);
      }
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, content.newsHasMore, content.newsNextCursor, content.newsItems.length, loadingStates.news, fetchNews]);

  const handleReadMore = useCallback((item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
  }, []);

  const handleImageClick = useCallback((imageUrl: string, title: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageTitle(title);
    setIsImageModalOpen(true);
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollToIndex = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Track current slide index
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Handle re-initialization when items change
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, content.newsItems]);

  // Memoize upcoming items calculation
  const upcomingItems = useMemo(() => {
    if (content.newsItems.length <= 1) return [];
    
    const upcoming = [];
    const totalItems = content.newsItems.length;
    
    // Show up to 4 upcoming items
    for (let i = 1; i <= Math.min(4, totalItems - 1); i++) {
      const index = (currentIndex + i) % totalItems;
      upcoming.push({ ...content.newsItems[index], originalIndex: index });
    }
    
    return upcoming;
  }, [content.newsItems, currentIndex]);

  return (
    <>
      <section id="news" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(24, 135, 252, 0.08) 1px, transparent 0)',
            backgroundSize: '32px 32px'
        }} />
        
        {/* Floating Orbs for Depth */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-[#1887FC]/8 to-blue-400/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-[#1887FC]/8 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block relative"
            >
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1887FC]/5 via-blue-50/50 to-[#3b82f6]/5 blur-2xl rounded-full transform scale-150" />
              
              <h2 className="relative text-3xl sm:text-5xl font-bold mb-3 sm:mb-4"
                style={{
                  background: 'linear-gradient(135deg, #1887FC 0%, #3b82f6 50%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}
              >
                News & Updates
              </h2>
            </motion.div>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto rounded-full shadow-lg" />
          </motion.div>

          <div className="relative">
            {/* Main Card Container */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 mx-0 sm:mx-4">
              {/* Subtle gradient overlay on top edge */}
                
              <div className="p-0 sm:p-10">
                {/* Carousel Container - Only for top content */}
                <div className="overflow-hidden mb-0 sm:mb-8" ref={emblaRef}>
                  <div className="flex">
                    {content.newsItems.map((item, index) => {
                      const imageUrl = item.imageUrl;
                      return (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex-[0_0_100%] min-w-0"
                      >
                        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-12 items-center lg:items-center">
                          {/* Main Image Section - Clickable when has image */}
                          <div className="w-full lg:w-full">
                            {imageUrl ? (
                              <button
                                onClick={() => {
                                  const fullUrl = getImageUrl(imageUrl);
                                  if (fullUrl) handleImageClick(fullUrl, item.title);
                                }}
                                className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden group text-left cursor-pointer shadow-lg"
                              >
                                <ImageWithFallback
                                  src={imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                {/* Click hint */}
                                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  Click to view
                                </div>
                              </button>
                            ) : (
                              <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
                                <div className="w-full h-full flex items-center justify-center gradient-vibrant">
                                  <span className="text-white text-4xl sm:text-6xl font-bold drop-shadow-2xl">IMPACT</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Text Section */}
                          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 text-center lg:text-left w-full max-w-xl mx-auto lg:max-w-none px-4 sm:px-0">
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                              {item.title}
                            </h3>
                            <div className="text-gray-600 text-base sm:text-lg lg:text-xl line-clamp-3 sm:line-clamp-4 lg:line-clamp-6 leading-relaxed">
                              <RichTextContent text={item.content} className="text-base sm:text-lg lg:text-xl" />
                            </div>
                            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
                              <motion.button
                                onClick={() => handleReadMore(item)}
                                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 group w-full sm:w-fit justify-center"
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="text-lg">Learn More</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                              </motion.button>
                              
                              {loadingStates.news && (
                                <div className="flex items-center gap-2 text-[#1887FC] animate-pulse">
                                  <div className="w-2 h-2 bg-[#1887FC] rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-[#1887FC] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <div className="w-2 h-2 bg-[#1887FC] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <span className="text-sm font-semibold">Loading...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>

                {/* Static Upcoming News Thumbnails */}
                {upcomingItems.length > 0 && (
                  <div className="border-t border-blue-100/50 p-6 sm:p-0 sm:pt-8">
                    <p className="text-[10px] sm:text-sm font-bold text-gray-700 mb-3 sm:mb-5 flex items-center gap-2 sm:gap-3">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1887FC] rounded-full animate-pulse" />
                      <span className="tracking-wide uppercase">Up Next</span>
                    </p>
                    <div className="flex gap-3 sm:gap-6 overflow-x-auto py-2 scrollbar-hide">
                      {upcomingItems.map((upcomingItem) => (
                        <button
                          key={upcomingItem.id}
                          onClick={() => scrollToIndex(upcomingItem.originalIndex)}
                          className="flex-shrink-0 w-24 sm:w-36 group"
                        >
                          <div className="w-full h-16 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden border border-gray-100 sm:border-2 sm:border-gray-200 hover:border-[#1887FC] transition-all duration-300 mb-1 sm:mb-2 shadow-sm sm:shadow-md hover:shadow-xl transform hover:scale-105 relative">
                            {upcomingItem.imageUrl ? (
                              <ImageWithFallback
                                src={upcomingItem.imageUrl}
                                alt={upcomingItem.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center gradient-vibrant">
                                <span className="text-white text-[10px] sm:text-sm font-bold">IMPACT</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1887FC]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-700 line-clamp-2 group-hover:text-[#1887FC] transition-colors font-medium text-left">
                            {upcomingItem.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            {content.newsItems.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden sm:flex absolute left-2 top-1/3 -translate-y-1/2 z-10 rounded-full glass shadow-elegant hover:shadow-floating transition-all border-none bg-white/50 hover:bg-white text-[#1887FC]"
                  onClick={scrollPrev}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden sm:flex absolute right-2 top-1/3 -translate-y-1/2 z-10 rounded-full glass shadow-elegant hover:shadow-floating transition-all border-none bg-white/50 hover:bg-white text-[#1887FC]"
                  onClick={scrollNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <NewsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newsItem={selectedNews}
      />

      {/* Full Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90" />
          <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            <DialogTitle className="sr-only">{selectedImageTitle}</DialogTitle>
            <DialogDescription className="sr-only">Full size image of {selectedImageTitle}</DialogDescription>
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedImageUrl && (
                <img
                  src={selectedImageUrl}
                  alt={selectedImageTitle}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
              )}
              <DialogPrimitive.Close className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
});