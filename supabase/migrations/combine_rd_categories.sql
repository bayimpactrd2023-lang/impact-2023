-- Combine internationally_funded and locally_funded into a single rd_projects category
-- This migration updates all existing projects and adds a check constraint to ensure only valid categories are used

-- 1. Update the check constraint for categories
-- We need to drop the old constraint first because it doesn't include 'rd_projects'
-- which causes the UPDATE in step 2 to fail.

DO $$ 
BEGIN
    -- Drop the existing category check constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_category_check') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_category_check;
    END IF;
END $$;

-- Add the new constraint that includes 'rd_projects'
ALTER TABLE projects ADD CONSTRAINT projects_category_check 
CHECK (category IN (
    'rd_projects', 
    'community_transformation', 
    'technology_spinoffs', 
    'thesis_support', 
    'internship_program', 
    'financial_statements',
    'study_findings', -- Added to match existing categories
    'internationally_funded', -- Keep temporarily so update works
    'locally_funded' -- Keep temporarily so update works
));

-- 2. Update existing projects to use the new category
UPDATE projects 
SET category = 'rd_projects' 
WHERE category IN ('internationally_funded', 'locally_funded');

-- 3. Now remove the old categories from the constraint
ALTER TABLE projects DROP CONSTRAINT projects_category_check;
ALTER TABLE projects ADD CONSTRAINT projects_category_check 
CHECK (category IN (
    'rd_projects', 
    'community_transformation', 
    'technology_spinoffs', 
    'thesis_support', 
    'internship_program', 
    'financial_statements',
    'study_findings'
));

-- 4. Update the validation trigger function to include rd_projects
CREATE OR REPLACE FUNCTION validate_project_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Only apply validation for rd_projects and previously used categories
    IF NEW.category IN ('rd_projects', 'locally_funded', 'internationally_funded') THEN
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

-- 5. Documentation update
COMMENT ON COLUMN projects.objectives IS 'Project objectives text. Max 5000 words enforced by trigger for rd_projects category.';
COMMENT ON COLUMN projects.methodology IS 'Project methodology and activities text. Max 5000 words enforced by trigger for rd_projects category.';
