-- Migration: Rename student_support category to thesis_support

-- Step 1: Drop the existing check constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

-- Step 2: Update existing projects
UPDATE projects 
SET category = 'thesis_support' 
WHERE category = 'student_support';

-- Step 3: Add new check constraint with thesis_support instead of student_support
ALTER TABLE projects ADD CONSTRAINT projects_category_check
CHECK (category IN (
  'internationally_funded',
  'locally_funded',
  'community_transformation',
  'technology_spinoffs',
  'thesis_support',
  'internship_program',
  'study_findings',
  'financial_statements'
));
