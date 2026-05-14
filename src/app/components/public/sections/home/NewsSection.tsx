/**
 * Home Page News Section
 * 
 * Displays latest news and updates.
 */

import React, { useState } from 'react';
import { useContent } from '@/app/context/ContentContext';
import { ContentCard } from '../../ui/ContentCard';
import { ContentGrid } from '../../ui/ContentGrid';
import { Button } from '@/app/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';

/**
 * News section component
 * 
 * Features:
 * - Latest 3 news items
 * - Card-based layout
 * - Link to full news page
 * - Date formatting
 */
export function NewsSection() {
  const { content } = useContent();
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState<any>(null);

  // Get latest 3 news items
  const latestNews = content.newsItems
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest News</h2>
            <p className="text-gray-600">Stay updated with our recent announcements</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/news')}
            className="hidden md:flex items-center gap-2"
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* News Grid */}
        <ContentGrid
          isEmpty={latestNews.length === 0}
          emptyMessage="No news available"
        >
          {latestNews.map(news => (
            <ContentCard
              key={news.id}
              title={news.title}
              description={news.content}
              imageUrl={news.imageUrl}
              onClick={() => setSelectedNews(news)}
              metadata={
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(news.date)}</span>
                </div>
              }
            />
          ))}
        </ContentGrid>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 mx-auto"
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
