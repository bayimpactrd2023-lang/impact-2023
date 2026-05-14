import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Calendar, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Card, CardContent, CardDescription } from '@/app/components/ui/card';
import { NewsModal } from '@/app/components/NewsModal';
import { NewsItem } from '@/app/context/ContentContext';

export const News: React.FC = () => {
  const { content } = useContent();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleReadMore = (item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="news" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
              News & Updates
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.newsItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 h-full flex flex-col group cursor-pointer border-none shadow-md overflow-hidden" onClick={() => handleReadMore(item)}>
                  {item.imageUrl ? (
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 sm:h-56 bg-gray-100 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1887FC] mb-3 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1887FC] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <CardDescription className="text-gray-600 line-clamp-3 mb-4 text-justify flex-grow">
                      {item.content}
                    </CardDescription>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1887FC] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read Full Story <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <NewsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newsItem={selectedNews}
      />
    </>
  );
};