import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/app/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem } from '@/app/context/ContentContext';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'motion/react';
import { GalleryModal } from './GalleryModal';
import { RichTextContent } from './RichTextContent';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsItem: NewsItem | null;
}

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose, newsItem }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
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

  // Return early AFTER all hooks
  if (!newsItem) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Only use gallery images, not the cover image
  const galleryImages = newsItem.images && newsItem.images.length > 0 ? newsItem.images : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl p-0 flex flex-col">
        {/* DialogTitle and DialogDescription must be direct children of DialogContent for Radix accessibility */}
        <DialogTitle className="sr-only">{newsItem.title}</DialogTitle>
        <DialogDescription className="sr-only">News article published on {formatDate(newsItem.date)}</DialogDescription>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto scrollbar-hide"
        >
          {/* Image Gallery Section */}
          <div className="relative group">
            <div className="overflow-hidden bg-gray-50" ref={emblaRef}>
              <div className="flex">
                {galleryImages.length > 0 ? (
                  galleryImages.map((image, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0 flex items-center justify-center bg-gray-900/10">
                      <img
                        src={image}
                        alt={`${newsItem.title} - Image ${index + 1}`}
                        className="max-w-full max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] object-contain shadow-sm cursor-pointer"
                        onClick={() => {
                          setGalleryIndex(index);
                          setIsGalleryOpen(true);
                        }}
                      />
                    </div>
                  ))
                ) : newsItem.imageUrl ? (
                  <div className="flex-[0_0_100%] min-w-0 flex items-center justify-center bg-gray-900/10">
                    <img
                      src={newsItem.imageUrl}
                      alt={newsItem.title}
                      className="max-w-full max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] object-contain shadow-sm cursor-pointer"
                      onClick={() => {
                        setGalleryIndex(0);
                        setIsGalleryOpen(true);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>

                {/* Progress Indicator - Pill Style */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#1887FC]/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi && emblaApi.scrollTo(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {newsItem.title}
              </h2>
              
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatDate(newsItem.date)}
                </span>
              </div>
            </div>

            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-justify">
              <RichTextContent 
                text={newsItem.content}
                className="text-base sm:text-lg text-gray-700 leading-relaxed"
              />
            </div>
          </div>
        </motion.div>
      </DialogContent>

      <GalleryModal
        images={galleryImages.length > 0 ? galleryImages : newsItem.imageUrl ? [newsItem.imageUrl] : []}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title={newsItem.title}
        initialIndex={galleryIndex}
      />
    </Dialog>
  );
};