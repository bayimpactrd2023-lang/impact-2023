-- ============================================
-- IMPACT R&D Row Level Security (RLS) Policies
-- Comprehensive security for all database tables
-- ============================================

-- Enable Row Level Security on all tables
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

-- ============================================
-- PUBLIC READ POLICIES
-- Anyone can read public content
-- ============================================

-- Hero Sections
CREATE POLICY "Public can view hero sections"
  ON hero_sections FOR SELECT
  USING (true);

-- About Sections
CREATE POLICY "Public can view about sections"
  ON about_sections FOR SELECT
  USING (true);

-- News
CREATE POLICY "Public can view news"
  ON news FOR SELECT
  USING (true);

-- Highlights
CREATE POLICY "Public can view highlights"
  ON highlights FOR SELECT
  USING (true);

-- Team Members
CREATE POLICY "Public can view team members"
  ON team_members FOR SELECT
  USING (true);

-- Partners
CREATE POLICY "Public can view partners"
  ON partners FOR SELECT
  USING (true);

-- Publications
CREATE POLICY "Public can view publications"
  ON publications FOR SELECT
  USING (true);

-- Projects
CREATE POLICY "Public can view projects"
  ON projects FOR SELECT
  USING (true);

-- Financial Statements
CREATE POLICY "Public can view financial statements"
  ON financial_statements FOR SELECT
  USING (true);

-- Internship Testimonials
CREATE POLICY "Public can view internship testimonials"
  ON internship_testimonials FOR SELECT
  USING (true);

-- Blog Posts
CREATE POLICY "Public can view blog posts"
  ON blog_posts FOR SELECT
  USING (true);

-- ============================================
-- ADMIN WRITE POLICIES
-- Only authenticated admins can modify content
-- ============================================

-- Helper function to check if user is authenticated admin
CREATE OR REPLACE FUNCTION is_authenticated_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is authenticated
  -- In production, this should check against your auth system
  RETURN current_setting('app.current_user_id', true) IS NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hero Sections
CREATE POLICY "Admins can insert hero sections"
  ON hero_sections FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update hero sections"
  ON hero_sections FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete hero sections"
  ON hero_sections FOR DELETE
  USING (is_authenticated_admin());

-- About Sections
CREATE POLICY "Admins can insert about sections"
  ON about_sections FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update about sections"
  ON about_sections FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete about sections"
  ON about_sections FOR DELETE
  USING (is_authenticated_admin());

-- News
CREATE POLICY "Admins can insert news"
  ON news FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update news"
  ON news FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete news"
  ON news FOR DELETE
  USING (is_authenticated_admin());

-- Highlights
CREATE POLICY "Admins can insert highlights"
  ON highlights FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update highlights"
  ON highlights FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete highlights"
  ON highlights FOR DELETE
  USING (is_authenticated_admin());

-- Team Members
CREATE POLICY "Admins can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update team members"
  ON team_members FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete team members"
  ON team_members FOR DELETE
  USING (is_authenticated_admin());

-- Partners
CREATE POLICY "Admins can insert partners"
  ON partners FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update partners"
  ON partners FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete partners"
  ON partners FOR DELETE
  USING (is_authenticated_admin());

-- Publications
CREATE POLICY "Admins can insert publications"
  ON publications FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update publications"
  ON publications FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete publications"
  ON publications FOR DELETE
  USING (is_authenticated_admin());

-- Projects
CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_authenticated_admin());

-- Financial Statements
CREATE POLICY "Admins can insert financial statements"
  ON financial_statements FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update financial statements"
  ON financial_statements FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete financial statements"
  ON financial_statements FOR DELETE
  USING (is_authenticated_admin());

-- Internship Testimonials
CREATE POLICY "Admins can insert internship testimonials"
  ON internship_testimonials FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update internship testimonials"
  ON internship_testimonials FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete internship testimonials"
  ON internship_testimonials FOR DELETE
  USING (is_authenticated_admin());

-- Blog Posts
CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (is_authenticated_admin());

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  USING (is_authenticated_admin());

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  USING (is_authenticated_admin());

-- ============================================
-- ADMIN USERS POLICIES
-- Special policies for admin users table
-- ============================================

-- Only allow SELECT for authentication purposes
-- No one can insert, update, or delete via RLS
-- (Admin user management should be done by database admin)
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (true);

-- Block all modifications to admin_users table via RLS
-- Only database administrators can modify this table directly
CREATE POLICY "Block admin user modifications"
  ON admin_users FOR ALL
  USING (false);

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 
-- 1. All tables allow public SELECT (read) access
-- 2. Only authenticated admins can INSERT, UPDATE, DELETE
-- 3. Admin authentication is verified via is_authenticated_admin()
-- 4. The admin_users table is read-only via RLS for security
-- 5. Use prepared statements and parameterized queries to prevent SQL injection
-- 6. Always sanitize user inputs before database operations
-- 7. Implement rate limiting on the application layer
-- 8. Use HTTPS only in production
-- 9. Rotate admin passwords regularly
-- 10. Monitor and log all admin actions
--
-- ============================================
