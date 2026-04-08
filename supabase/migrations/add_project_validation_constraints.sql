-- Migration to add validation constraints for projects table
-- Focus: Locally Funded and Internationally Funded Projects
-- Constraints: Objectives and Methodology fields limited to 5000 words (~50000 chars)

-- First, ensure columns exist with proper types
DO $$ 
BEGIN
    -- Add objectives column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'objectives') THEN
        ALTER TABLE projects ADD COLUMN objectives TEXT;
    END IF;

    -- Add methodology column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'methodology') THEN
        ALTER TABLE projects ADD COLUMN methodology TEXT;
    END IF;
END $$;

-- Create a function to count words in text
CREATE OR REPLACE FUNCTION count_words(text_input TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
BEGIN
    IF text_input IS NULL OR text_input = '' THEN
        RETURN 0;
    END IF;
    -- Count words by counting space-separated tokens
    word_count := array_length(regexp_split_to_array(trim(text_input), '\s+'), 1);
    IF word_count IS NULL THEN
        word_count := 0;
    END IF;
    RETURN word_count;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add validation trigger for locally and internationally funded projects
CREATE OR REPLACE FUNCTION validate_project_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Only apply validation for locally_funded and internationally_funded categories
    IF NEW.category IN ('locally_funded', 'internationally_funded') THEN
        -- Validate Objectives field (max 5000 words)
        IF NEW.objectives IS NOT NULL AND count_words(NEW.objectives) > 5000 THEN
            RAISE EXCEPTION 'Objectives field exceeds maximum of 5000 words for % projects', NEW.category;
        END IF;
        
        -- Validate Methodology field (max 5000 words)
        IF NEW.methodology IS NOT NULL AND count_words(NEW.methodology) > 5000 THEN
            RAISE EXCEPTION 'Methodology and Activities field exceeds maximum of 5000 words for % projects', NEW.category;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS project_validation_trigger ON projects;

-- Create the trigger
CREATE TRIGGER project_validation_trigger
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION validate_project_fields();

-- Add comments to document the constraints
COMMENT ON COLUMN projects.objectives IS 'Project objectives text. Max 5000 words enforced by trigger for locally_funded and internationally_funded categories.';
COMMENT ON COLUMN projects.methodology IS 'Project methodology and activities text. Max 5000 words enforced by trigger for locally_funded and internationally_funded categories.';

-- Add character length constraints as additional safety (5000 words ~ 50000 chars)
-- Note: These apply to all categories but are lenient enough to not interfere
ALTER TABLE projects DROP CONSTRAINT IF EXISTS objectives_max_length;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS methodology_max_length;

ALTER TABLE projects 
    ADD CONSTRAINT objectives_max_length CHECK (char_length(objectives) <= 50000 OR objectives IS NULL),
    ADD CONSTRAINT methodology_max_length CHECK (char_length(methodology) <= 50000 OR methodology IS NULL);
