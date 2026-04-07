-- ============================================
-- IMPACT R&D Database Schema
-- Complete SQL for all 13 admin panel sections
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. HERO SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hero_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  background_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ABOUT SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vision TEXT,
  mission TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. NEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  images TEXT[], -- Array of image URLs for gallery
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for date sorting
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);

-- ============================================
-- 4. HIGHLIGHTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  images TEXT[], -- Array of image URLs
  icon_name TEXT DEFAULT 'Star',
  featured BOOLEAN DEFAULT FALSE,
  published_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for featured and date
CREATE INDEX IF NOT EXISTS idx_highlights_featured ON highlights(featured DESC, published_date DESC);

-- ============================================
-- 5. TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for name sorting
CREATE INDEX IF NOT EXISTS idx_team_members_name ON team_members(name ASC);

-- ============================================
-- 6. PARTNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for name sorting
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name ASC);

-- ============================================
-- 7. PUBLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  sentence TEXT,
  link TEXT,
  pdf_url TEXT,
  pdf_access_type TEXT DEFAULT 'download' CHECK (pdf_access_type IN ('view', 'download')),
  optional_links TEXT,
  contact_info TEXT,
  reference TEXT,
  published_date DATE DEFAULT CURRENT_DATE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for featured and date
CREATE INDEX IF NOT EXISTS idx_publications_featured ON publications(featured DESC, published_date DESC);

-- ============================================
-- 8. BLOG POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_role TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  images TEXT[], -- Array of image URLs
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for date sorting
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);

-- ============================================
-- 9. PROJECTS TABLE
-- (Used for 4 different categories)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN (
      'internationally_funded',
      'locally_funded',
      'community_transformation',
      'internship_program',
      'study_findings'
    )
  ),
  context TEXT,
  objectives TEXT,
  methodology TEXT,
  date DATE DEFAULT CURRENT_DATE,
  image_url TEXT,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for category and date
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category, date DESC);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date DESC);

-- ============================================
-- 10. FINANCIAL STATEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  year TEXT NOT NULL,
  pdf_url TEXT, -- PDF file URL
  pdf_access_type TEXT DEFAULT 'download' CHECK (pdf_access_type IN ('view', 'download')),
  description TEXT, -- Optional description
  image_url TEXT, -- Cover image (optional)
  images TEXT[], -- Array of page images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for year sorting
CREATE INDEX IF NOT EXISTS idx_financial_statements_year ON financial_statements(year DESC);

