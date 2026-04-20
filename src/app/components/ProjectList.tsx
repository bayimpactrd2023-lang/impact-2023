import React, { useState, useMemo, useRef } from "react";
import { Project } from "@/app/context/ContentContext";
import {
  ChevronDown,
  ChevronUp,
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
import { RichTextContent } from "./RichTextContent";

interface ProjectListProps {
  projects: Project[];
  title?: string;
  subtitle?: string;
  pagination?: ServerPaginationResult<Project>; // Optional pagination prop
  variant?: 'full' | 'simple'; // Add variant prop
}

const ITEMS_PER_PAGE = 5;

// Check if rich text is enabled for this category
const isRichTextEnabled = (category?: string) => 
  category === 'locally_funded' || 
  category === 'internationally_funded' || 
  category === 'rd_projects' || 
  category === 'community_transformation' || 
  category === 'technology_spinoffs' || 
  category === 'thesis_support';

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  title,
  subtitle,
  pagination,
  variant = 'full',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeGalleryImages, setActiveGalleryImages] = useState<string[]>([]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - galleryRef.current.offsetLeft);
    setScrollLeft(galleryRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    galleryRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const scrollRef = useScrollToTop([pagination?.currentPage || currentPage]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
    imageUrl?: string,
    isFromGallery: boolean = false
  ) => {
    e.stopPropagation();
    setSelectedProject(project);
    
    const clickedImage = imageUrl || project.imageUrl || '';
    
    if (isFromGallery && project.images && project.images.length > 0) {
      // Show full gallery when clicking from gallery section
      setActiveGalleryImages(project.images);
      const idx = project.images.indexOf(clickedImage);
      setGalleryIndex(idx !== -1 ? idx : 0);
    } else {
      // Show ONLY the clicked image (cover or single image)
      setActiveGalleryImages([clickedImage]);
      setGalleryIndex(0);
    }
    
    setIsGalleryOpen(true);
  };

  const handleCloseModal = () => {
    setIsGalleryOpen(false);
    setSelectedProject(null);
    setActiveGalleryImages([]);
  };

  return (
    <div className={variant === 'full' ? "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" : ""}>
      {/* Scroll anchor point */}
      {variant === 'full' && <div ref={scrollRef} className="absolute top-0 left-0" />}
      
      {variant === 'full' && (
        <PageHeaderTheme
          theme="transparent"
          scrollThreshold={700}
        />
      )}

      {/* Hero Section - Match Home Page Style */}
      {variant === 'full' && title && (
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
      )}

      {/* Content Section */}
      <div className={variant === 'full' ? "py-12" : "py-0"}>
        <div className={variant === 'full' ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" : ""}>
          {/* Keyed container for React re-mounting */}
          <div key={pagination?.currentPage || currentPage}>
            <div className="space-y-6">
              {currentProjects.map((project) => {
                const isExpanded = expandedId === project.id;
                const coverImage =
                  project.imageUrl ||
                  "/images/logos/placeholder.png";
                const displayImages =
                  project.images && project.images.length > 0
                    ? project.images
                    : project.imageUrl
                      ? [project.imageUrl]
                      : [];

                return (
                  <div
                    key={project.id}
                    className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50"
                  >
                    
                    {/* Collapsed View - Title with Image */}
                    <div className="flex flex-col md:flex-row gap-4 p-6">
                      {/* Image - Clickable */}
                      <div className="md:w-64 flex-shrink-0">
                        <button
                          onClick={(e) =>
                            handleImageClick(project, e, coverImage, false)
                          }
                          className="relative group overflow-hidden rounded-xl sm:rounded-2xl w-full aspect-video md:aspect-square"
                        >
                          <ImageWithFallback
                            src={coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
                            <div className="flex items-start justify-between gap-2">
                              <h3 className={`text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#1887FC] transition-colors leading-tight ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {project.title}
                              </h3>
                              {isExpanded ? (
                                <ChevronUp className="w-6 h-6 flex-shrink-0 mt-1" />
                              ) : (
                                <ChevronDown className="w-6 h-6 flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </button>
                          {!isExpanded && project.description && (
                            <div className="text-gray-600 mt-3 line-clamp-2 whitespace-pre-line">
                              <RichTextContent text={project.description} enabled={isRichTextEnabled(project.category)} />
                            </div>
                          )}
                        </div>
                        {!isExpanded && (
                          <button
                            onClick={() =>
                              toggleExpand(project.id)
                            }
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-4 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full md:w-fit"
                          >
                            <span>View Details</span>
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded View - Full Details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-6">
                        {/* Description */}
                        {project.description && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Project Overview
                            </h4>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              <RichTextContent text={project.description} enabled={isRichTextEnabled(project.category)} />
                            </div>
                          </div>
                        )}

                        {/* Project Context */}
                        {project.context && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Project Context
                            </h4>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              <RichTextContent text={project.context} enabled={isRichTextEnabled(project.category)} />
                            </div>
                          </div>
                        )}

                        {/* Objectives */}
                        {project.objectives && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Objectives
                            </h4>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              <RichTextContent text={project.objectives} enabled={isRichTextEnabled(project.category)} />
                            </div>
                          </div>
                        )}

                        {/* Methodology and Activities */}
                        {project.methodology && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-2">
                              Methodology and Activities
                            </h4>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                              <RichTextContent text={project.methodology} enabled={isRichTextEnabled(project.category)} />
                            </div>
                          </div>
                        )}

                        {/* Image Gallery (if multiple images) - Horizontal Swipeable */}
                        {displayImages.length > 1 && (
                          <div>
                            <h4 className="text-lg font-semibold text-[#1887FC] mb-4">
                              Project Gallery
                            </h4>
                            {/* Horizontal scrollable gallery with snap */}
                            <div 
                              ref={galleryRef}
                              className={`flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 sm:-mx-0 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                              onMouseDown={handleMouseDown}
                              onMouseMove={handleMouseMove}
                              onMouseUp={handleMouseUp}
                              onMouseLeave={handleMouseLeave}
                            >
                              {displayImages.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) =>
                                    handleImageClick(project, e, img, true)
                                  }
                                  className="relative group overflow-hidden rounded-2xl sm:rounded-3xl flex-shrink-0 snap-start first:ml-6 last:mr-6 sm:first:ml-0 sm:last:mr-0"
                                  style={{ width: 'calc(100vw - 3rem)', maxWidth: '360px', height: '260px' }}
                                >
                                  <ImageWithFallback
                                    src={
                                      img ||
                                      "/images/logos/placeholder.png"
                                    }
                                    alt={`${project.title} - Image ${idx + 1}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                  {/* Image counter badge */}
                                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm font-semibold rounded-full backdrop-blur-sm min-w-[3rem] text-center">
                                    {idx + 1}/{displayImages.length}
                                  </div>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Swipe to see more photos • Click to view full size
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 w-full md:w-fit"
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

      {/* Gallery Modal */}
      {selectedProject && (
        <GalleryModal
          images={activeGalleryImages.length > 0 ? activeGalleryImages : ["/images/logos/placeholder.png"]}
          isOpen={isGalleryOpen}
          onClose={handleCloseModal}
          title={selectedProject.title}
          initialIndex={galleryIndex}
        />
      )}
    </div>
  );
};