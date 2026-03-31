import * as React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Highlight } from '@/app/context/ContentContext';
import * as Icons from 'lucide-react';
import { Star, ArrowRight } from 'lucide-react';
import { HighlightDetailModal } from '@/app/components/HighlightDetailModal';
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
    const Icon = (Icons as any)[iconName] || Star;
    return Icon;
  }, []);

  return (
    <>
      <section className="py-20 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 30%, rgba(255,255,255,1) 100%)'
        }}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHighlights.map((highlight, index) => {
              const Icon = getIcon(highlight.iconName);
              
              return (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="card-futuristic group cursor-pointer"
                  onClick={() => handleHighlightClick(highlight)}
                >
                  {/* Highlight Image */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-xl mb-5">
                    {highlight.imageUrl ? (
                      <ImageWithFallback
                        src={highlight.imageUrl}
                        alt={highlight.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1887FC] via-[#3b82f6] to-[#60a5fa]">
                        <Icon className="w-20 h-20 text-white transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 drop-shadow-2xl animate-float-slow" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {/* Floating badge for featured */}
                    <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 px-3 py-1.5 rounded-full shadow-lg border border-white/50">
                      <span className="text-xs font-bold text-[#1887FC]">★ FEATURED</span>
                    </div>
                  </div>

                  {/* Highlight Content */}
                  <div className="px-6 pb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#1887FC] transition-colors">
                      {highlight.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-5 line-clamp-3">
                      {highlight.description}
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHighlightClick(highlight);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
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