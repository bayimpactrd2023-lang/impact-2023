-- Supabase Database Schema for Research Website
-- This script creates all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hero Sections Table
CREATE TABLE IF NOT EXISTS public.hero_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  background_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  image_url TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Highlights Table
CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  images TEXT[],
  icon_name TEXT NOT NULL,
  content TEXT,
  published_date TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners Table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publications Table
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  link TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  pdf_url TEXT,
  content TEXT,
  published_date TEXT,
  excerpt TEXT,
  sentence TEXT,
  optional_links TEXT,
  contact_info TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  images TEXT[],
  date TEXT,
  context TEXT,
  objectives TEXT,
  methodology TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Statements Table
CREATE TABLE IF NOT EXISTS public.financial_statements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  year TEXT NOT NULL,
  image_url TEXT NOT NULL,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internship Testimonials Table
CREATE TABLE IF NOT EXISTS public.internship_testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  quote TEXT NOT NULL,
  full_text TEXT NOT NULL,
  published_date TEXT NOT NULL,
  year TEXT NOT NULL,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_role TEXT NOT NULL,
  date TEXT NOT NULL,
  image_url TEXT,
  images TEXT[],
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data
-- Hero Section
INSERT INTO public.hero_sections (title, subtitle, background_url)
VALUES (
  'Advancing Research for Sustainable Development',
  'Empowering communities through innovative agricultural and development research',
  ''
) ON CONFLICT DO NOTHING;

-- Sample News Items
INSERT INTO public.news (title, content, date, image_url)
VALUES
  ('Research Symposium 2026', 'Join us for our annual research symposium showcasing the latest findings in sustainable agriculture and community development.', '2026-03-15', ''),
  ('New Partnership Announced', 'We are excited to announce a new partnership with international research institutions to advance sustainable farming practices.', '2026-02-28', ''),
  ('Community Workshop Success', 'Our recent community workshop on organic farming techniques was attended by over 100 local farmers.', '2026-02-10', '')
ON CONFLICT DO NOTHING;

-- Sample Highlights
INSERT INTO public.highlights (title, description, image_url, icon_name, content, published_date, featured)
VALUES
  ('Sustainable Farming', 'Innovative approaches to sustainable agriculture', '', 'Sprout', 'Our research focuses on developing sustainable farming practices that increase yield while protecting the environment.', '2026-01-15', true),
  ('Community Development', 'Empowering local communities through research', '', 'Users', 'We work directly with communities to implement research-driven development programs.', '2026-01-20', true)
ON CONFLICT DO NOTHING;

-- Sample Partners
INSERT INTO public.partners (name, logo_url)
VALUES
  ('International Agricultural Research Center', ''),
  ('National Science Foundation', ''),
  ('Community Development Institute', ''),
  ('Sustainable Farming Alliance', '')
ON CONFLICT DO NOTHING;

-- Sample Publications
INSERT INTO public.publications (title, authors, link, featured, published_date, excerpt)
VALUES
  ('Sustainable Rice Farming in Southeast Asia', 'Dr. Jane Smith, Dr. John Doe', '#', true, '2025-12-01', 'A comprehensive study on sustainable rice farming practices in Southeast Asian communities.'),
  ('Community-Based Agricultural Extension', 'Dr. Maria Garcia, Dr. Robert Chen', '#', true, '2025-11-15', 'Research on effective community-based agricultural extension programs.'),
  ('Climate-Resilient Crop Varieties', 'Dr. Ahmed Hassan, Dr. Lisa Wong', '#', false, '2025-10-20', 'Development and evaluation of climate-resilient crop varieties for smallholder farmers.')
ON CONFLICT DO NOTHING;

-- Sample Projects (Internationally Funded)
INSERT INTO public.projects (title, description, category, date, context, objectives)
VALUES
  ('Sustainable Agriculture Initiative', 'A multi-year project to develop sustainable farming practices', 'internationally_funded', '2025-06-01', 'Climate change and soil degradation pose significant threats to agricultural productivity.', 'Develop and implement sustainable farming practices that increase yield while protecting the environment.'),
  ('Rural Development Program', 'Comprehensive rural development and capacity building', 'internationally_funded', '2024-09-01', 'Rural communities lack access to modern agricultural techniques and resources.', 'Improve livelihoods through agricultural training and infrastructure development.')
ON CONFLICT DO NOTHING;

-- Sample Projects (Locally Funded)
INSERT INTO public.projects (title, description, category, date, context, objectives)
VALUES
  ('Local Farming Innovation', 'Supporting local farmers with new techniques', 'locally_funded', '2025-03-01', 'Local farmers need access to innovative farming techniques.', 'Provide training and resources for modern farming methods.'),
  ('Community Garden Project', 'Establishing community gardens in urban areas', 'locally_funded', '2025-01-15', 'Urban communities lack access to fresh produce.', 'Create sustainable community gardens in urban neighborhoods.')
ON CONFLICT DO NOTHING;

