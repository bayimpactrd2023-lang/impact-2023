-- Migration: Fix ALL highlights constraints
-- Drops word count constraints, keeps character limit at 2000

-- Drop word count constraint
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_max_words;

-- Drop any other description constraints that might exist
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_check;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS check_description_length;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS description_max_words;

-- Ensure character limit constraint exists at 2000 chars
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_max_chars;
ALTER TABLE highlights ADD CONSTRAINT highlights_description_max_chars 
CHECK (LENGTH(description) <= 2000);

-- Also fix content field constraint if it exists
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_content_max_chars;
ALTER TABLE highlights ADD CONSTRAINT highlights_content_max_chars 
CHECK (LENGTH(COALESCE(content, '')) <= 35000);

-- Log success
SELECT 'Highlights constraints updated successfully' as status;
