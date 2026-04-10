/**
 * Home Page Partners Section
 *
 * Displays partner organizations' logos.
 */

import { useContent } from '@/app/context/ContentContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { motion } from 'motion/react';

/**
 * Partners section component
 *
 * Features:
 * - Logo grid display
 * - Responsive layout
 * - Grayscale filter with hover effect
 * - Proper aspect ratio maintenance
 * - Mobile-optimized spacing and sizing
 */
export function PartnersSection() {
  const { content } = useContent();

  if (content.partners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Our Partners
          </h2>
          <div className="w-20 h-1.5 bg-blue-500/20 rounded-full mx-auto mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500 w-1/2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Collaborating with leading organizations to maximize research impact
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {content.partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: Math.min(index * 0.05, 0.4),
                ease: "easeOut"
              }}
              viewport={{ once: true, margin: "-20px" }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 cursor-pointer overflow-hidden"
            >
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#60a5fa] z-10" />
              
              {/* Subtle background pattern/glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/40 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className="relative w-full aspect-[4/3] flex items-center justify-center mb-3 sm:mb-4">
                <ImageWithFallback
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-w-[85%] max-h-[80%] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 ease-in-out transform group-hover:scale-105"
                  title={partner.name}
                  loading="lazy"
                />
              </div>

              <div className="relative w-full text-center">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[2.5rem] flex items-center justify-center px-1">
                  {partner.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}