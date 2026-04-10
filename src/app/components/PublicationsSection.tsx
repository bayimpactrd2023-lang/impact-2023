import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react'; // Changed to motion/react
import { useContent } from '@/app/context/ContentContext';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Publication } from '@/app/context/ContentContext';
import { useNavigate } from 'react-router';
import { PublicationDetailModal } from '@/app/components/PublicationDetailModal';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const PublicationsSection: React.FC = React.memo(() => {
  const { content } = useContent();
  const navigate = useNavigate();
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReadPublication = useCallback((publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  }, []);

  // Memoize featured publications filter
  const featuredPublications = useMemo(() => 
    content.publications
      .filter(pub => pub.featured === true)
      .slice(0, 3),
    [content.publications]
  );

  return (
    <section id="publications" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
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
            
            <h2 className="relative text-4xl sm:text-5xl font-bold mb-4"
              style={{
                color: 'white',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              New Publications
            </h2>
          </motion.div>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto mb-3 sm:mb-4 md:mb-5 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredPublications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100/50 mx-0 sm:mx-0 cursor-pointer"
              onClick={() => handleReadPublication(publication)}
            >
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#60a5fa] z-10" />
              
              {/* Publication Image/Book Cover */}
              <div className="relative h-64 sm:h-56 overflow-hidden">
                {publication.imageUrl ? (
                  <ImageWithFallback
                    src={publication.imageUrl}
                    alt={publication.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <BookOpen className="w-16 h-16 text-[#1887FC]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Publication Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {publication.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                  By {publication.authors}
                </p>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadPublication(publication);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:scale-105"
                >
                  <span>Learn More</span>
                  <ExternalLink className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Publications Button */}
        {content.publications.length > 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => navigate('/publications')}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-5 bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#60a5fa] text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl hover:shadow-blue-500/50 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-3">
                View All Publications
                <span className="inline-block group-hover:translate-x-2 transition-transform text-2xl">→</span>
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>

      <PublicationDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        publication={selectedPublication}
      />
    </section>
  );
});