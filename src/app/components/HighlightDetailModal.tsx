import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/app/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Highlight } from '@/app/context/ContentContext';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GalleryModal } from './GalleryModal';
import { motion } from 'motion/react';

interface HighlightDetailModalProps {
  highlight: Highlight | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HighlightDetailModal: React.FC<HighlightDetailModalProps> = ({
  highlight,
  isOpen,
  onClose,
}) => {
  // Move hooks before any conditional returns
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  // Only use images array for gallery (exclude cover image)
  const galleryImages = React.useMemo(() => {
    if (!highlight) return [];
    if (highlight.images && highlight.images.length > 0) {
      return highlight.images;
    }
    return [];
  }, [highlight]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Now check if highlight exists
  if (!highlight) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fullText = highlight.content?.trim() ? highlight.content : highlight.description;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl p-0 flex flex-col">
        {/* DialogTitle and DialogDescription must be direct children of DialogContent for Radix accessibility */}
        <DialogTitle className="sr-only">{highlight.title}</DialogTitle>
        <DialogDescription className="sr-only">{fullText}</DialogDescription>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto scrollbar-hide"
        >
          {/* Image Gallery */}
          {galleryImages.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden bg-gray-50" ref={emblaRef}>
                <div className="flex">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0 flex items-center justify-center bg-gray-900/10">
                      <ImageWithFallback
                        src={image}
                        alt={`${highlight.title} - Image ${index + 1}`}
                        className="max-w-full max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] object-contain shadow-sm cursor-pointer"
                        onClick={() => {
                          setGalleryIndex(index);
                          setIsGalleryOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Controls */}
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

                  {/* Dots Indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#1887FC]/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                        className={`h-1.5 rounded-full transition-all ${ 
                          index === selectedIndex 
                            ? 'w-6 bg-white' 
                            : 'w-1.5 bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            {/* Visible Header with Title and Date */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{highlight.title}</h2>
              {highlight.publishedDate && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatDate(highlight.publishedDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-justify">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                <span className="whitespace-pre-line">{fullText}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </DialogContent>
      <GalleryModal
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title={highlight.title}
        initialIndex={galleryIndex}
      />
    </Dialog>
  );
};