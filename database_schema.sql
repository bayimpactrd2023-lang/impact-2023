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
  image_url TEXT NOT NULL, -- Cover image
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

-- Create policies for anonymous access
-- Note: These policies allow anyone to read/write data using the public anon key
-- This is appropriate for demo/development. For production with sensitive data, implement authentication.

-- Hero Sections
DROP POLICY IF EXISTS "Allow public read access on hero_sections" ON hero_sections;
CREATE POLICY "Allow public read access on hero_sections" ON hero_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on hero_sections" ON hero_sections;
CREATE POLICY "Allow all access on hero_sections" ON hero_sections FOR ALL USING (true);

-- About Sections
DROP POLICY IF EXISTS "Allow public read access on about_sections" ON about_sections;
CREATE POLICY "Allow public read access on about_sections" ON about_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on about_sections" ON about_sections;
CREATE POLICY "Allow all access on about_sections" ON about_sections FOR ALL USING (true);

-- News
DROP POLICY IF EXISTS "Allow public read access on news" ON news;
CREATE POLICY "Allow public read access on news" ON news FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on news" ON news;
CREATE POLICY "Allow all access on news" ON news FOR ALL USING (true);

-- Highlights
DROP POLICY IF EXISTS "Allow public read access on highlights" ON highlights;
CREATE POLICY "Allow public read access on highlights" ON highlights FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on highlights" ON highlights;
CREATE POLICY "Allow all access on highlights" ON highlights FOR ALL USING (true);

-- Team Members
DROP POLICY IF EXISTS "Allow public read access on team_members" ON team_members;
CREATE POLICY "Allow public read access on team_members" ON team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on team_members" ON team_members;
CREATE POLICY "Allow all access on team_members" ON team_members FOR ALL USING (true);

-- Partners
DROP POLICY IF EXISTS "Allow public read access on partners" ON partners;
CREATE POLICY "Allow public read access on partners" ON partners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on partners" ON partners;
CREATE POLICY "Allow all access on partners" ON partners FOR ALL USING (true);

-- Publications
DROP POLICY IF EXISTS "Allow public read access on publications" ON publications;
CREATE POLICY "Allow public read access on publications" ON publications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on publications" ON publications;
CREATE POLICY "Allow all access on publications" ON publications FOR ALL USING (true);

-- Blog Posts
DROP POLICY IF EXISTS "Allow public read access on blog_posts" ON blog_posts;
CREATE POLICY "Allow public read access on blog_posts" ON blog_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on blog_posts" ON blog_posts;
CREATE POLICY "Allow all access on blog_posts" ON blog_posts FOR ALL USING (true);

-- Projects
DROP POLICY IF EXISTS "Allow public read access on projects" ON projects;
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on projects" ON projects;
CREATE POLICY "Allow all access on projects" ON projects FOR ALL USING (true);

-- Financial Statements
DROP POLICY IF EXISTS "Allow public read access on financial_statements" ON financial_statements;
CREATE POLICY "Allow public read access on financial_statements" ON financial_statements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on financial_statements" ON financial_statements;
CREATE POLICY "Allow all access on financial_statements" ON financial_statements FOR ALL USING (true);

-- Internship Testimonials
DROP POLICY IF EXISTS "Allow public read access on internship_testimonials" ON internship_testimonials;
CREATE POLICY "Allow public read access on internship_testimonials" ON internship_testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access on internship_testimonials" ON internship_testimonials;
CREATE POLICY "Allow all access on internship_testimonials" ON internship_testimonials FOR ALL USING (true);

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
-- COMPLETE! 
-- All 13 admin panel sections are now ready
-- All tables are empty and ready for your data
-- ============================================