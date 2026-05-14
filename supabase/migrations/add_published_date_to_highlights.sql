-- Migration: Add published_date column to highlights table if missing
-- This fixes the 400 error when saving highlights

DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'highlights' 
        AND column_name = 'published_date'
    ) THEN
        -- Add the column
        ALTER TABLE highlights ADD COLUMN published_date DATE DEFAULT CURRENT_DATE;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_highlights_published_date ON highlights(published_date DESC);
        
        RAISE NOTICE 'published_date column added to highlights table';
    ELSE
        RAISE NOTICE 'published_date column already exists';
    END IF;
END $$;
