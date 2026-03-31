import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsModal } from '@/app/components/NewsModal';
import { NewsItem } from '@/app/context/ContentContext';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/app/components/ui/button';
import { getImageUrl } from '@/utils/r2Upload';

export const NewsCarousel: React.FC = React.memo(() => {
  const { content } = useContent();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const handleReadMore = useCallback((item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
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
      <section id="news" className="py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 30%, rgba(255,255,255,1) 100%)'
        }}
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
            className="text-center mb-16"
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
              
              <h2 className="relative text-4xl sm:text-5xl font-bold mb-4"
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
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto rounded-full shadow-lg" />
          </motion.div>

          <div className="relative">
            {/* Main Card Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 mx-4">
              {/* Subtle gradient overlay on top edge */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#60a5fa]" />
              
              <div className="p-8 sm:p-10">
                {/* Carousel Container - Only for top content */}
                <div className="overflow-hidden mb-8" ref={emblaRef}>
                  <div className="flex">
                    {content.newsItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex-[0_0_100%] min-w-0"
                      >
                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Main Image Section */}
                          <div className="relative h-72 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden group">
                            {item.imageUrl ? (
                              <img
                                src={getImageUrl(item.imageUrl)}
                                alt={item.title}
                                className="w-full h-full object-contain transition-all duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center gradient-vibrant">
                                <span className="text-white text-7xl font-bold drop-shadow-2xl">IMPACT</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            
                            {/* Floating Date Badge */}
                            <div className="absolute top-4 right-4 backdrop-blur-md bg-white/90 px-4 py-2 rounded-full shadow-lg border border-white/50">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                <Calendar className="w-4 h-4 text-[#1887FC]" />
                                <span>{formatDate(item.date)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Text Section */}
                          <div className="flex flex-col justify-center space-y-4">
                            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 text-lg line-clamp-5 leading-relaxed">
                              {item.content}
                            </p>
                            <div className="mt-2">
                              <motion.button
                                onClick={() => handleReadMore(item)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:scale-105 group w-fit"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span>Read Full Story</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Static Upcoming News Thumbnails */}
                {upcomingItems.length > 0 && (
                  <div className="border-t border-blue-100/50 pt-8">
                    <p className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-3">
                      <span className="w-2 h-2 bg-[#1887FC] rounded-full animate-pulse" />
                      <span className="tracking-wide">Up Next</span>
                    </p>
                    <div className="flex gap-6 overflow-x-auto py-2 scrollbar-hide">
                      {upcomingItems.map((upcomingItem) => (
                        <button
                          key={upcomingItem.id}
                          onClick={() => scrollToIndex(upcomingItem.originalIndex)}
                          className="flex-shrink-0 w-36 group"
                        >
                          <div className="w-full h-28 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#1887FC] transition-all duration-300 mb-2 shadow-md hover:shadow-xl transform hover:scale-105 relative">
                            {upcomingItem.imageUrl ? (
                              <img
                                src={getImageUrl(upcomingItem.imageUrl)}
                                alt={upcomingItem.title}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center gradient-vibrant">
                                <span className="text-white text-sm font-bold">IMPACT</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1887FC]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <p className="text-xs text-gray-700 line-clamp-2 group-hover:text-[#1887FC] transition-colors font-medium">
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
    </>
  );
});