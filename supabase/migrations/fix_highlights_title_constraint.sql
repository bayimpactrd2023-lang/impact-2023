-- Migration: Fix highlights title check constraint
-- The constraint limits title length, we need to increase it to 1000 chars

DO $$
BEGIN
    -- Drop the old title constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'highlights' 
        AND constraint_name = 'highlights_title_max_chars'
    ) THEN
        ALTER TABLE highlights DROP CONSTRAINT highlights_title_max_chars;
        RAISE NOTICE 'Dropped old highlights_title_max_chars constraint';
    END IF;

    -- Also check for alternative naming patterns
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'highlights' 
        AND constraint_name LIKE '%title%length%'
    ) THEN
        ALTER TABLE highlights DROP CONSTRAINT highlights_title_length;
        RAISE NOTICE 'Dropped highlights_title_length constraint';
    END IF;

    -- Add new constraint with 1000 character limit
    ALTER TABLE highlights 
    ADD CONSTRAINT highlights_title_max_chars 
    CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    
    RAISE NOTICE 'Added new highlights_title_max_chars constraint (1000 chars)';
END $$;
