-- ============================================
-- MIGRATION: Fix Storage Bucket Permissions
-- Run this in Supabase SQL Editor
-- ============================================

-- Fix Storage Bucket RLS Policies
-- Storage policies are separate from table RLS policies

-- 1. Enable public access for storage buckets (or use authenticated-only)
-- Option A: Public read, authenticated write (for open sites)
-- Option B: Authenticated only (for admin-only sites)

-- For this implementation, we'll use Option A with authenticated write access

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create the 'images' bucket if it doesn't exist (this is our fallback bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images', 
    'images', 
    true, 
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];

-- Create other buckets as needed
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('news', 'news', true),
    ('blog', 'blog', true),
    ('projects', 'projects', true),
    ('highlights', 'highlights', true),
    ('team', 'team', true),
    ('partners', 'partners', true),
    ('publications', 'publications', true),
    ('testimonials', 'testimonials', true),
    ('pdfs', 'pdfs', true),
    ('financial', 'financial', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Drop existing storage policies for all buckets
DO $$
DECLARE
    bucket_record RECORD;
    policy_name TEXT;
BEGIN
    FOR bucket_record IN SELECT name FROM storage.buckets LOOP
        -- Drop read policies
        FOR policy_name IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND policyname LIKE '%' || bucket_record.name || '%'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
        END LOOP;
    END LOOP;
END $$;

-- Create storage policies for 'images' bucket (fallback bucket)
-- Public can read
CREATE POLICY "Public can read from images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated can upload to images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated can update images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated can delete from images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'images');

-- ============================================
-- ALTERNATIVE: Allow anonymous uploads (less secure)
-- Uncomment below if you want anonymous uploads
-- ============================================
/*
CREATE POLICY "Anonymous can upload to images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anonymous can update images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images');

CREATE POLICY "Anonymous can delete from images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images');
*/

-- ============================================
-- VERIFICATION QUERIES (run these to check)
-- ============================================
-- Check buckets:
-- SELECT * FROM storage.buckets;

-- Check storage policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage';

-- ============================================
-- NOTES:
-- - 50MB file size limit is set
-- - Only images and PDFs are allowed
-- - Public can view all files
-- - Only authenticated users can upload/modify/delete
-- - For anonymous uploads (no login required), uncomment the section above
-- ============================================
