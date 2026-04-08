import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem } from '@/app/context/ContentContext';
import useEmblaCarousel from 'embla-carousel-react';
import { GalleryModal } from './GalleryModal';
import { RichTextContent } from './RichTextContent';

interface NewsDetailModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  news,
  isOpen,
  onClose,
}) => {
  // Move hooks before any conditional returns
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  // Only show gallery images (not the cover image)
  const galleryImages = React.useMemo(() => {
    if (!news) return [];
    // Only use images array, not imageUrl (cover image)
    if (news.images && news.images.length > 0) {
      return news.images;
    }
    return [];
  }, [news]);

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

  // Now check if news exists
  if (!news) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle className="sr-only">{news.title}</DialogTitle>
          <DialogDescription className="sr-only">
            News details for {news.title}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
          {/* Image Gallery */}
          {galleryImages.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden bg-gray-50" ref={emblaRef}>
                <div className="flex">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0 flex items-center justify-center bg-gray-900/10">
                      <img
                        src={image}
                        alt={`${news.title} - Image ${index + 1}`}
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
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
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
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {news.title}
            </h2>

            {/* Date */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
              <Calendar className="w-4 h-4 text-[#1887FC]" />
              <span className="text-sm text-gray-600 font-medium">
                {new Date(news.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-justify">
              <RichTextContent 
                text={news.content} 
                enabled={true}
                className="text-base sm:text-lg text-gray-700 leading-relaxed"
              />
            </div>
          </div>
        </div>
      </DialogContent>
      <GalleryModal
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title={news.title}
        initialIndex={galleryIndex}
      />
    </Dialog>
  );
};