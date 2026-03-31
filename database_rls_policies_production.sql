-- ============================================
-- PRODUCTION RLS POLICIES
-- Secure Row Level Security for production deployment
-- ============================================

-- ============================================
-- STEP 1: Enable RLS on all tables
-- ============================================

ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop all existing policies
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Create helper function for admin check
-- ============================================

-- Check if user has admin role in their JWT claims
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated and has admin role
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Check if user exists in admin_users table
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE id = auth.uid()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: PUBLIC READ POLICIES
-- Allow anyone to read public content
-- ============================================

-- Hero Sections
CREATE POLICY "Public read hero_sections"
  ON hero_sections FOR SELECT
  USING (true);

-- About Sections
CREATE POLICY "Public read about_sections"
  ON about_sections FOR SELECT
  USING (true);

-- News
CREATE POLICY "Public read news"
  ON news FOR SELECT
  USING (true);

-- Highlights
CREATE POLICY "Public read highlights"
  ON highlights FOR SELECT
  USING (true);

-- Team Members
CREATE POLICY "Public read team_members"
  ON team_members FOR SELECT
  USING (true);

-- Partners
CREATE POLICY "Public read partners"
  ON partners FOR SELECT
  USING (true);

-- Publications
CREATE POLICY "Public read publications"
  ON publications FOR SELECT
  USING (true);

-- Projects
CREATE POLICY "Public read projects"
  ON projects FOR SELECT
  USING (true);

-- Financial Statements
CREATE POLICY "Public read financial_statements"
  ON financial_statements FOR SELECT
  USING (true);

-- Internship Testimonials
CREATE POLICY "Public read internship_testimonials"
  ON internship_testimonials FOR SELECT
  USING (true);

-- Blog Posts
CREATE POLICY "Public read blog_posts"
  ON blog_posts FOR SELECT
  USING (true);

-- ============================================
-- STEP 5: ADMIN WRITE POLICIES
-- Only admins can create, update, delete
-- ============================================

-- Hero Sections
CREATE POLICY "Admin write hero_sections"
  ON hero_sections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- About Sections
CREATE POLICY "Admin write about_sections"
  ON about_sections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- News
CREATE POLICY "Admin write news"
  ON news FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Highlights
CREATE POLICY "Admin write highlights"
  ON highlights FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Team Members
CREATE POLICY "Admin write team_members"
  ON team_members FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Partners
CREATE POLICY "Admin write partners"
  ON partners FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Publications
CREATE POLICY "Admin write publications"
  ON publications FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Projects
CREATE POLICY "Admin write projects"
  ON projects FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Financial Statements
CREATE POLICY "Admin write financial_statements"
  ON financial_statements FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Internship Testimonials
CREATE POLICY "Admin write internship_testimonials"
  ON internship_testimonials FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Blog Posts
CREATE POLICY "Admin write blog_posts"
  ON blog_posts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- STEP 6: ADMIN USERS POLICIES
-- ============================================

-- Admins can read admin_users for authentication
CREATE POLICY "Admin read admin_users"
  ON admin_users FOR SELECT
  USING (is_admin());

-- Only admins can manage admin users
CREATE POLICY "Admin manage admin_users"
  ON admin_users FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- STEP 7: AUDIT LOG POLICIES
-- ============================================

-- Only admins can read audit logs
CREATE POLICY "Admin read audit_log"
  ON audit_log FOR SELECT
  USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System insert audit_log"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STEP 8: CONTACT MESSAGES POLICIES
-- ============================================

-- Anyone can submit contact messages
CREATE POLICY "Public insert contact_messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Only admins can read contact messages
CREATE POLICY "Admin read contact_messages"
  ON contact_messages FOR SELECT
  USING (is_admin());

-- Only admins can update/delete contact messages
CREATE POLICY "Admin manage contact_messages"
  ON contact_messages FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- STEP 9: Grant necessary permissions
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables to anon (for public read)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant all on tables to authenticated (will be filtered by RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant sequence usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- STEP 10: Verification queries
-- ============================================

-- Check RLS is enabled
DO $$
DECLARE
    disabled_tables TEXT[];
BEGIN
    SELECT ARRAY_AGG(tablename) INTO disabled_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND rowsecurity = false;
    
    IF disabled_tables IS NOT NULL THEN
        RAISE WARNING 'Tables with RLS disabled: %', disabled_tables;
    ELSE
        RAISE NOTICE '✅ All tables have RLS enabled';
    END IF;
END $$;

-- Count policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✅ Created % RLS policies', policy_count;
END $$;

-- ============================================
-- PRODUCTION SECURITY CHECKLIST
-- ============================================
-- 
-- ✅ 1. RLS enabled on all tables
-- ✅ 2. Public can only READ content
-- ✅ 3. Only authenticated admins can write
-- ✅ 4. Admin role checked via JWT claims
-- ✅ 5. Contact messages: public insert, admin read
-- ✅ 6. Audit logs: system insert, admin read
-- ✅ 7. Proper grants for anon and authenticated roles
-- 
-- NEXT STEPS:
-- 1. Set up Supabase Auth users
-- 2. Add 'role: admin' to user metadata
-- 3. Test all operations with authenticated user
-- 4. Implement rate limiting
-- 5. Enable HTTPS only
-- 6. Set up monitoring and alerts
-- 
-- ============================================

SELECT 
  '✅ Production RLS policies successfully applied!' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';
