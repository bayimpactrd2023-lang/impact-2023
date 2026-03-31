-- ============================================
-- MIGRATION: Update Financial Statements to PDF-based
-- This migration converts financial_statements from image-based to PDF-based
-- ============================================

-- Drop the old image columns and add pdf_url column
ALTER TABLE financial_statements 
  DROP COLUMN IF EXISTS image_url,
  DROP COLUMN IF EXISTS images,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Update the table structure
-- Remove default from pdf_url after adding it
ALTER TABLE financial_statements 
  ALTER COLUMN pdf_url DROP DEFAULT;

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the new structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'financial_statements';
-- ============================================

-- Expected columns after migration:
-- - id (uuid)
-- - title (text)
-- - year (text)
-- - pdf_url (text, NOT NULL)
-- - description (text, nullable)
-- - created_at (timestamp with time zone)
-- - updated_at (timestamp with time zone)
