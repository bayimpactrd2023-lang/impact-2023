-- ============================================
-- Migration: Add image_url column to internship_testimonials
-- Date: 2026-03-23
-- Description: Adds cover image support to internship testimonials
-- ============================================

-- Add image_url column to internship_testimonials table
ALTER TABLE internship_testimonials
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN internship_testimonials.image_url IS 'Cover image URL for the testimonial';

-- Migration complete!
