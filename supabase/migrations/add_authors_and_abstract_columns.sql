-- Migration to add authors and abstract columns to projects and publications tables
-- This ensures all required fields requested by the user are available in the database

DO $$ 
BEGIN
    -- Add abstract column to projects if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'abstract') THEN
        ALTER TABLE projects ADD COLUMN abstract TEXT;
    END IF;

    -- Add authors column to projects if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'authors') THEN
        ALTER TABLE projects ADD COLUMN authors TEXT;
    END IF;

    -- Add abstract column to publications if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'publications' AND column_name = 'abstract') THEN
        ALTER TABLE publications ADD COLUMN abstract TEXT;
    END IF;
END $$;
