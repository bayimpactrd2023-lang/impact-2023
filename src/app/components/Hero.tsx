import React from 'react';
import { useContent } from '@/app/context/ContentContext';


export const Hero: React.FC = () => {
  const { content } = useContent();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      {content.heroBackgroundUrl ? (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${content.heroBackgroundUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-blue-900/40 via-blue-800/60 to-blue-900/80" />
        </div>
      ) : (
        <>
          {/* Default gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50" />
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231887FC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <div className="flex flex-col items-center">
          {/* Image at the top */}
          <img 
            src="/images/logos/impact.png" 
            alt="IMPACT R&D Logo" 
            className="w-full max-w-2xl sm:max-w-3xl h-auto mb-8 sm:mb-10 drop-shadow-xl px-4"
          />
          
          {/* 2023 text in the middle */}
          <div className="mb-8 sm:mb-10">
            <p className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide ${
              content.heroBackgroundUrl ? 'text-white' : 'text-[#1887FC]'
            }`}>
              2023
            </p>
          </div>

          {/* Buttons at the bottom */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md px-4">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#1887FC] text-white rounded-lg font-medium hover:bg-[#0b5ab8] transition-colors text-base sm:text-lg touch-manipulation">
              Learn More
            </button>
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#1887FC] rounded-lg font-medium border-2 border-[#1887FC] hover:bg-blue-50 transition-colors text-base sm:text-lg touch-manipulation">
              Our Projects
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};