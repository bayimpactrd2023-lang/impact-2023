import * as React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Highlight } from '@/app/context/ContentContext';
import { ArrowRight } from 'lucide-react';
import { HighlightDetailModal } from '@/app/components/HighlightDetailModal';
import { PublicationDetailModal } from '@/app/components/PublicationDetailModal';
import { RichTextContent } from '@/app/components/RichTextContent';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Publication } from '@/app/context/ContentContext';

/**
 * FeaturedHighlightsSection - Shows only featured highlights on the home page
 * Displays 4 featured highlights in a 3-column layout (similar to publications)
 */
export const FeaturedHighlightsSection: React.FC = React.memo(() => {
  const { content } = useContent();
  const navigate = useNavigate();
  const [selectedHighlight, setSelectedHighlight] = React.useState<Highlight | null>(null);
  const [selectedPublication, setSelectedPublication] = React.useState<Publication | null>(null);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = React.useState(false);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = React.useState(false);

  // Memoize filtered highlights
  const featuredHighlights = React.useMemo(() => {
    if (!content.highlights || content.highlights.length === 0) return [];
    return content.highlights
      .filter(highlight => highlight.featured === true)
      .slice(0, 4);
  }, [content.highlights]);

  // Memoize featured publications
  const featuredPublications = React.useMemo(() => {
    if (!content.publications || content.publications.length === 0) return [];
    return content.publications
      .filter(pub => pub.featured === true)
      .slice(0, 3);
  }, [content.publications]);

  const handleHighlightClick = React.useCallback((highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setIsHighlightModalOpen(true);
  }, []);

  const handlePublicationClick = React.useCallback((publication: Publication) => {
    setSelectedPublication(publication);
    setIsPublicationModalOpen(true);
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
              Discover our key achievements, ongoing initiatives, and latest scientific contributions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Render Highlights First */}
            {featuredHighlights.map((highlight, index) => {
              return (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 mx-0 sm:mx-0 cursor-pointer flex flex-col h-full group"
                  onClick={() => handleHighlightClick(highlight)}
                >
                  {/* Highlight Image */}
                  <div className="relative aspect-video flex items-center justify-center bg-[#f8fafc] rounded-t-2xl sm:rounded-t-3xl overflow-hidden shrink-0 group/img">
                    <ImageWithFallback
                      src={highlight.imageUrl || '/images/logos/placeholder.png'}
                      alt={highlight.title}
                      className={`w-full h-full transition-transform duration-700 group-hover/img:scale-105 ${!highlight.imageUrl ? 'p-8 object-contain' : 'object-cover'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-[#1887FC] text-white text-xs font-bold rounded-full shadow-lg z-20">
                      Highlight
                    </div>
                  </div>

                  {/* Highlight Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#1887FC] transition-colors">
                      {highlight.title}
                    </h3>
                    <div className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                      <RichTextContent text={highlight.description} className="text-sm sm:text-base line-clamp-3" />
                    </div>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-200"
                    >
                      <span>Learn More</span>
                      <ExternalLink className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}

            {/* Render Publications */}
            {featuredPublications.map((publication, index) => (
              <motion.div
                key={publication.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (featuredHighlights.length + index) * 0.1 }}
                viewport={{ once: true }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 mx-0 sm:mx-0 cursor-pointer flex flex-col h-full group"
                onClick={() => handlePublicationClick(publication)}
              >
                {/* Publication Image */}
                <div className="relative aspect-video flex items-center justify-center bg-[#f8fafc] rounded-t-2xl sm:rounded-t-3xl overflow-hidden shrink-0 group/img">
                  {publication.imageUrl ? (
                    <ImageWithFallback
                      src={publication.imageUrl}
                      alt={publication.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <BookOpen className="w-16 h-16 text-[#1887FC] opacity-40 group-hover/img:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-[#1887FC] text-white text-xs font-bold rounded-full shadow-lg z-20">
                    Publication
                  </div>
                </div>

                {/* Publication Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#1887FC] transition-colors">
                    {publication.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 line-clamp-1 italic mb-4">
                    {publication.authors}
                  </p>
                  
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-200"
                  >
                    <span>Learn More</span>
                    <ExternalLink className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {/* View All Highlights Button */}
            {content.highlights.length > 4 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                onClick={() => navigate('/highlights')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span>View All Highlights</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}

            {/* View All Publications Button */}
            {content.publications.length > 3 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                onClick={() => navigate('/publications')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span>View All Publications</span>
                <ExternalLink className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Highlight Detail Modal */}
      <HighlightDetailModal
        highlight={selectedHighlight}
        isOpen={isHighlightModalOpen}
        onClose={() => setIsHighlightModalOpen(false)}
      />

      {/* Publication Detail Modal */}
      <PublicationDetailModal
        isOpen={isPublicationModalOpen}
        onClose={() => setIsPublicationModalOpen(false)}
        publication={selectedPublication}
      />
    </>
  );
});