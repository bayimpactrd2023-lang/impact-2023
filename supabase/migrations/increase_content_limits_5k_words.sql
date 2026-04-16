-- Migration to increase content limits to 5,000 words (~50,000 characters)
-- Tables affected: about_sections, news, highlights, publications, blog_posts, projects, internship_testimonials

-- 1. Create helper functions if they don't exist
CREATE OR REPLACE FUNCTION word_count(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN array_length(regexp_split_to_array(COALESCE(trim(text_input), ''), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Update projects table constraints (already has some, but we'll standardize)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS objectives_max_length;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS methodology_max_length;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_description_max_chars;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_title_max_chars;

ALTER TABLE projects 
    ADD CONSTRAINT projects_title_max_chars CHECK (char_length(title) <= 1000),
    ADD CONSTRAINT projects_description_max_chars CHECK (char_length(description) <= 50000),
    ADD CONSTRAINT objectives_max_length CHECK (char_length(objectives) <= 50000 OR objectives IS NULL),
    ADD CONSTRAINT methodology_max_length CHECK (char_length(methodology) <= 50000 OR methodology IS NULL);

-- Update project_validation_trigger to allow 5000 words for all categories if needed, 
-- or keep it at 5000 for specific ones but ensure word_count is handled.
CREATE OR REPLACE FUNCTION validate_project_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Standardize 5000 words for all project categories
    IF NEW.objectives IS NOT NULL AND word_count(NEW.objectives) > 5000 THEN
        RAISE EXCEPTION 'Objectives field exceeds maximum of 5000 words';
    END IF;
    
    IF NEW.methodology IS NOT NULL AND word_count(NEW.methodology) > 5000 THEN
        RAISE EXCEPTION 'Methodology and Activities field exceeds maximum of 5000 words';
    END IF;

    IF word_count(NEW.description) > 5000 THEN
        RAISE EXCEPTION 'Project overview exceeds maximum of 5000 words';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update news table
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_content_max_chars;
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_title_max_chars;
ALTER TABLE news ADD CONSTRAINT news_title_max_chars CHECK (char_length(title) <= 1000);
ALTER TABLE news ADD CONSTRAINT news_content_max_chars CHECK (char_length(content) <= 50000);

-- 4. Update blog_posts table
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_content_max_chars;
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_title_max_chars;
ALTER TABLE blog_posts ADD CONSTRAINT blog_title_max_chars CHECK (char_length(title) <= 1000);
ALTER TABLE blog_posts ADD CONSTRAINT blog_content_max_chars CHECK (char_length(content) <= 50000);

-- 5. Update publications table
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_content_max_chars;
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_title_max_chars;
ALTER TABLE publications ADD CONSTRAINT publications_title_max_chars CHECK (char_length(title) <= 1000);
ALTER TABLE publications ADD CONSTRAINT publications_content_max_chars CHECK (content IS NULL OR char_length(content) <= 50000);

-- 6. Update about_sections table
ALTER TABLE about_sections DROP CONSTRAINT IF EXISTS about_description_max_chars;
ALTER TABLE about_sections ADD CONSTRAINT about_description_max_chars CHECK (description IS NULL OR char_length(description) <= 50000);

-- 7. Update internship_testimonials table
-- Add a constraint if it doesn't exist for full_text
ALTER TABLE internship_testimonials DROP CONSTRAINT IF EXISTS it_full_text_max_chars;
ALTER TABLE internship_testimonials ADD CONSTRAINT it_full_text_max_chars CHECK (full_text IS NULL OR char_length(full_text) <= 50000);

-- 8. Update highlights table
-- highlights content field
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_content_max_chars;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_title_max_chars;
ALTER TABLE highlights ADD CONSTRAINT highlights_title_max_chars CHECK (char_length(title) <= 1000);
ALTER TABLE highlights ADD CONSTRAINT highlights_content_max_chars CHECK (content IS NULL OR char_length(content) <= 50000);