-- Sample Team Members
INSERT INTO public.team_members (name, role, description, image_url)
VALUES
  ('Dr. Sarah Johnson', 'Director', 'Dr. Johnson leads our research initiatives with over 20 years of experience in agricultural science.', ''),
  ('Dr. Michael Chen', 'Senior Researcher', 'Dr. Chen specializes in sustainable farming practices and community development.', ''),
  ('Dr. Emily Rodriguez', 'Research Coordinator', 'Dr. Rodriguez manages our research programs and community partnerships.', ''),
  ('Dr. David Kim', 'Agricultural Scientist', 'Dr. Kim focuses on crop development and climate-resilient agriculture.', '')
ON CONFLICT DO NOTHING;

-- Sample Blog Posts
INSERT INTO public.blog_posts (title, content, author, author_role, date, image_url, likes)
VALUES
  ('The Future of Sustainable Agriculture', 'Exploring innovative approaches to sustainable farming...', 'Dr. Sarah Johnson', 'Director', '2026-03-10', '', 42),
  ('Community Engagement in Research', 'How we work with local communities to drive meaningful change...', 'Dr. Michael Chen', 'Senior Researcher', '2026-03-05', '', 35),
  ('Climate Change and Agriculture', 'Understanding the impact of climate change on farming practices...', 'Dr. Emily Rodriguez', 'Research Coordinator', '2026-02-28', '', 28)
ON CONFLICT DO NOTHING;

-- Admin User
-- Password is hashed using bcrypt (plain text password: 12345678)
INSERT INTO public.admin_users (username, password_hash)
VALUES ('admin', '$2b$10$DDWEfotYdESiTTsy.U8O1O6S4T.zqAZQ/4ivfVheockH4I7ISd4ZS')
ON CONFLICT (username) DO UPDATE SET password_hash = '$2b$10$DDWEfotYdESiTTsy.U8O1O6S4T.zqAZQ/4ivfVheockH4I7ISd4ZS';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_date ON public.news(date DESC);
CREATE INDEX IF NOT EXISTS idx_highlights_published_date ON public.highlights(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_highlights_featured ON public.highlights(featured);
CREATE INDEX IF NOT EXISTS idx_publications_published_date ON public.publications(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_publications_featured ON public.publications(featured);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_date ON public.projects(date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_statements_year ON public.financial_statements(year DESC);
CREATE INDEX IF NOT EXISTS idx_internship_testimonials_year ON public.internship_testimonials(year DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make script idempotent)
DROP POLICY IF EXISTS "Allow public read access" ON public.hero_sections;
DROP POLICY IF EXISTS "Allow public read access" ON public.news;
DROP POLICY IF EXISTS "Allow public read access" ON public.highlights;
DROP POLICY IF EXISTS "Allow public read access" ON public.partners;
DROP POLICY IF EXISTS "Allow public read access" ON public.publications;
DROP POLICY IF EXISTS "Allow public read access" ON public.projects;
DROP POLICY IF EXISTS "Allow public read access" ON public.team_members;
DROP POLICY IF EXISTS "Allow public read access" ON public.blog_posts;

DROP POLICY IF EXISTS "Allow authenticated insert" ON public.hero_sections;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.hero_sections;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.news;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.news;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.news;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.highlights;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.highlights;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.highlights;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.partners;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.partners;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.partners;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.publications;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.publications;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.publications;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public read access" ON public.financial_statements;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.financial_statements;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.financial_statements;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.financial_statements;
DROP POLICY IF EXISTS "Allow public read access" ON public.internship_testimonials;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.internship_testimonials;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.internship_testimonials;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.internship_testimonials;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON public.hero_sections FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.news FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.highlights FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.publications FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.blog_posts FOR SELECT USING (true);

-- Create policies for authenticated admin write access (you'll need to configure auth later)
CREATE POLICY "Allow authenticated insert" ON public.hero_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.hero_sections FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated insert" ON public.news FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.news FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.news FOR DELETE USING (true);
CREATE POLICY "Allow authenticated insert" ON public.highlights FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.highlights FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.highlights FOR DELETE USING (true);
CREATE POLICY "Allow authenticated insert" ON public.partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.partners FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.partners FOR DELETE USING (true);
CREATE POLICY "Allow authenticated insert" ON public.publications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.publications FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.publications FOR DELETE USING (true);
CREATE POLICY "Allow authenticated insert" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.projects FOR DELETE USING (true);
CREATE POLICY "Allow authenticated insert" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.team_members FOR DELETE USING (true);
CREATE POLICY "Allow authenticated insert" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.blog_posts FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.blog_posts FOR DELETE USING (true);
CREATE POLICY "Allow insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read contact messages" ON public.contact_messages FOR SELECT USING (true);

-- Create policies for financial_statements
CREATE POLICY "Allow public read access" ON public.financial_statements FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.financial_statements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.financial_statements FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.financial_statements FOR DELETE USING (true);

-- Create policies for internship_testimonials
CREATE POLICY "Allow public read access" ON public.internship_testimonials FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.internship_testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.internship_testimonials FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON public.internship_testimonials FOR DELETE USING (true);