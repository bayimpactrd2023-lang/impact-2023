-- Migration to increase ALL content limits across all tables
-- This ensures that the database matches the expanded frontend limits

-- 1. Create word_count helper if not exists
CREATE OR REPLACE FUNCTION word_count(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN array_length(regexp_split_to_array(COALESCE(trim(text_input), ''), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. HIGHLIGHTS Table - Description and Content
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_max_chars;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_description_max_words;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_content_max_chars;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_title_max_chars;

ALTER TABLE highlights 
  ADD CONSTRAINT highlights_title_max_chars CHECK (char_length(title) <= 2000),
  ADD CONSTRAINT highlights_description_max_chars CHECK (description IS NULL OR char_length(description) <= 10000),
  ADD CONSTRAINT highlights_content_max_chars CHECK (content IS NULL OR char_length(content) <= 100000);

-- 3. NEWS Table - Title and Content
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_title_max_chars;
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_content_max_chars;

ALTER TABLE news 
  ADD CONSTRAINT news_title_max_chars CHECK (char_length(title) <= 2000),
  ADD CONSTRAINT news_content_max_chars CHECK (char_length(content) <= 100000);

-- 4. BLOG_POSTS Table - Title and Content
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_title_max_chars;
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_content_max_chars;

ALTER TABLE blog_posts 
  ADD CONSTRAINT blog_title_max_chars CHECK (char_length(title) <= 2000),
  ADD CONSTRAINT blog_content_max_chars CHECK (char_length(content) <= 100000);

-- 5. PUBLICATIONS Table - Title, Authors, Content, Excerpt, Sentence
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_title_max_chars;
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_authors_max_chars;
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_content_max_chars;
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_excerpt_max_chars;
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_sentence_max_chars;

ALTER TABLE publications 
  ADD CONSTRAINT publications_title_max_chars CHECK (char_length(title) <= 2000),
  ADD CONSTRAINT publications_authors_max_chars CHECK (char_length(authors) <= 1000),
  ADD CONSTRAINT publications_content_max_chars CHECK (content IS NULL OR char_length(content) <= 100000),
  ADD CONSTRAINT publications_excerpt_max_chars CHECK (excerpt IS NULL OR char_length(excerpt) <= 10000),
  ADD CONSTRAINT publications_sentence_max_chars CHECK (sentence IS NULL OR char_length(sentence) <= 10000);

-- 6. TEAM_MEMBERS Table - Name, Role, Biography/Description
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_name_max_chars;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_role_max_chars;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_description_max_chars;

ALTER TABLE team_members 
  ADD CONSTRAINT team_name_max_chars CHECK (char_length(name) <= 255),
  ADD CONSTRAINT team_role_max_chars CHECK (char_length(role) <= 255),
  ADD CONSTRAINT team_description_max_chars CHECK (description IS NULL OR char_length(description) <= 100000);

-- 7. PROJECTS Table - Title, Description, Objectives, Methodology
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_title_max_chars;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_description_max_chars;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS objectives_max_length;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS methodology_max_length;

ALTER TABLE projects 
  ADD CONSTRAINT projects_title_max_chars CHECK (char_length(title) <= 2000),
  ADD CONSTRAINT projects_description_max_chars CHECK (char_length(description) <= 100000),
  ADD CONSTRAINT objectives_max_length CHECK (objectives IS NULL OR char_length(objectives) <= 100000),
  ADD CONSTRAINT methodology_max_length CHECK (methodology IS NULL OR char_length(methodology) <= 100000);

-- Update project trigger to allow 10k words
CREATE OR REPLACE FUNCTION validate_project_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.objectives IS NOT NULL AND word_count(NEW.objectives) > 10000 THEN
        RAISE EXCEPTION 'Objectives field exceeds maximum of 10000 words';
    END IF;
    
    IF NEW.methodology IS NOT NULL AND word_count(NEW.methodology) > 10000 THEN
        RAISE EXCEPTION 'Methodology and Activities field exceeds maximum of 10000 words';
    END IF;

    IF word_count(NEW.description) > 10000 THEN
        RAISE EXCEPTION 'Project overview exceeds maximum of 10000 words';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. PARTNERS Table - Name
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partner_name_max_chars;
ALTER TABLE partners ADD CONSTRAINT partner_name_max_chars CHECK (char_length(name) <= 255);

-- Log success
SELECT 'All content limits increased globally in database' as status;
