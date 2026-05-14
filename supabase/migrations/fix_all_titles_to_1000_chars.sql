-- Migration: Fix ALL title constraints to 1000 characters
-- This updates all tables that have title max character constraints

DO $$
BEGIN
    -- 1. HERO SECTIONS
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'hero_sections' AND constraint_name = 'hero_title_max_chars'
    ) THEN
        ALTER TABLE hero_sections DROP CONSTRAINT hero_title_max_chars;
    END IF;
    ALTER TABLE hero_sections ADD CONSTRAINT hero_title_max_chars 
        CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    RAISE NOTICE 'Updated hero_sections title constraint to 1000 chars';

    -- 2. NEWS
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'news' AND constraint_name = 'news_title_max_chars'
    ) THEN
        ALTER TABLE news DROP CONSTRAINT news_title_max_chars;
    END IF;
    ALTER TABLE news ADD CONSTRAINT news_title_max_chars 
        CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    RAISE NOTICE 'Updated news title constraint to 1000 chars';

    -- 3. HIGHLIGHTS
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'highlights' AND constraint_name = 'highlights_title_max_chars'
    ) THEN
        ALTER TABLE highlights DROP CONSTRAINT highlights_title_max_chars;
    END IF;
    ALTER TABLE highlights ADD CONSTRAINT highlights_title_max_chars 
        CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    RAISE NOTICE 'Updated highlights title constraint to 1000 chars';

    -- 4. PUBLICATIONS
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'publications' AND constraint_name = 'publications_title_max_chars'
    ) THEN
        ALTER TABLE publications DROP CONSTRAINT publications_title_max_chars;
    END IF;
    ALTER TABLE publications ADD CONSTRAINT publications_title_max_chars 
        CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    RAISE NOTICE 'Updated publications title constraint to 1000 chars';

    -- 5. BLOG POSTS
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'blog_posts' AND constraint_name = 'blog_title_max_chars'
    ) THEN
        ALTER TABLE blog_posts DROP CONSTRAINT blog_title_max_chars;
    END IF;
    ALTER TABLE blog_posts ADD CONSTRAINT blog_title_max_chars 
        CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    RAISE NOTICE 'Updated blog_posts title constraint to 1000 chars';

    -- 6. PROJECTS
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'projects' AND constraint_name = 'projects_title_max_chars'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT projects_title_max_chars;
    END IF;
    ALTER TABLE projects ADD CONSTRAINT projects_title_max_chars 
        CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    RAISE NOTICE 'Updated projects title constraint to 1000 chars';

    -- 7. FINANCIAL STATEMENTS
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'financial_statements' AND constraint_name = 'fs_title_max_chars'
    ) THEN
        ALTER TABLE financial_statements DROP CONSTRAINT fs_title_max_chars;
    END IF;
    ALTER TABLE financial_statements ADD CONSTRAINT fs_title_max_chars 
        CHECK (LENGTH(COALESCE(title, '')) <= 1000);
    RAISE NOTICE 'Updated financial_statements title constraint to 1000 chars';

END $$;

-- Also drop word count constraints since we're using character limits now
DO $$
BEGIN
    -- Drop word count constraints if they exist
    ALTER TABLE hero_sections DROP CONSTRAINT IF EXISTS hero_title_max_words;
    ALTER TABLE news DROP CONSTRAINT IF EXISTS news_title_max_words;
    ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_title_max_words;
    ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_title_max_words;
    ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_title_max_words;
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_title_max_words;
    ALTER TABLE financial_statements DROP CONSTRAINT IF EXISTS fs_title_max_words;
    RAISE NOTICE 'Dropped all title word count constraints';
END $$;

SELECT 'All title constraints updated to 1000 characters successfully' as status;
