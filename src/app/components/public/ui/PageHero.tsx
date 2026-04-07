/**
 * Page Hero Component
 * 
 * Reusable hero section for all public pages.
 * Provides consistent styling with customizable content.
 */

import type { ReactNode } from 'react';
import { HeroConfig } from '../types/page.types';

export interface PageHeroProps extends HeroConfig {
  /** Optional children to render below title/subtitle */
  children?: ReactNode;
}

/**
 * Hero section component
 * 
 * Features:
 * - Background image with gradient overlay
 * - Responsive text sizing
 * - Customizable content
 */
export function PageHero({
  title,
  subtitle,
  backgroundUrl,
  children,
}: PageHeroProps) {
  return (
    <div className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/60 to-blue-900/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}