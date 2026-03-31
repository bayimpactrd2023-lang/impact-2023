import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
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

          <div className="grid grid-cols-1 gap-8">
            {content.newsItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-[#1887FC]">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <CardTitle className="text-2xl text-gray-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {item.content}
                    </CardDescription>
                    <button 
                      onClick={() => handleReadMore(item)}
                      className="mt-4 inline-flex items-center gap-2 text-[#1887FC] font-medium hover:gap-3 transition-all"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </button>
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