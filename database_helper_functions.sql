-- ============================================
-- IMPACT R&D Database Helper Functions
-- Supporting functions for RLS and security
-- ============================================

-- ============================================
-- 1. SET_CONFIG FUNCTION
-- Required for setting session variables for RLS
-- ============================================

CREATE OR REPLACE FUNCTION set_config(
  setting text,
  value text
)
RETURNS text AS $$
BEGIN
  -- Set the configuration parameter
  PERFORM set_config(setting, value, false);
  RETURN value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_config(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION set_config(text, text) TO anon;

-- ============================================
-- 2. IS_AUTHENTICATED_ADMIN FUNCTION
-- Checks if current user is authenticated admin
-- ============================================

CREATE OR REPLACE FUNCTION is_authenticated_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is authenticated
  -- by verifying the session variable is set
  RETURN current_setting('app.current_user_id', true) IS NOT NULL 
    AND current_setting('app.current_user_id', true) != '';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. UPDATE_UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. APPLY UPDATE_AT TRIGGERS TO ALL TABLES
-- ============================================

-- Hero Sections
DROP TRIGGER IF EXISTS update_hero_sections_updated_at ON hero_sections;
CREATE TRIGGER update_hero_sections_updated_at
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- About Sections
DROP TRIGGER IF EXISTS update_about_sections_updated_at ON about_sections;
CREATE TRIGGER update_about_sections_updated_at
  BEFORE UPDATE ON about_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- News
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Highlights
DROP TRIGGER IF EXISTS update_highlights_updated_at ON highlights;
CREATE TRIGGER update_highlights_updated_at
  BEFORE UPDATE ON highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Team Members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Partners
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Publications
DROP TRIGGER IF EXISTS update_publications_updated_at ON publications;
CREATE TRIGGER update_publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Financial Statements
DROP TRIGGER IF EXISTS update_financial_statements_updated_at ON financial_statements;
CREATE TRIGGER update_financial_statements_updated_at
  BEFORE UPDATE ON financial_statements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Internship Testimonials
DROP TRIGGER IF EXISTS update_internship_testimonials_updated_at ON internship_testimonials;
CREATE TRIGGER update_internship_testimonials_updated_at
  BEFORE UPDATE ON internship_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Blog Posts
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. AUDIT LOG FUNCTION (Optional)
-- Logs all admin actions for security auditing
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- Generic audit function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val TEXT;
BEGIN
  -- Get current user ID from session variable
  user_id_val := current_setting('app.current_user_id', true);
  
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (table_name, operation, user_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, user_id_val, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, user_id_val, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (table_name, operation, user_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, user_id_val, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. APPLY AUDIT TRIGGERS (Optional - Uncomment to enable)
-- ============================================

-- To enable audit logging, uncomment the following triggers:

/*
-- News
DROP TRIGGER IF EXISTS audit_news ON news;
CREATE TRIGGER audit_news
  AFTER INSERT OR UPDATE OR DELETE ON news
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Highlights
DROP TRIGGER IF EXISTS audit_highlights ON highlights;
CREATE TRIGGER audit_highlights
  AFTER INSERT OR UPDATE OR DELETE ON highlights
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Partners
DROP TRIGGER IF EXISTS audit_partners ON partners;
CREATE TRIGGER audit_partners
  AFTER INSERT OR UPDATE OR DELETE ON partners
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Publications
DROP TRIGGER IF EXISTS audit_publications ON publications;
CREATE TRIGGER audit_publications
  AFTER INSERT OR UPDATE OR DELETE ON publications
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Projects
DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Team Members
DROP TRIGGER IF EXISTS audit_team_members ON team_members;
CREATE TRIGGER audit_team_members
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Blog Posts
DROP TRIGGER IF EXISTS audit_blog_posts ON blog_posts;
CREATE TRIGGER audit_blog_posts
  AFTER INSERT OR UPDATE OR DELETE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Financial Statements
DROP TRIGGER IF EXISTS audit_financial_statements ON financial_statements;
CREATE TRIGGER audit_financial_statements
  AFTER INSERT OR UPDATE OR DELETE ON financial_statements
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Internship Testimonials
DROP TRIGGER IF EXISTS audit_internship_testimonials ON internship_testimonials;
CREATE TRIGGER audit_internship_testimonials
  AFTER INSERT OR UPDATE OR DELETE ON internship_testimonials
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
*/

-- ============================================
-- 7. UTILITY FUNCTIONS
-- ============================================

-- Get audit log for a specific table
CREATE OR REPLACE FUNCTION get_audit_log(
  p_table_name TEXT,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  operation TEXT,
  user_id TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    audit_log.id,
    audit_log.operation,
    audit_log.user_id,
    audit_log.old_data,
    audit_log.new_data,
    audit_log.created_at
  FROM audit_log
  WHERE audit_log.table_name = p_table_name
  ORDER BY audit_log.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUMMARY
-- ============================================
-- 
-- This file includes:
-- 1. set_config() - For setting session variables
-- 2. is_authenticated_admin() - For RLS policy checks
-- 3. update_updated_at_column() - Auto-update timestamps
-- 4. Audit logging system (optional)
-- 5. Utility functions
--
-- Run this file AFTER database_schema.sql and BEFORE database_rls_policies.sql
-- ============================================
