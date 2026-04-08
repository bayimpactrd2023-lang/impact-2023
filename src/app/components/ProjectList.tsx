import React, { useState, useMemo, useCallback } from "react";
import { Project } from "@/app/context/ContentContext";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { PageHeaderTheme } from "@/app/components/PageHeaderTheme";
import { motion } from "motion/react";
import { SectionTheme } from "@/app/components/SectionTheme";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Pagination } from "@/app/components/Pagination";
import { PaginationControls } from "@/app/components/admin/PaginationControls";
import { ServerPaginationResult } from "@/hooks/useServerPagination";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { GalleryModal } from "./GalleryModal";
import {
  Dialog,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import useEmblaCarousel from "embla-carousel-react";
import { RichTextContent } from "./RichTextContent";

interface ProjectListProps {
  projects: Project[];
  title: string;
  subtitle?: string;
  pagination?: ServerPaginationResult<Project>; // Optional pagination prop
}

const ITEMS_PER_PAGE = 5;

// Check if rich text is enabled for this category
const isRichTextEnabled = (category?: string) => 
  category === 'locally_funded' || category === 'internationally_funded';

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  title,
  subtitle,
  pagination,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(''); // Track which image was clicked
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [showOnlyOneImage, setShowOnlyOneImage] = useState(false);

  // Production-ready scroll-to-top using native browser API
  const scrollRef = useScrollToTop([pagination?.currentPage || currentPage]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Effect to scroll to the selected slide when modal opens
  React.useEffect(() => {
    if (emblaApi && isModalOpen) {
      emblaApi.scrollTo(selectedIndex, false); // false = no animation on initial load
    }
  }, [emblaApi, isModalOpen, selectedIndex]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Use server-side pagination if provided, otherwise use client-side
  const totalPages = pagination ? pagination.totalPages : Math.ceil(
    projects.length / ITEMS_PER_PAGE,
  );
  const currentProjects = pagination ? projects : useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return projects.slice(start, start + ITEMS_PER_PAGE);
  }, [projects, currentPage]);

  const handlePageChange = (page: number) => {
    if (pagination) {
      pagination.goToPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleImageClick = (
    project: Project,
    e: React.MouseEvent,
    imageUrl?: string, // Optional parameter to specify which image was clicked
    isFromGallery: boolean = false // Flag to show all images or just one
  ) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowOnlyOneImage(!isFromGallery);
    
    // Determine the image to show first
    const clickedImage = imageUrl || project.imageUrl || '';
    setSelectedImageUrl(clickedImage);
    
    // Find index of clicked image in gallery
    if (project.images && project.images.length > 0) {
      const idx = project.images.indexOf(clickedImage);
      if (idx !== -1) {
        setSelectedIndex(idx);
      } else {
        setSelectedIndex(0);
      }
    } else {
      setSelectedIndex(0);
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setSelectedImageUrl(''); // Reset the image URL
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Scroll anchor point */}
      <div ref={scrollRef} className="absolute top-0 left-0" />
      
      <PageHeaderTheme
        theme="transparent"
        scrollThreshold={700}
      />

      {/* Hero Section - Match Home Page Style */}
      <SectionTheme theme="transparent">
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* High-Quality Background Image with Overlay */}
          <div className="absolute inset-0">
            {/* Agricultural Research Image */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
              alt="Agricultural Research"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Modern Gradient Overlay - Instagram-style */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />

            {/* Animated Gradient Accent */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 50%, rgba(24,135,252,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 70% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)
                `,
                animation:
                  "gradientShift 10s ease-in-out infinite alternate",
              }}
            />

            {/* Floating Particles */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: 0,
                }}
                animate={{
                  y: [0, -500],
                  x: [0, (Math.random() - 0.5) * 150],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 12 + Math.random() * 8,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
              />
            ))}

            {/* Futuristic Grid Overlay */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{
                textShadow:
                  "0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)",
              }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto"
                style={{
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </section>
      </SectionTheme>

      {/* Content Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Keyed container for React re-mounting */}
          <div key={pagination?.currentPage || currentPage}>
            <div className="space-y-6">
              {currentProjects.map((project) => {
                const isExpanded = expandedId === project.id;
                const coverImage =
                  project.imageUrl ||
                  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";
                const displayImages =
                  project.images && project.images.length > 0
                    ? project.images
                    : project.imageUrl
                      ? [project.imageUrl]
                      : [];

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Collapsed View - Title with Image */}
                    <div className="flex flex-col md:flex-row gap-4 p-6">
                      {/* Image - Clickable */}
                      <div className="md:w-64 flex-shrink-0">
                        <button
                          onClick={(e) =>
                            handleImageClick(project, e, coverImage, false)
                          }
                          className="relative group overflow-hidden rounded-lg w-full h-48 md:h-40"
                        >
                          <ImageWithFallback
                            src={coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 font-semibold px-4 py-2 bg-black/50 rounded">
                              View Full Size
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* Title and Toggle */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <button
                            onClick={() =>
                              toggleExpand(project.id)
                            }
                            className="text-left w-full group"
                          >
                            <h3 className="text-2xl font-bold text-[#1887FC] group-hover:text-[#0d6fd8] transition-colors flex items-center justify-between">
                              {project.title}
                              {isExpanded ? (
                                <ChevronUp className="w-6 h-6 flex-shrink-0 ml-2" />
                              ) : (
                                <ChevronDown className="w-6 h-6 flex-shrink-0 ml-2" />
                              )}
                            </h3>
                          </button>
                          {!isExpanded && project.description && (
                            <p className="text-gray-600 mt-2 line-clamp-2 whitespace-pre-line">
                              <RichTextContent text={project.description} enabled={isRichTextEnabled(project.category)} />
                            </p>
                          )}
                        </div>
                        {!isExpanded && (
                          <button
                            onClick={() =>
                              toggleExpand(project.id)
                            }
                            className="text-[#1887FC] hover:underline mt-2 text-left font-medium"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded View - Full Details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-6 border-t pt-6">
                        {/* Description */}
                        {project.description && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Project Overview
                            </h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              <RichTextContent text={project.description} enabled={isRichTextEnabled(project.category)} />
                            </p>
                          </div>
                        )}

                        {/* Project Context */}
                        {project.context && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Project Context
                            </h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              {project.context}
                            </p>
                          </div>
                        )}

                        {/* Objectives */}
                        {project.objectives && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Objectives
                            </h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              <RichTextContent text={project.objectives} enabled={isRichTextEnabled(project.category)} />
                            </p>
                          </div>
                        )}

                        {/* Methodology and Activities */}
                        {project.methodology && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Methodology and Activities
                            </h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              <RichTextContent text={project.methodology} enabled={isRichTextEnabled(project.category)} />
                            </p>
                          </div>
                        )}

                        {/* Image Gallery (if multiple images) */}
                        {displayImages.length > 1 && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-4">
                              Project Gallery
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {displayImages.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) =>
                                    handleImageClick(project, e, img, true)
                                  }
                                  className="relative group overflow-hidden rounded-lg border-2 border-blue-200 hover:border-[#1887FC] transition-all aspect-video"
                                >
                                  <ImageWithFallback
                                    src={
                                      img ||
                                      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                                    }
                                    alt={`${project.title} - Image ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Click on any photo to view in
                              slideshow
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="text-[#1887FC] hover:underline font-medium flex items-center gap-2"
                        >
                          <ChevronUp className="w-5 h-5" />
                          Collapse Details
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  No projects available at the moment.
                </p>
              </div>
            ) : pagination ? (
              // Server-side pagination controls
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                loading={pagination.loading}
                onPageChange={handlePageChange}
                onPrevious={pagination.prevPage}
                onNext={pagination.nextPage}
                itemCount={pagination.data.length}
                totalItems={pagination.totalItems}
              />
            ) : (
              // Client-side pagination controls
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={projects.length}
              />
            )}
          </div>
        </div>
      </div>

      {/* Image Carousel Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={handleCloseModal}
      >
        {selectedProject && (() => {
          // Use the selected image URL (either cover or gallery image)
          const displayImage = selectedImageUrl || selectedProject.imageUrl;
          
          // For gallery mode, use the current slide's image for the background
          const backgroundImage = selectedProject.images && selectedProject.images.length > 0
            ? selectedProject.images[selectedIndex]
            : displayImage;

          return (
            <>
              {/* Custom Blurred Overlay */}
              <DialogPortal>
                <DialogPrimitive.Overlay asChild>
                  <div className="fixed inset-0 z-50 bg-black">
                    {/* Blurred Background Image - Full Coverage */}
                    {backgroundImage && (
                      <div className="absolute inset-0 overflow-hidden">
                        <ImageWithFallback
                          src={backgroundImage}
                          alt=""
                          className="w-full h-full object-cover blur-2xl scale-110"
                        />
                        {/* Dark overlay for better contrast */}
                        <div className="absolute inset-0 bg-black/40" />
                      </div>
                    )}
                  </div>
                </DialogPrimitive.Overlay>

                <DialogPrimitive.Content
                  className="fixed inset-0 z-50 flex items-center justify-center outline-none"
                >
                  <div className="relative w-full h-full">
                    {/* Accessibility - Hidden title and description */}
                    <DialogTitle className="sr-only">
                      {selectedProject.title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      View image from {selectedProject.title}
                    </DialogDescription>

                    {/* Conditional rendering: Carousel for gallery mode, single image otherwise */}
                    {(!showOnlyOneImage && selectedProject.images && selectedProject.images.length > 1) ? (
                      // Gallery Carousel Mode
                      <div className="relative h-full flex items-center justify-center p-8">
                        {/* Embla Carousel */}
                        <div className="overflow-hidden w-full max-w-6xl" ref={emblaRef}>
                          <div className="flex">
                            {selectedProject.images.map((img, idx) => (
                              <div key={idx} className="flex-[0_0_100%] min-w-0 flex items-center justify-center">
                                <ImageWithFallback
                                  src={img || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"}
                                  alt={`${selectedProject.title} - Image ${idx + 1}`}
                                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all duration-300 cursor-pointer"
                                  onClick={() => {
                                    setGalleryIndex(idx);
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
                          className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 z-50"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                          onClick={scrollNext}
                          className="absolute right-4 sm:right-20 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 z-50"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                          <span className="text-sm font-semibold text-gray-700">
                            {selectedIndex + 1} / {selectedProject.images.length}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Single Image Mode (for cover image or single image projects)
                      displayImage ? (
                        <div className="relative h-full flex items-center justify-center p-8">
                          <ImageWithFallback
                            src={displayImage}
                            alt={selectedProject.title}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all duration-300 cursor-pointer"
                            onClick={() => {
                              // If it's a cover image, check if we have gallery images
                              const idx = selectedProject.images?.indexOf(selectedImageUrl) ?? 0;
                              setGalleryIndex(idx >= 0 ? idx : 0);
                              setIsGalleryOpen(true);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="relative h-full flex items-center justify-center">
                          <p className="text-white/70 text-lg">No image available</p>
                        </div>
                      )
                    )}

                    {/* Close Button */}
                    <DialogPrimitive.Close className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 opacity-70 transition-all duration-200 hover:opacity-100 z-50">
                      <X className="text-gray-700 w-5 h-5" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  </div>
                </DialogPrimitive.Content>
              </DialogPortal>
              <GalleryModal
                images={selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images : ([selectedProject.imageUrl].filter(Boolean) as string[])}
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                title={selectedProject.title}
                initialIndex={galleryIndex}
              />
            </>
          );
        })()}
      </Dialog>
    </div>
  );
};