import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, Calendar, GraduationCap, ChevronDown, ChevronUp, Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useContent, InternshipTestimonial } from '@/app/context/ContentContext';
import { Dialog, DialogPortal, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import useEmblaCarousel from 'embla-carousel-react';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Pagination } from '@/app/components/Pagination';
import { Users } from 'lucide-react';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';

const ITEMS_PER_PAGE = 3;

export const InternshipProgramPage: React.FC = () => {
  const { content, loadingStates, fetchInternshipPrograms, fetchInternshipTestimonials } = useContent();
  const [pageLoading, setPageLoading] = useState(true);

  // State for pagination per year: { [year]: currentPage }
  const [yearPages, setYearPages] = useState<{ [key: string]: number }>({});

  // State for expanded years
  const [expandedYears, setExpandedYears] = useState<{ [key: string]: boolean }>({});

  // Image carousel modal
  const [selectedTestimonial, setSelectedTestimonial] = useState<InternshipTestimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Fetch data when component mounts
  useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchInternshipPrograms(),
          fetchInternshipTestimonials(),
        ]);
      } catch (error) {
        console.error('[InternshipProgramPage] Error fetching page data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    loadPageData();
  }, []);
  
  // Group testimonials by year
  const groupedByYear = content.internshipTestimonials.reduce((acc, testimonial) => {
    if (!acc[testimonial.year]) {
      acc[testimonial.year] = [];
    }
    acc[testimonial.year].push(testimonial);
    return acc;
  }, {} as Record<string, typeof content.internshipTestimonials>);

  // Sort years in descending order
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  // Update expanded years when data is loaded (only once)
  React.useEffect(() => {
    if (sortedYears.length > 0 && Object.keys(expandedYears).length === 0) {
      setExpandedYears({ [sortedYears[0]]: true });
    }
  }, [sortedYears.length]);

  // Show loading state
  if (pageLoading || loadingStates.internshipPrograms || loadingStates.internshipTestimonials) {
    return <PageSkeletonLoader message="Loading Internship Program..." />;
  }

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const handleYearPageChange = (year: string, page: number) => {
    setYearPages(prev => ({ ...prev, [year]: page }));
  };

  const handleImageClick = (testimonial: InternshipTestimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <PageHeaderTheme theme="transparent" scrollThreshold={700} />
      
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
                animation: 'gradientShift 10s ease-in-out infinite alternate'
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
                  ease: "linear"
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
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)',
              }}
            >
              Real stories, real growth
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Inspiring testimonials from our internship program participants
            </motion.p>
          </div>
        </section>
      </SectionTheme>

      {/* Internship Program Information Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 md:p-12 border border-blue-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#1887FC] rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#1887FC]">Internship Program</h2>
            </div>
            
            {/* Status Alert */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Current Status
              </h3>
              <p className="text-amber-800 mb-4 font-medium">
                All internship slots for the current cycle have been filled.
              </p>
              <p className="text-amber-700 leading-relaxed">
                Thank you for your interest in our program. Stay tuned for announcements regarding the next 
                application cycle. We look forward to welcoming new applicants soon!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Year Groups */}
          {sortedYears.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-[#1887FC]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                No testimonials yet
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Testimonials from our internship program participants will be displayed here. Check back soon for inspiring stories!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedYears.map((year, groupIndex) => {
                const yearTestimonials = groupedByYear[year];
                const currentPage = yearPages[year] || 1;
                const totalPages = Math.ceil(yearTestimonials.length / ITEMS_PER_PAGE);
                
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const currentTestimonials = yearTestimonials.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                return (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    {/* Year Header - Clickable */}
                    <button
                      onClick={() => toggleYear(year)}
                      className="w-full bg-gradient-to-r from-[#1887FC] to-blue-600 px-8 py-6 flex items-center justify-between hover:from-[#1570d8] hover:to-[#3d8ae6] transition-all"
                    >
                      <h2 className="text-3xl font-bold text-white">{year}</h2>
                      <div className="flex items-center gap-4">
                        <span className="text-white/90 text-sm">
                          {yearTestimonials.length} {yearTestimonials.length === 1 ? 'testimonial' : 'testimonials'}
                        </span>
                        {expandedYears[year] ? (
                          <ChevronUp className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </button>

                    {/* Testimonials - Expandable */}
                    {expandedYears[year] && (
                      <div key={currentPage} className="p-8 space-y-8">
                        {currentTestimonials.map((testimonial, index) => (
                          <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100"
                          >
                            {/* Quote */}
                            <div className="flex items-start gap-4 mb-4">
                              <Quote className="w-6 h-6 text-[#1887FC] flex-shrink-0 mt-1" />
                              <p className="text-lg md:text-xl font-medium text-gray-900 italic">
                                {testimonial.quote}
                              </p>
                            </div>

                            {/* Author Info */}
                            <div className="mb-4 flex items-center gap-2 text-[#1887FC] ml-10">
                              <span className="font-semibold">— {testimonial.name}</span>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-4 h-4" />
                                <span>{testimonial.degree}, {testimonial.institution}</span>
                              </div>
                            </div>

                            {/* Full Story */}
                            <div className="ml-10 border-l-4 border-[#1887FC] pl-6">
                              <p className="text-gray-700 leading-relaxed mb-4">
                                {testimonial.fullText}
                              </p>
                              
                              <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Published on {testimonial.publishedDate}</span>
                              </div>
                            </div>

                            {/* Images Gallery */}
                            {testimonial.images && testimonial.images.length > 0 && (
                              <div className="mt-6 ml-10">
                                <div className="flex items-center gap-2 mb-3">
                                  <ImageIcon className="w-5 h-5 text-[#1887FC]" />
                                  <h4 className="font-semibold text-gray-800">
                                    Internship Memories ({testimonial.images.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                  {testimonial.images.map((image, imgIndex) => (
                                    <button
                                      key={imgIndex}
                                      onClick={() => handleImageClick(testimonial)}
                                      className="relative group overflow-hidden rounded-lg border-2 border-blue-200 hover:border-[#1887FC] transition-all aspect-square"
                                    >
                                      <ImageWithFallback
                                        src={image}
                                        alt={`${testimonial.name} - Photo ${imgIndex + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-full p-2">
                                          <ImageIcon className="w-5 h-5 text-[#1887FC]" />
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 italic">
                                  Click on any photo to view in slideshow
                                </p>
                              </div>
                            )}
                          </motion.div>
                        ))}

                        {totalPages > 1 && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => handleYearPageChange(year, page)}
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={yearTestimonials.length}
                          />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-[#1887FC] to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              Join Our Internship Program
            </h2>
            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Gain hands-on experience in agricultural research, community development, 
              and sustainable solutions while working with experienced researchers.
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-[#1887FC] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Apply Now
            </a>
          </motion.div>
        </div>
      </div>

      {/* Image Carousel Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        {selectedTestimonial && (() => {
          const imagesToShow = selectedTestimonial.images && selectedTestimonial.images.length > 0
            ? selectedTestimonial.images
            : [];
          const hasMultipleImages = imagesToShow.length > 1;

          return (
            <>
              {/* Custom Blurred Overlay */}
              <DialogPortal>
                <DialogPrimitive.Overlay asChild>
                  <div className="fixed inset-0 z-50 bg-black">
                    {/* Blurred Background Image - Full Coverage */}
                    {imagesToShow.length > 0 && (
                      <div className="absolute inset-0 overflow-hidden">
                        <ImageWithFallback
                          src={imagesToShow[selectedIndex] || imagesToShow[0]}
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
                      {selectedTestimonial ? `${selectedTestimonial.name} - Internship Photos` : 'Internship Photos'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      {selectedTestimonial
                        ? `View internship photos from ${selectedTestimonial.name}`
                        : 'View internship photos'}
                    </DialogDescription>

                    {/* Image Section */}
                    {imagesToShow.length === 0 ? (
                      <div className="relative h-full flex items-center justify-center">
                        <p className="text-white/70">No images available</p>
                      </div>
                    ) : (
                      <>
                        {/* Carousel */}
                        <div className="relative overflow-hidden h-full" ref={emblaRef}>
                          <div className="flex h-full">
                            {imagesToShow.map((imageUrl, index) => (
                              <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                                <div className="relative w-full h-full flex items-center justify-center p-8">
                                  <ImageWithFallback
                                    src={imageUrl}
                                    alt={`${selectedTestimonial.name} - Photo ${index + 1}`}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Navigation Buttons */}
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={scrollPrev}
                              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors backdrop-blur-sm shadow-lg"
                            >
                              <ChevronLeft className="w-7 h-7" />
                            </button>
                            <button
                              onClick={scrollNext}
                              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors backdrop-blur-sm shadow-lg"
                            >
                              <ChevronRight className="w-7 h-7" />
                            </button>
                          </>
                        )}

                        {/* Image Counter - Small and subtle */}
                        {hasMultipleImages && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/10 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm font-medium">
                            {imagesToShow.length} photos
                          </div>
                        )}
                      </>
                    )}

                    {/* Close Button */}
                    <DialogPrimitive.Close className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 opacity-70 transition-all duration-200 hover:opacity-100 z-50">
                      <X className="text-gray-700 w-5 h-5" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  </div>
                </DialogPrimitive.Content>
              </DialogPortal>
            </>
          );
        })()}
      </Dialog>
    </div>
  );
};