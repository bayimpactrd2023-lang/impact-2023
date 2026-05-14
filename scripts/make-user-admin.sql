-- =====================================================
-- Make User Admin Script
-- Run this in Supabase SQL Editor to grant admin access
-- =====================================================

-- Option 1: Make a specific user an admin by email
-- UPDATE auth.users
-- SET raw_app_meta_data = 
--   COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
-- WHERE email = 'your-email@example.com';

-- Option 2: Make the first user an admin (useful for initial setup)
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
WHERE id = (
  SELECT id FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Verify the admin was set
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE raw_app_meta_data->>'role' = 'admin';
