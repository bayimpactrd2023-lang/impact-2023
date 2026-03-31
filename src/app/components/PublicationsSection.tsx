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
    <section id="publications" className="py-24 relative overflow-hidden"
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
                background: 'linear-gradient(135deg, #1887FC 0%, #3b82f6 50%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              New Publications
            </h2>
          </motion.div>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto rounded-full shadow-lg" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPublications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="card-futuristic group cursor-pointer"
              onClick={() => handleReadPublication(publication)}
            >
              {/* Publication Image */}
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-xl mb-5">
                {publication.imageUrl ? (
                  <ImageWithFallback
                    src={publication.imageUrl}
                    alt={publication.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1887FC] via-[#3b82f6] to-[#60a5fa]">
                    <BookOpen className="w-20 h-20 text-white transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 drop-shadow-2xl animate-float-slow" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Floating badge for featured */}
                <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 px-3 py-1.5 rounded-full shadow-lg border border-white/50">
                  <span className="text-xs font-bold text-[#1887FC]">★ FEATURED</span>
                </div>
              </div>

              {/* Publication Content */}
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#1887FC] transition-colors">
                  {publication.title}
                </h3>
                <p className="text-sm text-gray-600 mb-5 font-medium">
                  {publication.authors}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadPublication(publication);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    <span>Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                  {publication.link && publication.link !== '#' && (
                    <motion.a
                      href={publication.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-[#1887FC] text-[#1887FC] rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </motion.a>
                  )}
                </div>
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