/**
 * Home Page Hero Section
 * 
 * Main hero section for the homepage.
 */

import { PageHero } from '../../ui/PageHero';
import { useContent } from '@/app/context/ContentContext';

/**
 * Homepage hero section component
 * 
 * Displays:
 * - Organization title
 * - Subtitle/tagline
 * - Background image
 * - Animated particles
 */
export function HeroSection() {
  const { content } = useContent();

  return (
    <PageHero
      title={content.heroTitle}
      subtitle={content.heroSubtitle}
      backgroundUrl={content.heroBackgroundUrl}
      showParticles={true}
    />
  );
}
