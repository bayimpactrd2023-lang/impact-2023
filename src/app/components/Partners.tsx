import React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const Partners: React.FC = () => {
  const { content } = useContent();

  return (
    <section id="partners" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50/50 to-blue-100/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            Our Partners
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {content.partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
              viewport={{ once: true, margin: "-30px" }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer select-none"
            >
              <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-full flex items-center justify-center mb-2 sm:mb-3">
                <ImageWithFallback
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 text-center font-medium line-clamp-2 px-1">{partner.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};