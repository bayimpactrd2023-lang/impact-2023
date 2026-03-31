/**
 * Home Page Partners Section
 * 
 * Displays partner organizations' logos.
 */

import React from 'react';
import { useContent } from '@/app/context/ContentContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

/**
 * Partners section component
 * 
 * Features:
 * - Logo grid display
 * - Responsive layout
 * - Grayscale filter with hover effect
 * - Proper aspect ratio maintenance
 */
export function PartnersSection() {
  const { content } = useContent();

  if (content.partners.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Partners</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Collaborating with leading organizations to drive impact
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {content.partners.map(partner => (
            <div
              key={partner.id}
              className="flex items-center justify-center p-6 bg-white rounded-lg hover:shadow-md transition-all duration-300"
            >
              <div className="w-full h-32 flex items-center justify-center">
                <ImageWithFallback
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  title={partner.name}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}