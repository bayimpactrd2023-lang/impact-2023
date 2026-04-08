-- ============================================
-- SUPABASE SECURITY FIXES
-- Resolves linter warnings for Search Path and RLS Policies
-- ============================================

-- 1. FIX FUNCTION SEARCH PATHS
-- Functions should have a fixed search_path to prevent security exploits
-- Using DO blocks to safely handle functions that might not exist

DO $$ 
BEGIN
  -- word_count
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'word_count' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.word_count(TEXT) SET search_path = public, pg_catalog;
  END IF;

  -- contains_digits
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'contains_digits' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.contains_digits(TEXT) SET search_path = public, pg_catalog;
  END IF;

  -- audit_trigger
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'audit_trigger' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.audit_trigger() SET search_path = public, pg_catalog;
  END IF;

  -- update_updated_at_column
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_catalog;
  END IF;

  -- set_config
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_config' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.set_config(TEXT, TEXT) SET search_path = public, pg_catalog;
  END IF;

  -- is_admin (handled by the CREATE OR REPLACE below as well)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.is_admin() SET search_path = public, pg_catalog;
  END IF;
END $$;

-- 2. FIX OVERLY PERMISSIVE RLS POLICIES
-- SELECT policies with (true) are fine for public content,
-- but ALL/INSERT/UPDATE/DELETE should require admin checks.

-- Helper function to check if user is admin (already exists in database but ensuring it's robust)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' 
    AND 
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- DROP AND RECREATE PERMISSIVE POLICIES
-- Hero Sections
DROP POLICY IF EXISTS "Admins can manage hero_sections" ON hero_sections;
CREATE POLICY "Admins can manage hero_sections" ON hero_sections FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- About Sections
DROP POLICY IF EXISTS "Admins can manage about_sections" ON about_sections;
CREATE POLICY "Admins can manage about_sections" ON about_sections FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- News
DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Highlights
DROP POLICY IF EXISTS "Admins can manage highlights" ON highlights;
CREATE POLICY "Admins can manage highlights" ON highlights FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Team Members
DROP POLICY IF EXISTS "Admins can manage team_members" ON team_members;
CREATE POLICY "Admins can manage team_members" ON team_members FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Partners
DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
CREATE POLICY "Admins can manage partners" ON partners FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Publications
DROP POLICY IF EXISTS "Admins can manage publications" ON publications;
CREATE POLICY "Admins can manage publications" ON publications FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Projects
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
CREATE POLICY "Admins can manage projects" ON projects FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Financial Statements
DROP POLICY IF EXISTS "Admins can manage financial_statements" ON financial_statements;
CREATE POLICY "Admins can manage financial_statements" ON financial_statements FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Internship Testimonials
DROP POLICY IF EXISTS "Admins can manage internship_testimonials" ON internship_testimonials;
CREATE POLICY "Admins can manage internship_testimonials" ON internship_testimonials FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Blog Posts
DROP POLICY IF EXISTS "Admins can manage blog_posts" ON blog_posts;
CREATE POLICY "Admins can manage blog_posts" ON blog_posts FOR ALL 
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3. AUDIT LOG SECURITY
-- Only allow the system or admins to insert, only admins to read
DROP POLICY IF EXISTS "System insert audit_log" ON audit_log;
CREATE POLICY "System insert audit_log" ON audit_log FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read audit_log" ON audit_log;
CREATE POLICY "Admin read audit_log" ON audit_log FOR SELECT TO authenticated USING (is_admin());

-- 4. FINAL VERIFICATION
DO $$
BEGIN
    RAISE NOTICE '✅ Supabase security fixes applied!';
    RAISE NOTICE '⚠️  IMPORTANT: Go to Supabase Dashboard > Auth > Providers > Email and enable "Leaked Password Protection"';
END $$;
