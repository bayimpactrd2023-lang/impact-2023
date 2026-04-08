import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import {
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Mail,
  Download,
  Eye,
} from "lucide-react";
import { Publication } from "@/app/context/ContentContext";
import { Button } from "@/app/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { downloadPDF } from "@/utils/downloadHelpers";
import { GalleryModal } from "./GalleryModal";
import { RichTextContent } from "./RichTextContent";

interface PublicationDetailModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPDF?: (url: string, title: string) => void;
}

export const PublicationDetailModal: React.FC<
  PublicationDetailModalProps
> = ({ publication, isOpen, onClose, onViewPDF }) => {
  // Embla Carousel setup - hooks must be called before any early returns
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onInit = useCallback((api: EmblaCarouselType) => {
    api.on("select", () => {
      setSelectedIndex(api.selectedScrollSnap());
    });
  }, []);

  useEffect(() => {
    if (emblaApi) onInit(emblaApi);
  }, [emblaApi, onInit]);

  // Now check if publication exists - after all hooks are called
  if (!publication) return null;

  const galleryImages = publication.galleryImages || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle className="sr-only">
            {publication.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Publication details for {publication.title}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
          {/* Featured Image Section */}
          {galleryImages.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden bg-gray-50" ref={emblaRef}>
                <div className="flex">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0 flex items-center justify-center bg-gray-900/10">
                      <img
                        src={image}
                        alt={`${publication.title} - Image ${index + 1}`}
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
              {publication.title}
            </h2>

            {/* Authors & Date */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              {publication.authors && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-[#1887FC]" />
                  <span className="font-medium">
                    {publication.authors}
                  </span>
                </div>
              )}
              {publication.publishedDate && (
                <>
                  {publication.authors && (
                    <span className="text-gray-400">•</span>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-[#1887FC]" />
                    <span className="font-medium">
                      {new Date(
                        publication.publishedDate,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Publication Content */}
            {publication.content ? (
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none mb-6 text-justify">
                <RichTextContent 
                  text={publication.content} 
                  enabled={true}
                  className="text-base sm:text-lg text-gray-700 leading-relaxed"
                />
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm mb-6">
                No detailed content available for this publication.
              </p>
            )}

            {/* Citation Section */}
            {publication.reference && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[#1887FC]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Citation
                  </h3>
                  {publication.link &&
                    publication.link !== "#" && (
                      <Button
                        onClick={() =>
                          window.open(
                            publication.link,
                            "_blank",
                          )
                        }
                        className="bg-[#1887FC] hover:bg-[#0b5ab8] text-white font-medium shadow-md hover:shadow-lg transition-all text-sm h-9 px-4"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        View Publication
                      </Button>
                    )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-700 font-mono leading-relaxed break-words">
                    {publication.reference}
                  </p>
                </div>
              </div>
            )}

            {/* Optional Links Section */}
            {publication.optionalLinks && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Related Links & Events
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {publication.optionalLinks}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {publication.contactInfo && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Contact Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#1887FC] mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 break-words">
                    {publication.contactInfo}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              {(() => {
                const pdfUrl = publication.pdfUrl;
                if (!pdfUrl) return null;
                return publication.pdfAccessType === 'view' ? (
                  // View Only - Open in modal viewer
                  <>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        if (onViewPDF) {
                          onViewPDF(pdfUrl, publication.title);
                        }
                      }}
                      className="bg-[#1887FC] hover:bg-[#0b5ab8] text-white font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <p className="text-xs text-center text-gray-500 sm:text-left">
                      The PDF will open in the viewer
                    </p>
                  </>
                ) : (
                  // Downloadable - Show both view and download
                  <>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        if (onViewPDF) {
                          onViewPDF(pdfUrl, publication.title);
                        }
                      }}
                      variant="outline"
                      className="font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        downloadPDF(pdfUrl, publication.title);
                      }}
                      className="bg-[#1887FC] hover:bg-[#0b5ab8] text-white font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </DialogContent>
      <GalleryModal
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title={publication.title}
        initialIndex={galleryIndex}
      />
    </Dialog>
  );
};