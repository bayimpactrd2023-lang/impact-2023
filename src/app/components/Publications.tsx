import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { PublicationModal } from '@/app/components/PublicationModal';
import { Publication } from '@/app/context/ContentContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export const Publications: React.FC = () => {
  const { content } = useContent();
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewPublication = (pub: Publication) => {
    setSelectedPublication(pub);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="publications" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
              Recent Publications
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto mb-6" />
            <p className="text-lg text-gray-600">
              Findings From Our Latest Studies
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.publications.map((pub, index) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer" onClick={() => handleViewPublication(pub)}>
                  {pub.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <ImageWithFallback 
                        src={pub.imageUrl} 
                        alt={pub.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{pub.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pub.authors}</p>
                    <button
                      className="inline-flex items-center gap-2 text-[#1887FC] font-medium hover:text-[#0b5ab8] transition-colors"
                    >
                      View Publication <ExternalLink className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        publication={selectedPublication}
      />
    </>
  );
};