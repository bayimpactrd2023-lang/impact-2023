import * as React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Highlight } from '@/app/context/ContentContext';
import * as Icons from 'lucide-react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { HighlightDetailModal } from '@/app/components/HighlightDetailModal';
import { Button } from '@/app/components/ui/button';
import { getImageUrl } from '@/utils/r2Upload';

const ITEMS_PER_PAGE = 8;

export const HighlightsSection: React.FC = () => {
  const { content } = useContent();
  const [selectedHighlight, setSelectedHighlight] = React.useState<Highlight | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(content.highlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentHighlights = React.useMemo(() => {
    return content.highlights.slice(startIndex, endIndex);
  }, [content.highlights, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setIsModalOpen(true);
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Star;
    return Icon;
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Highlights
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto" />
            <p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto">
              Discover our key achievements and ongoing initiatives that drive impact across the Philippines
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentHighlights.map((highlight, index) => {
              const Icon = getIcon(highlight.iconName);
              
              return (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  onClick={() => handleHighlightClick(highlight)}
                  className="cursor-pointer group"
                >
                  <div className="card-instagram h-full flex flex-col bg-gradient-to-br from-[#1887FC] to-[#0b5ab8]">
                    {/* Highlight Image */}
                    <div className="relative h-48 sm:h-56 rounded-t-lg overflow-hidden">
                      {highlight.imageUrl ? (
                        <>
                          <img
                            src={getImageUrl(highlight.imageUrl)}
                            alt={highlight.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.classList.add('bg-gradient-to-br', 'from-[#1887FC]', 'to-[#0b5ab8]');
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] flex items-center justify-center">
                          <Icon className="w-16 h-16 text-white/40" />
                        </div>
                      )}
                      
                      {/* Icon Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-[#1887FC]" />
                        </div>
                      </div>
                    </div>

                    {/* Highlight Content */}
                    <div className="p-4 sm:p-6 flex-grow flex flex-col">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 line-clamp-2">
                        {highlight.title}
                      </h3>
                      <p className="text-sm sm:text-base text-white/90 leading-relaxed flex-grow line-clamp-3 mb-4">
                        {highlight.description}
                      </p>
                      
                      {/* Read More Button */}
                      <div className={`mt-auto flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="inline-flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all duration-300">
                          <span>Learn More</span>
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1887FC] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                  className={
                    currentPage === page
                      ? "bg-[#1887FC] hover:bg-[#0b5ab8] text-white"
                      : "hover:bg-[#1887FC]/10 hover:text-[#1887FC] transition-colors"
                  }
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1887FC] hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Results info */}
          {content.highlights.length > 0 && (
            <div className="text-center mt-6 text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, content.highlights.length)} of {content.highlights.length} highlights
            </div>
          )}
        </div>
      </section>

      {/* Highlight Detail Modal */}
      <HighlightDetailModal
        highlight={selectedHighlight}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};