import React, { useState, useCallback, useEffect } from 'react';
import { Project } from '@/app/context/ContentContext';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/app/components/ui/dialog';
import { X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface FindingDetailModalProps {
  finding: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({ finding, isOpen, onClose }) => {
  // Move hooks before any conditional returns
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Combine imageUrl and images array for gallery
  const galleryImages = React.useMemo(() => {
    if (!finding) return [];
    const images: string[] = [];
    if (finding.imageUrl) images.push(finding.imageUrl);
    if (finding.images && finding.images.length > 0) {
      images.push(...finding.images);
    }
    return images;
  }, [finding]);

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

  // Now check if finding exists
  if (!finding) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 bg-white overflow-hidden">
        {/* Hidden title and description for accessibility */}
        <DialogTitle className="sr-only">{finding.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Details about {finding.title}
        </DialogDescription>

        {galleryImages.length > 0 ? (
          <div className="relative h-[90vh]">
            {/* Blurred Background Image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={galleryImages[selectedIndex]}
                alt=""
                className="w-full h-full object-cover blur-3xl scale-110 opacity-30"
              />
            </div>

            {/* Image Section */}
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {galleryImages.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                      <img
                        src={image}
                        alt={`${finding.title} - Image ${index + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors backdrop-blur-sm shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors backdrop-blur-sm shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            {/* Image Counter - Small and subtle */}
            {galleryImages.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/10 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm font-medium">
                {galleryImages.length} photos
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[90vh] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-gray-800 rounded-full p-2.5 transition-colors backdrop-blur-sm shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <FileText className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};