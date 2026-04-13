import * as React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Highlight } from '@/app/context/ContentContext';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { HighlightDetailModal } from '@/app/components/HighlightDetailModal';
import { RichTextContent } from '@/app/components/RichTextContent';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

/**
 * FeaturedHighlightsSection - Shows only featured highlights on the home page
 * Displays 4 featured highlights in a 3-column layout (similar to publications)
 */
export const FeaturedHighlightsSection: React.FC = React.memo(() => {
  const { content } = useContent();
  const navigate = useNavigate();
  const [selectedHighlight, setSelectedHighlight] = React.useState<Highlight | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Memoize filtered highlights
  const featuredHighlights = React.useMemo(() => 
    content.highlights
      .filter(highlight => highlight.featured === true)
      .slice(0, 4),
    [content.highlights]
  );

  const handleHighlightClick = React.useCallback((highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setIsModalOpen(true);
  }, []);

  const getIcon = React.useCallback((iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Star;
    return Icon;
  }, []);

  return (
    <>
      <section className="py-12 sm:py-14 md:py-16 lg:py-20 relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(24, 135, 252, 0.08) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block relative"
            >
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1887FC]/5 via-blue-50/50 to-[#3b82f6]/5 blur-2xl rounded-full transform scale-150" />
              
              <h2 className="relative text-4xl sm:text-5xl font-bold mb-4 text-[#1887FC]"
                style={{
                  letterSpacing: '-0.02em'
                }}
              >
                Our Highlights
              </h2>
            </motion.div>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto mb-3 sm:mb-4 md:mb-5 rounded-full" />
            <p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto">
              Discover our key achievements and ongoing initiatives that drive impact across the Philippines
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredHighlights.map((highlight, index) => {
              const Icon = getIcon(highlight.iconName);
              
              return (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 mx-0 sm:mx-0 cursor-pointer"
                  onClick={() => handleHighlightClick(highlight)}
                >
                  
                  {/* Highlight Image */}
                  <div className="relative h-64 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {highlight.imageUrl ? (
                      <ImageWithFallback
                        src={highlight.imageUrl}
                        alt={highlight.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1887FC] via-[#3b82f6] to-[#60a5fa]">
                        <Icon className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Highlight Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                      {highlight.title}
                    </h3>
                    <div className="text-gray-600 mb-4 line-clamp-3">
                      <RichTextContent text={highlight.description} className="text-sm sm:text-base line-clamp-3" />
                    </div>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHighlightClick(highlight);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:scale-105"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All Button */}
          {content.highlights.length > 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <button
                onClick={() => navigate('/highlights')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span>View All Highlights</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
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
});