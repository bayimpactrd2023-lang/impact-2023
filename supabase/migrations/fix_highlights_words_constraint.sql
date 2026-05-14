-- Migration: Fix highlights description word count constraint
-- The constraint limits description word count, we need to increase or remove it

DO $$
BEGIN
    -- Drop the word count constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'highlights' 
        AND constraint_name = 'highlights_description_max_words'
    ) THEN
        ALTER TABLE highlights DROP CONSTRAINT highlights_description_max_words;
        RAISE NOTICE 'Dropped highlights_description_max_words constraint';
    END IF;

    -- Also check for any other word-based constraints
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'highlights' 
        AND constraint_name LIKE '%description%word%'
    ) THEN
        ALTER TABLE highlights DROP CONSTRAINT highlights_description_max_words;
        RAISE NOTICE 'Dropped description word constraint';
    END IF;

    -- Check for array_length constraint on description
    IF EXISTS (
        SELECT 1 
        FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%highlights%description%'
        AND constraint_name LIKE '%word%'
    ) THEN
        -- Drop all description word constraints
        ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_max_words;
        RAISE NOTICE 'Cleaned up word count constraints';
    END IF;
END $$;

-- Alternative: If the above doesn't work, drop ALL check constraints on highlights table
-- and recreate only the character limit one

-- First, let's see what constraints exist (this is for logging only)
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'highlights'::regclass 
AND contype = 'c';
