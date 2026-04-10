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
    <section className="py-12 sm:py-14 md:py-16 bg-gray-50/80">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Our Partners</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Collaborating with leading organizations to drive impact
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {content.partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
              viewport={{ once: true, margin: "-30px" }}
              whileHover={{ y: -4 }}
              className="flex items-center justify-center p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer select-none group"
            >
              <div className="w-full h-20 sm:h-24 md:h-28 lg:h-32 flex flex-col items-center justify-center">
                <ImageWithFallback
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-w-full max-h-16 sm:max-h-20 md:max-h-24 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  title={partner.name}
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}