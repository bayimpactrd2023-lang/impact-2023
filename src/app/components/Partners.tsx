import React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const Partners: React.FC = () => {
  const { content } = useContent();

  return (
    <section id="partners" className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
            Our Partners
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {content.partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
            >
              <div className="h-16 w-full flex items-center justify-center mb-3">
                <ImageWithFallback
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain transition-all"
                />
              </div>
              <p className="text-sm text-gray-700 text-center font-medium">{partner.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};