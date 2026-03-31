import React from 'react';
import { motion } from 'motion/react';
import { Satellite, Sprout, BarChart3, Globe } from 'lucide-react';
import { useContent } from '@/app/context/ContentContext';
import { getImageUrl } from '@/utils/r2Upload';

export const Highlights: React.FC = () => {
  const { content } = useContent();

  // Map icon names to components
  const iconMap: Record<string, React.ElementType> = {
    Satellite,
    Sprout,
    BarChart3,
    Globe,
  };

  return (
    <section id="highlights" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
            Our Work Highlights
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pioneering research and development projects that create lasting impact across the Philippines
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.highlights.map((highlight, index) => {
            const Icon = iconMap[highlight.iconName] || Globe;
            
            return (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-64 overflow-hidden">
                  {highlight.imageUrl ? (
                    <>
                      <img
                        src={getImageUrl(highlight.imageUrl)}
                        alt={highlight.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.classList.add('bg-gradient-to-br', 'from-[#1887FC]', 'to-[#0b5ab8]'); 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] flex items-center justify-center">
                      <Icon className="w-20 h-20 text-white/40" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] rounded-lg mb-2">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{highlight.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};