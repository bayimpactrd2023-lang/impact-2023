import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogPortal } from '@/app/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface GalleryModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialIndex?: number;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  images,
  isOpen,
  onClose,
  title = "Image Gallery",
  initialIndex = 0
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    startIndex: initialIndex
  });
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

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

  // Handle external initialIndex changes when modal is already open
  useEffect(() => {
    if (emblaApi && isOpen) {
      emblaApi.scrollTo(initialIndex, true);
    }
  }, [emblaApi, initialIndex, isOpen]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm" />

        <DialogPrimitive.Content className="fixed inset-0 z-[101] flex items-center justify-center outline-none p-4">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Accessibility - Hidden title and description */}
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <DialogDescription className="sr-only">Viewing images from {title}</DialogDescription>

            {/* Carousel Container */}
            <div className="overflow-hidden w-full flex items-center justify-center py-10" ref={emblaRef}>
              <div className="flex w-full items-center">
                {images.map((img, idx) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 flex items-center justify-center p-8">
                    <img
                      src={img}
                      alt={`${title} - Image ${idx + 1}`}
                      className="max-w-[80vw] sm:max-w-[65vw] h-auto max-h-[55vh] object-contain shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-md transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[102]"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[102]"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-10 px-4 py-2 bg-black/50 text-white rounded-full text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </div>

            {/* Close Button */}
            <DialogPrimitive.Close className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[102]">
              <X className="w-6 h-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
