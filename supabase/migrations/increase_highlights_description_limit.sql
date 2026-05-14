-- Migration to increase highlights description limit to 5,000 characters
-- Tables affected: highlights

-- 1. Update highlights table description constraints
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_max_chars;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_check;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS check_description_length;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS description_max_words;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_max_words;

-- Add increased limit (5,000 characters)
ALTER TABLE highlights ADD CONSTRAINT highlights_description_max_chars 
CHECK (description IS NULL OR LENGTH(description) <= 5000);

-- Log success
SELECT 'Highlights description constraint increased to 5000 characters' as status;
