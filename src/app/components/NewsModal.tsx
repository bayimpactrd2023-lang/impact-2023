import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem } from '@/app/context/ContentContext';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
  const hasGallery = galleryImages.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-5xl lg:max-w-6xl max-h-[95vh] overflow-y-auto scrollbar-hide bg-white border-none shadow-2xl p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 sm:p-6 md:p-8"
        >
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
              {newsItem.title}
            </h2>
            <DialogTitle className="sr-only">{newsItem.title}</DialogTitle>
            <DialogDescription className="sr-only">News article published on {formatDate(newsItem.date)}</DialogDescription>
          </div>

          {/* Image Gallery */}
          {hasGallery && (
            <div className="relative mb-4 mt-6">
              <div className="overflow-hidden rounded-2xl bg-gray-100" ref={emblaRef}>
                <div className="flex">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0">
                      <ImageWithFallback
                        src={image}
                        alt={`${newsItem.title} - Image ${index + 1}`}
                        className="w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => {
                          setGalleryIndex(index);
                          setIsGalleryOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 hover:scale-110 transition-all duration-300 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 hover:scale-110 transition-all duration-300 z-10"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>

              {/* Dots Indicator - Instagram Style */}
              <div className="flex justify-center gap-2 mt-4">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-[#1887FC]'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Single Image (fallback if no gallery) */}
          {!hasGallery && newsItem.imageUrl && (
            <div className="mb-4 mt-6 rounded-2xl overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={newsItem.imageUrl}
                alt={newsItem.title}
                className="w-full h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => {
                  setGalleryIndex(0);
                  setIsGalleryOpen(true);
                }}
              />
            </div>
          )}

          {/* Published Date - Now below gallery/image */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 text-[#1887FC]" />
            </div>
            <span className="font-semibold tracking-wide">Published on {formatDate(newsItem.date)}</span>
          </div>

          <div className="text-base md:text-lg text-gray-700 leading-relaxed text-justify">
            <RichTextContent 
              text={newsItem.content}
              className="text-base md:text-lg text-gray-700 leading-relaxed"
            />
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