/**
 * Content Model
 * 
 * Defines the structure for general website content
 */

export interface HeroContent {
  title: string;
  subtitle: string;
  backgroundUrl?: string;
}

export interface AboutContent {
  vision: string;
  mission: string;
  description: string;
}

export interface ContentState {
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundUrl?: string;
  aboutVision: string;
  aboutMission: string;
  aboutDescription: string;
}
