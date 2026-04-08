import React, { useMemo, useState } from 'react';
import { Project } from '@/app/context/ContentContext';
import { Card, CardContent } from '@/app/components/ui/card';
import { FileText, X } from 'lucide-react';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { motion } from 'motion/react';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Pagination } from '@/app/components/Pagination';
import { GalleryModal } from './GalleryModal';
import { Dialog, DialogPortal, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface ProjectGridProps {
  projects: Project[];
  title: string;
  subtitle?: string;
}

const ITEMS_PER_PAGE = 6;

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, title, subtitle }) => {
  const [selectedFinding, setSelectedFinding] = React.useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const currentProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return projects.slice(start, start + ITEMS_PER_PAGE);
  }, [projects, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (project: Project) => {
    setSelectedFinding(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFinding(null), 300);
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
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto"
                style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
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
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-[#1887FC]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                No items yet
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                No items have been added to this section yet. Check back later for updates!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer transform hover:-translate-y-1" 
                    onClick={() => handleCardClick(project)}
                  >
                    {project.imageUrl ? (
                      <div className="w-full h-48 overflow-hidden shrink-0">
                        <ImageWithFallback
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center shrink-0">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <CardContent className="p-6 flex-grow">
                      <div className="text-sm text-[#1887FC] font-semibold mb-2">
                        {project.date ? new Date(project.date).toLocaleDateString() : 'Ongoing'}
                      </div>
                      <h3 className="text-xl font-bold text-[#1887FC] mb-2">{project.title}</h3>
                      <p className="text-gray-600 line-clamp-3 text-justify">{project.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={projects.length}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal Section */}
      {isModalOpen && selectedFinding && (
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogPortal>
            <DialogPrimitive.Overlay asChild>
              <div className="fixed inset-0 z-50 bg-black">
                {/* Blurred Background Image - Full Coverage */}
                {selectedFinding.imageUrl && (
                  <div className="absolute inset-0 overflow-hidden">
                    <ImageWithFallback
                      src={selectedFinding.imageUrl}
                      alt=""
                      className="w-full h-full object-cover blur-2xl scale-110"
                    />
                    {/* Dark overlay for better contrast */}
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                )}
              </div>
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center outline-none">
              <div className="relative w-full h-full">
                {/* Accessibility - Hidden title and description */}
                <DialogTitle className="sr-only">
                  {selectedFinding.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View image from {selectedFinding.title}
                </DialogDescription>

                {/* Image Section */}
                {selectedFinding.imageUrl ? (
                  <div className="relative h-full flex items-center justify-center p-8">
                    <ImageWithFallback
                      src={selectedFinding.imageUrl}
                      alt={selectedFinding.title}
                      className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setGalleryIndex(0);
                        setIsGalleryOpen(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative h-full flex items-center justify-center">
                    <p className="text-white/70 text-lg">No image available</p>
                  </div>
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
            images={selectedFinding.images && selectedFinding.images.length > 0 ? selectedFinding.images : ([selectedFinding.imageUrl].filter(Boolean) as string[])}
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            title={selectedFinding.title}
            initialIndex={galleryIndex}
          />
        </Dialog>
      )}
    </div>
  );
};