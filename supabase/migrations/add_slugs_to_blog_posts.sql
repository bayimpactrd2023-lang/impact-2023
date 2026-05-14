-- Migration to add slug-based routing for blog posts
-- 1. Add slug column to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Create index for slug-based lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- 3. Create a function to generate slugs from titles
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(trim(title), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- 4. Update existing posts with slugs if they don't have one
UPDATE blog_posts 
SET slug = generate_slug(title) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- 5. Add a trigger to automatically generate slugs for new posts
CREATE OR REPLACE FUNCTION blog_posts_generate_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_slug(NEW.title) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_generate_slug ON blog_posts;
CREATE TRIGGER trg_blog_posts_generate_slug
BEFORE INSERT ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION blog_posts_generate_slug_trigger();
