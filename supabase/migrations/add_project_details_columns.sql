-- Migration to add project details columns to projects table
-- This migration adds 'context', 'objectives', and 'methodology' columns if they don't already exist.

DO $$ 
BEGIN
    -- Add context column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'context') THEN
        ALTER TABLE projects ADD COLUMN context TEXT;
    END IF;

    -- Add objectives column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'objectives') THEN
        ALTER TABLE projects ADD COLUMN objectives TEXT;
    END IF;

    -- Add methodology column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'methodology') THEN
        ALTER TABLE projects ADD COLUMN methodology TEXT;
    END IF;
END $$;
