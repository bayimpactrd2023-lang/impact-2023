/**
 * Custom hook for Hero Section operations
 * Handles hero section state and save logic separate from UI
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { updateHeroSection } from '@/services/supabaseService';

interface HeroData {
  title: string;
  subtitle: string;
  backgroundUrl: string;
}

export const useHeroOperations = (
  initialHero: HeroData,
  refreshContent?: () => Promise<void>
) => {
  const [heroTitle, setHeroTitle] = useState(initialHero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(initialHero.subtitle);
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState(initialHero.backgroundUrl);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save hero section to database
   */
  const handleSave = async () => {
    if (isSaving) return;

    // Check for changes
    const hasChanges =
      heroTitle !== initialHero.title ||
      heroSubtitle !== initialHero.subtitle ||
      heroBackgroundUrl !== initialHero.backgroundUrl;

    if (!hasChanges) {
      toast.info('No changes made', {
        description: 'There are no changes to save.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateHeroSection({
        title: heroTitle,
        subtitle: heroSubtitle,
        background_url: heroBackgroundUrl || null,
      });

      // IMMEDIATE DATABASE REFRESH
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Hero section saved successfully!');
    } catch (error) {
      console.error('Error saving hero section:', error);
      toast.error('Failed to save hero section.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    heroTitle,
    setHeroTitle,
    heroSubtitle,
    setHeroSubtitle,
    heroBackgroundUrl,
    setHeroBackgroundUrl,
    isSaving,
    handleSave,
  };
};