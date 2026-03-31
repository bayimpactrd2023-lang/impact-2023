-- ============================================
-- IMPACT R&D Database Test Data
-- Run this AFTER running database_schema.sql
-- ============================================

-- This script creates test data with cover images and gallery images
-- for all 13 admin panel sections to verify everything is working

-- ============================================
-- 1. HERO SECTION TEST DATA
-- ============================================
INSERT INTO hero_sections (title, subtitle, background_url)
VALUES (
  'IMPACT Research & Development',
  'Transforming Communities Through Research',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%231887FC;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%233b82f6;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad)" width="1200" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48" font-weight="bold"%3EHERO BACKGROUND%3C/text%3E%3C/svg%3E'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. ABOUT SECTION TEST DATA
-- ============================================
INSERT INTO about_sections (vision, mission, description)
VALUES (
  'To be the leading research and development organization in the Philippines.',
  'To conduct high-quality research that transforms communities and improves lives.',
  'IMPACT R&D is a non-profit organization dedicated to agricultural and community development research.'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. NEWS TEST DATA (with cover image + gallery)
-- ============================================
INSERT INTO news (title, content, date, image_url, images)
VALUES 
(
  'New Agricultural Research Project Launched',
  'IMPACT R&D has launched a new agricultural research project focusing on sustainable farming practices in rural communities.',
  CURRENT_DATE,
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231887FC" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="32" font-weight="bold"%3ENews Cover Image%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3EAgricultural Research%3C/text%3E%3C/svg%3E',
  ARRAY[
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%2334D399" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3EGallery Image 1%3C/text%3E%3C/svg%3E',
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23F59E0B" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3EGallery Image 2%3C/text%3E%3C/svg%3E'
  ]::text[]
),
(
  'Community Workshop on Sustainable Farming',
  'IMPACT R&D conducted a successful community workshop on sustainable farming practices attended by 50 local farmers.',
  CURRENT_DATE - INTERVAL '7 days',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%236366F1" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="32" font-weight="bold"%3EWorkshop Cover%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3ECommunity Event%3C/text%3E%3C/svg%3E',
  NULL
);

-- ============================================
-- 4. HIGHLIGHTS TEST DATA (with cover image + gallery)
-- ============================================
INSERT INTO highlights (title, description, content, image_url, images, icon_name, featured, published_date)
VALUES 
(
  'Agricultural Innovation Award',
  'IMPACT R&D received recognition for innovative farming solutions',
  'Our organization was honored with the Agricultural Innovation Award for developing sustainable farming techniques that have transformed rural communities.',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23F59E0B" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="32" font-weight="bold"%3EHighlight Cover%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3EInnovation Award%3C/text%3E%3C/svg%3E',
  ARRAY[
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23EC4899" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3EAward Ceremony%3C/text%3E%3C/svg%3E'
  ]::text[],
  'Award',
  true,
  CURRENT_DATE
);

-- ============================================
-- 5. TEAM MEMBERS TEST DATA (with profile photo)
-- ============================================
INSERT INTO team_members (name, role, description, image_url)
VALUES 
(
  'Dr. Maria Santos',
  'Executive Director',
  'Dr. Santos leads IMPACT R&D with over 20 years of experience in agricultural research and community development.',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Ccircle cx="200" cy="200" r="200" fill="%231887FC"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="80" font-weight="bold"%3EMS%3C/text%3E%3C/svg%3E'
),
(
  'Dr. Juan dela Cruz',
  'Research Director',
  'Dr. dela Cruz oversees all research projects and ensures the highest quality of scientific work.',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Ccircle cx="200" cy="200" r="200" fill="%2334D399"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="80" font-weight="bold"%3EJD%3C/text%3E%3C/svg%3E'
);

-- ============================================
-- 6. PARTNERS TEST DATA (with logo)
-- ============================================
INSERT INTO partners (name, logo_url, website, description)
VALUES 
(
  'Philippine Department of Agriculture',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%231887FC" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EDA%3C/text%3E%3C/svg%3E',
  'https://www.da.gov.ph',
  'Government partner supporting agricultural development initiatives'
),
(
  'USAID Philippines',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%2334D399" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-weight="bold"%3EUSAID%3C/text%3E%3C/svg%3E',
  'https://www.usaid.gov/philippines',
  'International development partner funding community projects'
);

-- ============================================
-- 7. PUBLICATIONS TEST DATA (no images)
-- ============================================
INSERT INTO publications (title, authors, content, excerpt, published_date, featured)
VALUES 
(
  'Sustainable Farming Practices in Rural Philippines',
  'Dr. Maria Santos, Dr. Juan dela Cruz',
  'This comprehensive study examines the impact of sustainable farming practices on rural communities in the Philippines.',
  'A groundbreaking study on sustainable agriculture in rural communities.',
  CURRENT_DATE,
  true
);

-- ============================================
-- 8. BLOG POSTS TEST DATA (with cover image + gallery)
-- ============================================
INSERT INTO blog_posts (title, content, author, author_role, date, image_url, images, likes)
VALUES 
(
  'The Future of Philippine Agriculture',
  'In this blog post, we explore emerging trends in Philippine agriculture and how technology is transforming farming practices.',
  'Dr. Maria Santos',
  'Executive Director',
  CURRENT_DATE,
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%238B5CF6" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="32" font-weight="bold"%3EBlog Cover%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3EFuture of Agriculture%3C/text%3E%3C/svg%3E',
  ARRAY[
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23EF4444" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3ETechnology in Farming%3C/text%3E%3C/svg%3E'
  ]::text[],
  15
);

-- ============================================
-- 9. PROJECTS TEST DATA (with cover image + gallery)
-- All 5 categories included
-- ============================================

-- Internationally Funded Project
INSERT INTO projects (title, description, category, context, objectives, methodology, date, image_url, images)
VALUES (
  'USAID Community Development Initiative',
  'A comprehensive community development project funded by USAID focusing on sustainable agriculture.',
  'internationally_funded',
  'This project addresses food security challenges in rural communities.',
  'Improve agricultural productivity and community resilience.',
  'Participatory action research with local farmers.',
  CURRENT_DATE,
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%231887FC" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="28" font-weight="bold"%3EProject Cover%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18"%3EInternational Funding%3C/text%3E%3C/svg%3E',
  ARRAY[
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%2310B981" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3EProject Gallery 1%3C/text%3E%3C/svg%3E'
  ]::text[]
);

-- Locally Funded Project
INSERT INTO projects (title, description, category, date, image_url)
VALUES (
  'Local Agricultural Cooperative Support',
  'Supporting local agricultural cooperatives with training and resources.',
  'locally_funded',
  CURRENT_DATE - INTERVAL '30 days',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%2334D399" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="28" font-weight="bold"%3ELocal Project%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18"%3ECommunity Support%3C/text%3E%3C/svg%3E'
);

-- Community Transformation Project
INSERT INTO projects (title, description, category, date, image_url)
VALUES (
  'Rural Community Empowerment Program',
  'Empowering rural communities through education and capacity building.',
  'community_transformation',
  CURRENT_DATE - INTERVAL '60 days',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23F59E0B" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="28" font-weight="bold"%3ETransformation%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18"%3ECommunity Impact%3C/text%3E%3C/svg%3E'
);

-- Study Findings Project
INSERT INTO projects (title, description, category, date, image_url)
VALUES (
  'Impact Assessment of Organic Farming',
  'Research findings on the economic impact of organic farming practices.',
  'study_findings',
  CURRENT_DATE - INTERVAL '90 days',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%238B5CF6" width="800" height="600"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="28" font-weight="bold"%3EStudy Findings%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18"%3EResearch Results%3C/text%3E%3C/svg%3E'
);

-- ============================================
-- 10. FINANCIAL STATEMENTS TEST DATA
-- ============================================
INSERT INTO financial_statements (title, year, image_url, images)
VALUES 
(
  'Annual Financial Report',
  '2024',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"%3E%3Crect fill="%231887FC" width="800" height="1000"/%3E%3Ctext x="50%25" y="40%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48" font-weight="bold"%3EFinancial%3C/text%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48" font-weight="bold"%3EStatement%3C/text%3E%3Ctext x="50%25" y="60%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="36"%3E2024%3C/text%3E%3C/svg%3E',
  ARRAY[
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"%3E%3Crect fill="%2334D399" width="800" height="1000"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3EPage 1: Income Statement%3C/text%3E%3C/svg%3E',
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"%3E%3Crect fill="%23F59E0B" width="800" height="1000"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3EPage 2: Balance Sheet%3C/text%3E%3C/svg%3E'
  ]::text[]
);

-- ============================================
-- 11. INTERNSHIP TESTIMONIALS TEST DATA
-- ============================================
INSERT INTO internship_testimonials (name, degree, institution, quote, full_text, year, published_date, image_url, images)
VALUES 
(
  'Juan Pedro',
  'BS Agriculture',
  'University of the Philippines Los Baños',
  'My internship at IMPACT R&D was a transformative experience that shaped my career.',
  'During my 3-month internship at IMPACT R&D, I gained hands-on experience in agricultural research and community development. The mentorship and learning opportunities were exceptional.',
  '2024',
  CURRENT_DATE,
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Ccircle cx="200" cy="200" r="200" fill="%236366F1"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="80" font-weight="bold"%3EJP%3C/text%3E%3C/svg%3E',
  ARRAY[
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23EC4899" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24"%3EInternship Photo%3C/text%3E%3C/svg%3E'
  ]::text[]
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables have data
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM hero_sections;
  RAISE NOTICE 'Hero Sections: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM about_sections;
  RAISE NOTICE 'About Sections: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM news;
  RAISE NOTICE 'News: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM highlights;
  RAISE NOTICE 'Highlights: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM team_members;
  RAISE NOTICE 'Team Members: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM partners;
  RAISE NOTICE 'Partners: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM publications;
  RAISE NOTICE 'Publications: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM blog_posts;
  RAISE NOTICE 'Blog Posts: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM projects;
  RAISE NOTICE 'Projects: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM financial_statements;
  RAISE NOTICE 'Financial Statements: % records', table_count;
  
  SELECT COUNT(*) INTO table_count FROM internship_testimonials;
  RAISE NOTICE 'Internship Testimonials: % records', table_count;
END $$;

-- Verify cover images exist
SELECT 
  'news' as table_name,
  COUNT(*) as total_records,
  COUNT(image_url) as records_with_cover_image
FROM news
UNION ALL
SELECT 
  'highlights',
  COUNT(*),
  COUNT(image_url)
FROM highlights
UNION ALL
SELECT 
  'blog_posts',
  COUNT(*),
  COUNT(image_url)
FROM blog_posts
UNION ALL
SELECT 
  'projects',
  COUNT(*),
  COUNT(image_url)
FROM projects
UNION ALL
SELECT 
  'financial_statements',
  COUNT(*),
  COUNT(image_url)
FROM financial_statements
UNION ALL
SELECT 
  'internship_testimonials',
  COUNT(*),
  COUNT(image_url)
FROM internship_testimonials;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Test data successfully inserted!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to your app at /admin';
  RAISE NOTICE '2. Check each section to see the test data';
  RAISE NOTICE '3. Try editing items and uploading new cover images';
  RAISE NOTICE '4. Verify that cover images save and persist';
  RAISE NOTICE '';
END $$;
