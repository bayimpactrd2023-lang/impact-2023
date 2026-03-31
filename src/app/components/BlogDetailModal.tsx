import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { X, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogPost } from '@/app/context/ContentContext';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BlogDetailModalProps {
  blogPost: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  blogPost,
  isOpen,
  onClose,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Only show gallery images (not the cover image)
  const galleryImages = useMemo(() => {
    if (!blogPost) return [];
    // Only use images array, not imageUrl (cover image)
    if (blogPost.images && blogPost.images.length > 0) {
      return blogPost.images;
    }
    return [];
  }, [blogPost]);

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

  if (!blogPost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle className="sr-only">Blog Post</DialogTitle>
          <DialogDescription className="sr-only">
            Blog post by {blogPost.author}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
          {/* Image Gallery */}
          {galleryImages.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden bg-gray-50" ref={emblaRef}>
                <div className="flex">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0">
                      <ImageWithFallback
                        src={image}
                        alt={`Blog post - Image ${index + 1}`}
                        className="w-full h-64 sm:h-80 md:h-96 object-cover"
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
              {blogPost.title}
            </h2>

            {/* Author Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-[#1887FC]" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{blogPost.author}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{blogPost.authorRole}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-[#1887FC]" />
                <span className="font-medium">
                  {new Date(blogPost.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Blog Content */}
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blogPost.content}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};