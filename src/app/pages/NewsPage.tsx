import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useContent } from '@/app/context/ContentContext';
import { NewsModal } from '@/app/components/NewsModal';
import { NewsItem } from '@/app/context/ContentContext';
import { RichTextContent } from '@/app/components/RichTextContent';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export const NewsPage: React.FC = () => {
  const { content } = useContent();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReadMore = (item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
        <PageHeaderTheme theme="transparent" scrollThreshold={700} />
        
        {/* Hero Section - Match Home Page Style */}
        <SectionTheme theme="transparent">
          <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
            {/* High-Quality Background Image with Overlay */}
            <div className="absolute inset-0">
              {/* Agricultural Research Image */}
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
                alt="Agricultural Research"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Modern Gradient Overlay - Instagram-style */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />
              
              {/* Animated Gradient Accent */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 50%, rgba(24,135,252,0.3) 0%, transparent 50%),
                    radial-gradient(circle at 70% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)
                  `,
                  animation: 'gradientShift 10s ease-in-out infinite alternate'
                }}
              />
              
              {/* Floating Particles */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: 0,
                  }}
                  animate={{
                    y: [0, -800],
                    x: [0, (Math.random() - 0.5) * 200],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 15 + Math.random() * 10,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear"
                  }}
                />
              ))}
              
              {/* Futuristic Grid Overlay */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }}
              />
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                  className="text-4xl sm:text-6xl font-bold text-white mb-6"
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)',
                  }}
                >
                  News & Updates
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
                  style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  Stay informed about our latest research, achievements, and community initiatives
                </motion.p>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <div className="w-6 h-10 border-2 border-[#1887FC] rounded-full flex justify-center backdrop-blur-sm bg-white/20">
                <motion.div 
                  className="w-1 h-3 bg-[#1887FC] rounded-full mt-2"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </section>
        </SectionTheme>

        {/* News Grid */}
        <SectionTheme theme="light">
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {content.newsItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full flex flex-col hover:shadow-2xl transition-all cursor-pointer group"
                    onClick={() => handleReadMore(item)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 left-2 flex items-center gap-2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl group-hover:text-[#1887FC] transition-colors">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <CardDescription className="flex-grow mb-4 line-clamp-3 text-sm sm:text-base">
                        <RichTextContent text={item.content} className="text-sm sm:text-base line-clamp-3" />
                      </CardDescription>
                      <button 
                        onClick={() => handleReadMore(item)}
                        className="mt-auto inline-flex items-center gap-2 text-[#1887FC] font-medium hover:gap-3 transition-all"
                      >
                        Read More <ArrowRight className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </SectionTheme>

        {/* Featured Story Section */}
        {content.newsItems.length > 0 && (
          <SectionTheme theme="light">
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Story</h2>
                  <Card className="overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-auto">
                        <ImageWithFallback 
                          src="https://images.unsplash.com/photo-1754776403499-52e7acdd45a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200"
                          alt="Featured Story"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(content.newsItems[0].date)}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {content.newsItems[0].title}
                        </h3>
                        <div className="text-gray-700 leading-relaxed mb-6 line-clamp-4">
                          <RichTextContent text={content.newsItems[0].content} className="line-clamp-4" />
                        </div>
                        <button 
                          onClick={() => handleReadMore(content.newsItems[0])}
                          className="inline-flex items-center gap-2 text-[#1887FC] font-medium hover:gap-3 transition-all"
                        >
                          Read Full Story <ArrowRight className="w-4 h-4" />
                        </button>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </section>
          </SectionTheme>
        )}
      </div>

      <NewsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newsItem={selectedNews}
      />
    </>
  );
};