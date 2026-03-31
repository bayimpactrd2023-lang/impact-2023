-- ============================================
-- MIGRATION: Add pdf_access_type to publications table
-- Run this if you already have an existing database
-- ============================================

-- Add pdf_access_type column to publications table
ALTER TABLE publications
ADD COLUMN IF NOT EXISTS pdf_access_type TEXT DEFAULT 'download'
CHECK (pdf_access_type IN ('view', 'download'));

-- Update existing rows to have default value
UPDATE publications
SET pdf_access_type = 'download'
WHERE pdf_access_type IS NULL;

-- Verification query - Run this to check if the column was added successfully
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'publications' AND column_name = 'pdf_access_type';
