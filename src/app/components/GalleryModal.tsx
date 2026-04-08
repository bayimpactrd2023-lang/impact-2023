import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogPortal } from '@/app/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

  const currentImage = images[selectedIndex] || images[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogPrimitive.Overlay asChild>
          <div className="fixed inset-0 z-[100] bg-black">
            {/* Blurred Background Image - Full Coverage */}
            <div className="absolute inset-0 overflow-hidden">
              <ImageWithFallback
                src={currentImage}
                alt=""
                className="w-full h-full object-cover blur-2xl scale-110 opacity-50"
              />
              {/* Dark overlay for better contrast */}
              <div className="absolute inset-0 bg-black/60" />
            </div>
          </div>
        </DialogPrimitive.Overlay>

        <DialogPrimitive.Content className="fixed inset-0 z-[101] flex items-center justify-center outline-none">
          <div className="relative w-full h-full flex flex-col">
            {/* Accessibility - Hidden title and description */}
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <DialogDescription className="sr-only">Viewing images from {title}</DialogDescription>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8">
              {/* Embla Carousel */}
              <div className="overflow-hidden w-full h-full max-w-7xl" ref={emblaRef}>
                <div className="flex h-full">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex-[0_0_100%] min-w-0 flex items-center justify-center">
                      <ImageWithFallback
                        src={img}
                        alt={`${title} - Image ${idx + 1}`}
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
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
                    className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 transition-all z-50"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 transition-all z-50"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Bar with Counter and Thumbnails (Optional) */}
            <div className="h-20 sm:h-24 flex items-center justify-center px-4 mb-4">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white">
                <span className="text-sm font-medium tracking-wider">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <DialogPrimitive.Close className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 transition-all z-50">
              <X className="w-6 h-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