-- ============================================
-- 11. INTERNSHIP TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS internship_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  quote TEXT NOT NULL,
  full_text TEXT,
  year TEXT NOT NULL,
  published_date DATE DEFAULT CURRENT_DATE,
  image_url TEXT, -- Cover image
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for year and date
CREATE INDEX IF NOT EXISTS idx_internship_testimonials_year ON internship_testimonials(year DESC, published_date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_testimonials ENABLE ROW LEVEL SECURITY;

-- Production-Ready RLS Policies
-- AUTHENTICATED users (Admins) can do everything
-- PUBLIC (Anonymous) can only read

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'hero_sections', 'about_sections', 'news', 'highlights', 
        'team_members', 'partners', 'publications', 'blog_posts', 
        'projects', 'financial_statements', 'internship_testimonials'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Drop existing policies
        EXECUTE format('DROP POLICY IF EXISTS "Allow public read access on %I" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all access on %I" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %I" ON %I', t, t);
        
        -- Create Read Policy
        EXECUTE format('CREATE POLICY "Allow public read access on %I" ON %I FOR SELECT USING (true)', t, t);
        
        -- Create Admin Policy (Authenticated users only)
        EXECUTE format('CREATE POLICY "Admins can manage %I" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
    END LOOP;
END $$;

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pubs_date ON publications(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_projects_cat_date ON projects(category, date DESC);

-- ============================================
-- STORAGE BUCKETS FOR IMAGES
-- ============================================

-- Note: Run these in Supabase Storage, not SQL Editor
-- Or create buckets manually in the Supabase Dashboard under Storage

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('impact-images', 'impact-images', true)
-- ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS FOR AUTOMATIC UPDATED_AT
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_hero_sections_updated_at ON hero_sections;
CREATE TRIGGER update_hero_sections_updated_at BEFORE UPDATE ON hero_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_about_sections_updated_at ON about_sections;
CREATE TRIGGER update_about_sections_updated_at BEFORE UPDATE ON about_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_highlights_updated_at ON highlights;
CREATE TRIGGER update_highlights_updated_at BEFORE UPDATE ON highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_publications_updated_at ON publications;
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_statements_updated_at ON financial_statements;
CREATE TRIGGER update_financial_statements_updated_at BEFORE UPDATE ON financial_statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_internship_testimonials_updated_at ON internship_testimonials;
CREATE TRIGGER update_internship_testimonials_updated_at BEFORE UPDATE ON internship_testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INPUT VALIDATION CONSTRAINTS
-- Enforces same rules as client-side validation
-- ============================================

-- Helper function to count words (used in CHECK constraints)
CREATE OR REPLACE FUNCTION word_count(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN array_length(regexp_split_to_array(COALESCE(trim(text_input), ''), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to check if text contains digits
CREATE OR REPLACE FUNCTION contains_digits(text_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN text_input ~ '\d';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DO $$
BEGIN
  -- 1. HERO SECTIONS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hero_title_max_chars') THEN
    ALTER TABLE hero_sections ADD CONSTRAINT hero_title_max_chars CHECK (LENGTH(title) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hero_title_max_words') THEN
    ALTER TABLE hero_sections ADD CONSTRAINT hero_title_max_words CHECK (word_count(title) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hero_subtitle_max_chars') THEN
    ALTER TABLE hero_sections ADD CONSTRAINT hero_subtitle_max_chars CHECK (subtitle IS NULL OR LENGTH(subtitle) <= 300);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hero_subtitle_max_words') THEN
    ALTER TABLE hero_sections ADD CONSTRAINT hero_subtitle_max_words CHECK (subtitle IS NULL OR word_count(subtitle) <= 60);
  END IF;

  -- 2. ABOUT SECTIONS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_description_max_chars') THEN
    ALTER TABLE about_sections ADD CONSTRAINT about_description_max_chars CHECK (description IS NULL OR LENGTH(description) <= 20000);
  END IF;

  -- 3. NEWS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_title_max_chars') THEN
    ALTER TABLE news ADD CONSTRAINT news_title_max_chars CHECK (LENGTH(title) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_title_max_words') THEN
    ALTER TABLE news ADD CONSTRAINT news_title_max_words CHECK (word_count(title) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_content_max_chars') THEN
    ALTER TABLE news ADD CONSTRAINT news_content_max_chars CHECK (LENGTH(content) <= 20000);
  END IF;

  -- 4. HIGHLIGHTS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'highlights_title_max_chars') THEN
    ALTER TABLE highlights ADD CONSTRAINT highlights_title_max_chars CHECK (LENGTH(title) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'highlights_title_max_words') THEN
    ALTER TABLE highlights ADD CONSTRAINT highlights_title_max_words CHECK (word_count(title) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'highlights_description_max_chars') THEN
    ALTER TABLE highlights ADD CONSTRAINT highlights_description_max_chars CHECK (LENGTH(description) <= 300);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'highlights_description_max_words') THEN
    ALTER TABLE highlights ADD CONSTRAINT highlights_description_max_words CHECK (word_count(description) <= 60);
  END IF;

  -- 5. TEAM MEMBERS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_name_max_chars') THEN
    ALTER TABLE team_members ADD CONSTRAINT team_name_max_chars CHECK (LENGTH(name) <= 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_name_max_words') THEN
    ALTER TABLE team_members ADD CONSTRAINT team_name_max_words CHECK (word_count(name) <= 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_name_no_digits') THEN
    ALTER TABLE team_members ADD CONSTRAINT team_name_no_digits CHECK (NOT contains_digits(name));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_role_max_chars') THEN
    ALTER TABLE team_members ADD CONSTRAINT team_role_max_chars CHECK (LENGTH(role) <= 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_role_max_words') THEN
    ALTER TABLE team_members ADD CONSTRAINT team_role_max_words CHECK (word_count(role) <= 12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_role_no_digits') THEN
    ALTER TABLE team_members ADD CONSTRAINT team_role_no_digits CHECK (NOT contains_digits(role));
  END IF;

  -- 6. PARTNERS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partners_name_max_chars') THEN
    ALTER TABLE partners ADD CONSTRAINT partners_name_max_chars CHECK (LENGTH(name) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partners_name_max_words') THEN
    ALTER TABLE partners ADD CONSTRAINT partners_name_max_words CHECK (word_count(name) <= 25);
  END IF;

  -- 7. PUBLICATIONS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_title_max_chars') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_title_max_chars CHECK (LENGTH(title) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_title_max_words') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_title_max_words CHECK (word_count(title) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_authors_max_chars') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_authors_max_chars CHECK (LENGTH(authors) <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_authors_max_words') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_authors_max_words CHECK (word_count(authors) <= 35);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_authors_no_digits') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_authors_no_digits CHECK (NOT contains_digits(authors));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_content_max_chars') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_content_max_chars CHECK (content IS NULL OR LENGTH(content) <= 20000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_excerpt_max_chars') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_excerpt_max_chars CHECK (excerpt IS NULL OR LENGTH(excerpt) <= 300);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_excerpt_max_words') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_excerpt_max_words CHECK (excerpt IS NULL OR word_count(excerpt) <= 60);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_sentence_max_chars') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_sentence_max_chars CHECK (sentence IS NULL OR LENGTH(sentence) <= 300);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_sentence_max_words') THEN
    ALTER TABLE publications ADD CONSTRAINT publications_sentence_max_words CHECK (sentence IS NULL OR word_count(sentence) <= 60);
  END IF;

  -- 8. BLOG POSTS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_title_max_chars') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_title_max_chars CHECK (LENGTH(title) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_title_max_words') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_title_max_words CHECK (word_count(title) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_content_max_chars') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_content_max_chars CHECK (LENGTH(content) <= 20000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_author_max_chars') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_author_max_chars CHECK (LENGTH(author) <= 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_author_max_words') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_author_max_words CHECK (word_count(author) <= 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_author_no_digits') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_author_no_digits CHECK (NOT contains_digits(author));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_author_role_max_chars') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_author_role_max_chars CHECK (author_role IS NULL OR LENGTH(author_role) <= 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_author_role_max_words') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_author_role_max_words CHECK (author_role IS NULL OR word_count(author_role) <= 12);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_author_role_no_digits') THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_author_role_no_digits CHECK (author_role IS NULL OR NOT contains_digits(author_role));
  END IF;

  -- 9. PROJECTS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_title_max_chars') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_title_max_chars CHECK (LENGTH(title) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_title_max_words') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_title_max_words CHECK (word_count(title) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_description_max_chars') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_description_max_chars CHECK (LENGTH(description) <= 20000);
  END IF;

  -- 10. FINANCIAL STATEMENTS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fs_title_max_chars') THEN
    ALTER TABLE financial_statements ADD CONSTRAINT fs_title_max_chars CHECK (LENGTH(title) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fs_title_max_words') THEN
    ALTER TABLE financial_statements ADD CONSTRAINT fs_title_max_words CHECK (word_count(title) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fs_year_format') THEN
    ALTER TABLE financial_statements ADD CONSTRAINT fs_year_format CHECK (year ~ '^\d{4}$');
  END IF;

  -- 11. INTERNSHIP TESTIMONIALS VALIDATION
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_name_max_chars') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_name_max_chars CHECK (LENGTH(name) <= 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_name_max_words') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_name_max_words CHECK (word_count(name) <= 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_name_no_digits') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_name_no_digits CHECK (NOT contains_digits(name));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_degree_max_chars') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_degree_max_chars CHECK (LENGTH(degree) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_degree_max_words') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_degree_max_words CHECK (word_count(degree) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_institution_max_chars') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_institution_max_chars CHECK (LENGTH(institution) <= 150);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_institution_max_words') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_institution_max_words CHECK (word_count(institution) <= 25);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_quote_max_chars') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_quote_max_chars CHECK (LENGTH(quote) <= 300);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_quote_max_words') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_quote_max_words CHECK (word_count(quote) <= 60);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'it_year_format') THEN
    ALTER TABLE internship_testimonials ADD CONSTRAINT it_year_format CHECK (year ~ '^\d{4}$');
  END IF;
END $$;

-- ============================================
-- COMPLETE! 
-- All 13 admin panel sections are now ready
-- All tables have input validation constraints
-- Run this SQL in Supabase SQL Editor to apply constraints
-- ============================================