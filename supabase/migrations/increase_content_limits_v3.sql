-- Migration to further increase blog content limits
-- The previous limit was 100,000 characters which is still being hit due to large HTML/Base64 content
-- We will increase it to 500,000 characters to provide more overhead

-- 1. BLOG_POSTS Table - Content Limit
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_content_max_chars;

ALTER TABLE blog_posts 
  ADD CONSTRAINT blog_content_max_chars CHECK (char_length(content) <= 500000);

-- 2. NEWS Table - Content Limit
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_content_max_chars;

ALTER TABLE news 
  ADD CONSTRAINT news_content_max_chars CHECK (char_length(content) <= 500000);

-- 3. PUBLICATIONS Table - Content Limit
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_content_max_chars;

ALTER TABLE publications 
  ADD CONSTRAINT publications_content_max_chars CHECK (content IS NULL OR char_length(content) <= 500000);

-- 4. PROJECTS Table - Content and Description Limits
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_description_max_chars;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS objectives_max_length;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS methodology_max_length;

ALTER TABLE projects 
  ADD CONSTRAINT projects_description_max_chars CHECK (char_length(description) <= 500000),
  ADD CONSTRAINT objectives_max_length CHECK (objectives IS NULL OR char_length(objectives) <= 500000),
  ADD CONSTRAINT methodology_max_length CHECK (methodology IS NULL OR char_length(methodology) <= 500000);

-- Log success
SELECT 'Content limits increased to 500,000 characters' as status;
