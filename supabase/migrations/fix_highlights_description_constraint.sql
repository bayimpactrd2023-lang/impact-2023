-- Migration: Fix highlights description check constraint
-- The constraint limits description length, we need to increase it

DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'highlights' 
        AND constraint_name = 'highlights_description_max_chars'
    ) THEN
        ALTER TABLE highlights DROP CONSTRAINT highlights_description_max_chars;
        RAISE NOTICE 'Dropped old highlights_description_max_chars constraint';
    END IF;

    -- Also check for alternative naming patterns
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'highlights' 
        AND constraint_name LIKE '%description%length%'
    ) THEN
        ALTER TABLE highlights DROP CONSTRAINT highlights_description_length;
        RAISE NOTICE 'Dropped highlights_description_length constraint';
    END IF;

    -- Add new constraint with 2000 character limit
    ALTER TABLE highlights 
    ADD CONSTRAINT highlights_description_max_chars 
    CHECK (LENGTH(description) <= 2000);
    
    RAISE NOTICE 'Added new highlights_description_max_chars constraint (2000 chars)';

    -- Also increase content/description limits for other fields if needed
    -- Check if content column exists and has constraints
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'highlights' 
        AND column_name = 'content'
    ) THEN
        -- Drop content constraint if exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE table_name = 'highlights' 
            AND constraint_name = 'highlights_content_max_chars'
        ) THEN
            ALTER TABLE highlights DROP CONSTRAINT highlights_content_max_chars;
            RAISE NOTICE 'Dropped old highlights_content_max_chars constraint';
        END IF;

        -- Add new content constraint with 35000 character limit
        ALTER TABLE highlights 
        ADD CONSTRAINT highlights_content_max_chars 
        CHECK (LENGTH(COALESCE(content, '')) <= 35000);
        
        RAISE NOTICE 'Added new highlights_content_max_chars constraint (35000 chars)';
    END IF;
END $$;
