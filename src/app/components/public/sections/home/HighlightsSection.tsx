/**
 * Home Page Highlights Section
 * 
 * Displays key highlights/features of the organization.
 */

import { useState, useMemo, type ComponentType } from 'react';
import { useContent } from '@/app/context/ContentContext';
import { Satellite, Sprout, BarChart3, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

const ITEMS_PER_PAGE = 8;

/**
 * Icon map for highlights
 */
const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Satellite,
  Sprout,
  BarChart3,
  Globe,
};

/**
 * Highlights section component
 * 
 * Features:
 * - Grid of highlight cards
 * - Icons for visual interest
 * - Responsive layout
 * - Hover animations
 * - Pagination
 */
export function HighlightsSection() {
  const { content } = useContent();
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(content.highlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentHighlights = useMemo(() => {
    return content.highlights.slice(startIndex, endIndex);
  }, [content.highlights, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Highlights</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover what makes IMPACT R&D a leader in agricultural and community development research
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentHighlights.map(highlight => {
            const IconComponent = ICON_MAP[highlight.iconName] || Globe;

            return (
              <Card
                key={highlight.id}
                className="hover:shadow-lg transition-shadow duration-300 group"
              >
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8" />
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-2">{highlight.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm">{highlight.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1887FC] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
                className={
                  currentPage === page
                    ? "bg-[#1887FC] hover:bg-[#0b5ab8] text-white"
                    : "hover:bg-[#1887FC]/10 hover:text-[#1887FC] transition-colors"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1887FC] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Results info */}
        {content.highlights.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, content.highlights.length)} of {content.highlights.length} highlights
          </div>
        )}
      </div>
    </section>
  );
}