-- ============================================
-- IMPACT R&D Database Verification Script
-- Run this to diagnose database issues
-- ============================================

-- ============================================
-- 1. CHECK IF ALL TABLES EXIST
-- ============================================
SELECT 
  '✅ Tables Check' as check_type,
  COUNT(*) as table_count,
  CASE 
    WHEN COUNT(*) >= 11 THEN '✅ PASS - All tables exist'
    ELSE '❌ FAIL - Missing tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'hero_sections',
    'about_sections',
    'news',
    'highlights',
    'team_members',
    'partners',
    'publications',
    'blog_posts',
    'projects',
    'financial_statements',
    'internship_testimonials'
  );

-- List all actual tables
SELECT 
  '📋 Table List' as info,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 2. CHECK IMAGE COLUMNS EXIST
-- ============================================
SELECT 
  '🖼️ Image Columns' as info,
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN column_name IN ('image_url', 'logo_url', 'background_url') AND data_type = 'text' THEN '✅'
    WHEN column_name = 'images' AND data_type = 'ARRAY' THEN '✅'
    ELSE '⚠️'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('image_url', 'logo_url', 'images', 'background_url')
ORDER BY table_name, column_name;

-- ============================================
-- 3. CHECK RLS IS ENABLED
-- ============================================
SELECT 
  '🔒 RLS Status' as info,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'hero_sections',
    'about_sections',
    'news',
    'highlights',
    'team_members',
    'partners',
    'publications',
    'blog_posts',
    'projects',
    'financial_statements',
    'internship_testimonials'
  )
ORDER BY tablename;

-- ============================================
-- 4. CHECK RLS POLICIES EXIST
-- ============================================
SELECT 
  '🛡️ RLS Policies' as info,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ Has policies'
    ELSE '⚠️ Missing policies'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 5. CHECK TRIGGERS EXIST
-- ============================================
SELECT 
  '⚡ Triggers' as info,
  event_object_table as table_name,
  trigger_name,
  '✅' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;

-- ============================================
-- 6. COUNT RECORDS IN EACH TABLE
-- ============================================
DO $$
DECLARE
  rec RECORD;
  record_count INTEGER;
BEGIN
  RAISE NOTICE '📊 Record Counts:';
  RAISE NOTICE '';
  
  FOR rec IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN (
        'hero_sections',
        'about_sections',
        'news',
        'highlights',
        'team_members',
        'partners',
        'publications',
        'blog_posts',
        'projects',
        'financial_statements',
        'internship_testimonials'
      )
    ORDER BY table_name
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', rec.table_name) INTO record_count;
    RAISE NOTICE '   % : % records', 
      RPAD(rec.table_name, 30), 
      record_count;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ============================================
-- 7. CHECK COVER IMAGES EXIST
-- ============================================
SELECT 
  '🖼️ Cover Images Status' as info,
  'news' as table_name,
  COUNT(*) as total_records,
  COUNT(image_url) as has_cover_image,
  COUNT(images) as has_gallery,
  CASE 
    WHEN COUNT(image_url) > 0 THEN '✅'
    ELSE '⚠️ No cover images'
  END as status
FROM news
UNION ALL
SELECT 
  '🖼️ Cover Images Status',
  'highlights',
  COUNT(*),
  COUNT(image_url),
  COUNT(images),
  CASE WHEN COUNT(image_url) > 0 THEN '✅' ELSE '⚠️' END
FROM highlights
UNION ALL
SELECT 
  '🖼️ Cover Images Status',
  'team_members',
  COUNT(*),
  COUNT(image_url),
  0,
  CASE WHEN COUNT(image_url) > 0 THEN '✅' ELSE '⚠️' END
FROM team_members
UNION ALL
SELECT 
  '🖼️ Cover Images Status',
  'partners (logo)',
  COUNT(*),
  COUNT(logo_url),
  0,
  CASE WHEN COUNT(logo_url) > 0 THEN '✅' ELSE '⚠️' END
FROM partners
UNION ALL
SELECT 
  '🖼️ Cover Images Status',
  'blog_posts',
  COUNT(*),
  COUNT(image_url),
  COUNT(images),
  CASE WHEN COUNT(image_url) > 0 THEN '✅' ELSE '⚠️' END
FROM blog_posts
UNION ALL
SELECT 
  '🖼️ Cover Images Status',
  'projects',
  COUNT(*),
  COUNT(image_url),
  COUNT(images),
  CASE WHEN COUNT(image_url) > 0 THEN '✅' ELSE '⚠️' END
