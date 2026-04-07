-- ============================================
-- MIGRATION: Add pdf_access_type to financial_statements table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add pdf_access_type column to financial_statements table
ALTER TABLE financial_statements
ADD COLUMN IF NOT EXISTS pdf_access_type TEXT DEFAULT 'download'
CHECK (pdf_access_type IN ('view', 'download'));

-- Update existing rows to have default value
UPDATE financial_statements
SET pdf_access_type = 'download'
WHERE pdf_access_type IS NULL;

-- Verification query - Run this to check if the column was added successfully
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'financial_statements' AND column_name = 'pdf_access_type';