FROM projects
UNION ALL
SELECT 
  '🖼️ Cover Images Status',
  'financial_statements',
  COUNT(*),
  COUNT(image_url),
  COUNT(images),
  CASE WHEN COUNT(image_url) > 0 THEN '✅' ELSE '⚠️' END
FROM financial_statements
UNION ALL
SELECT 
  '🖼️ Cover Images Status',
  'internship_testimonials',
  COUNT(*),
  COUNT(image_url),
  COUNT(images),
  CASE WHEN COUNT(image_url) > 0 THEN '✅' ELSE '⚠️' END
FROM internship_testimonials;

-- ============================================
-- 8. SAMPLE DATA CHECK
-- ============================================
SELECT 
  '📝 Sample News Record' as info,
  id,
  title,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Has cover'
    ELSE '❌ No cover'
  END as cover_status,
  CASE 
    WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN '✅ Has gallery'
    ELSE '⚠️ No gallery'
  END as gallery_status,
  created_at
FROM news
ORDER BY created_at DESC
LIMIT 3;

SELECT 
  '📝 Sample Highlight Record' as info,
  id,
  title,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Has cover'
    ELSE '❌ No cover'
  END as cover_status,
  CASE 
    WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN '✅ Has gallery'
    ELSE '⚠️ No gallery'
  END as gallery_status,
  created_at
FROM highlights
ORDER BY created_at DESC
LIMIT 3;

-- ============================================
-- 9. CHECK INDEXES
-- ============================================
SELECT 
  '📇 Indexes' as info,
  tablename,
  indexname,
  '✅' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'news',
    'highlights',
    'team_members',
    'partners',
    'publications',
    'blog_posts',
    'projects',
    'financial_statements',
    'internship_testimonials'
  )
ORDER BY tablename, indexname;

-- ============================================
-- 10. FINAL HEALTH CHECK SUMMARY
-- ============================================
DO $$
DECLARE
  tables_count INTEGER;
  triggers_count INTEGER;
  policies_count INTEGER;
  news_count INTEGER;
  news_with_images INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO tables_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'hero_sections', 'about_sections', 'news', 'highlights',
      'team_members', 'partners', 'publications', 'blog_posts',
      'projects', 'financial_statements', 'internship_testimonials'
    );
  
  -- Count triggers
  SELECT COUNT(*) INTO triggers_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'update_%_updated_at';
  
  -- Count policies
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Check sample data
  SELECT COUNT(*) INTO news_count FROM news;
  SELECT COUNT(image_url) INTO news_with_images FROM news;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔══════════════════════════════════════════════════╗';
  RAISE NOTICE '║         DATABASE HEALTH CHECK SUMMARY            ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- Tables check
  IF tables_count = 11 THEN
    RAISE NOTICE '✅ Tables: %/11 (ALL PRESENT)', tables_count;
  ELSE
    RAISE NOTICE '❌ Tables: %/11 (MISSING TABLES)', tables_count;
  END IF;
  
  -- Triggers check
  IF triggers_count >= 11 THEN
    RAISE NOTICE '✅ Triggers: %/11 (ALL PRESENT)', triggers_count;
  ELSE
    RAISE NOTICE '⚠️  Triggers: %/11 (SOME MISSING)', triggers_count;
  END IF;
  
  -- Policies check
  IF policies_count >= 22 THEN
    RAISE NOTICE '✅ RLS Policies: % (CONFIGURED)', policies_count;
  ELSE
    RAISE NOTICE '⚠️  RLS Policies: % (INCOMPLETE)', policies_count;
  END IF;
  
  -- Data check
  IF news_count > 0 THEN
    RAISE NOTICE '✅ Sample Data: % news records', news_count;
    IF news_with_images > 0 THEN
      RAISE NOTICE '✅ Cover Images: %/% news have cover images', news_with_images, news_count;
    ELSE
      RAISE NOTICE '⚠️  Cover Images: No cover images found in news';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Sample Data: No data found (run database_test_data.sql)';
  END IF;
  
  RAISE NOTICE '';
  
  -- Overall status
  IF tables_count = 11 AND triggers_count >= 11 AND policies_count >= 22 THEN
    RAISE NOTICE '╔══════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ DATABASE IS FULLY CONFIGURED AND HEALTHY!   ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════╝';
  ELSE
    RAISE NOTICE '╔══════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ⚠️  DATABASE NEEDS ATTENTION - CHECK ABOVE     ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════╝';
  END IF;
  
  RAISE NOTICE '';
END $$;
