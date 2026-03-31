# ⚙️ Supabase Production Optimization Settings

## Critical Settings to Configure Before Going Live

---

## 1. 🗄️ Database Settings

### Connection Pooling
```sql
-- In Supabase Dashboard → Settings → Database

-- Session Mode (default, good for most apps)
-- Transaction Mode (use if you have many short queries)
-- Statement Mode (highest performance, but limited features)

-- Recommended: Transaction Mode for this app
```

### Indexes for Performance

Add these indexes to speed up common queries:

```sql
-- News table
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- Highlights table
CREATE INDEX IF NOT EXISTS idx_highlights_published_date ON highlights(published_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_highlights_featured ON highlights(featured) WHERE featured = true;

-- Publications table
CREATE INDEX IF NOT EXISTS idx_publications_published_date ON publications(published_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_publications_featured ON publications(featured) WHERE featured = true;

-- Blog posts table
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);

-- Projects table
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date DESC NULLS LAST);

-- Team members table
CREATE INDEX IF NOT EXISTS idx_team_members_name ON team_members(name);

-- Partners table
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);

-- Financial statements table
CREATE INDEX IF NOT EXISTS idx_financial_year ON financial_statements(year DESC);

-- Internship testimonials table
CREATE INDEX IF NOT EXISTS idx_testimonials_published_date ON internship_testimonials(published_date DESC NULLS LAST);
```

### Vacuum & Analyze (Keep Database Healthy)

```sql
-- Run this weekly or enable auto-vacuum
VACUUM ANALYZE news;
VACUUM ANALYZE highlights;
VACUUM ANALYZE publications;
VACUUM ANALYZE blog_posts;
VACUUM ANALYZE projects;
VACUUM ANALYZE team_members;
VACUUM ANALYZE partners;
VACUUM ANALYZE financial_statements;
VACUUM ANALYZE internship_testimonials;
```

---

## 2. 🔒 Security Settings

### Enable RLS on All Tables

```sql
-- Already done in database_rls_policies_production.sql
-- Verify with:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show rowsecurity = true
```

### Rate Limiting (Supabase Dashboard)

Go to: **Settings → API → Rate Limiting**

Recommended settings:
- **Anonymous requests**: 100 requests per hour per IP
- **Authenticated requests**: 300 requests per hour per user
- **Enable email rate limiting**: 10 emails per hour

### Enable Point-in-Time Recovery (PITR)

Go to: **Settings → Database → Point in Time Recovery**
- Enable 7-day recovery window
- Cost: ~$0.125/GB per month (worth it for production!)

---

## 3. 📊 Performance & Monitoring

### Enable Statement Stats

```sql
-- View slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Set Up Alerts

Go to: **Settings → Billing → Usage Alerts**

Set alerts at:
- **80% of egress quota** (40 GB for free tier)
- **90% of egress quota** (45 GB for free tier)
- **80% of database size quota** (400 MB for free tier)

### Monitor in Real-Time

Bookmark this URL:
```
https://app.supabase.com/project/[YOUR_PROJECT_ID]/reports
```

Watch these metrics:
- **API requests per hour**
- **Database egress (outbound traffic)**
- **Database size**
- **Connection pool usage**

---

## 4. 🖼️ Storage Optimization (When You Migrate from Base64)

### Create Storage Buckets

```javascript
// In Supabase Dashboard → Storage

// Create these buckets:
1. "images" - for news, highlights, projects images
2. "logos" - for partner logos
3. "team-photos" - for team member photos
4. "pdfs" - for publications and financial statements
```

### Set Bucket Policies

```sql
-- Public read access for images
CREATE POLICY "Public read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Only admins can upload/delete
CREATE POLICY "Admin write images"
ON storage.objects FOR ALL
USING (bucket_id = 'images' AND is_admin());

-- Same for other buckets...
```

### Storage Bucket Settings

For each bucket:
- **Max file size**: 5 MB for images, 20 MB for PDFs
- **Allowed file types**: 
  - Images: `image/jpeg, image/png, image/webp, image/avif`
  - PDFs: `application/pdf`
- **Enable transformations**: Yes (for on-the-fly resizing)

### Image Transformation Usage

```typescript
// Example: Get optimized image URL
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('news/image123.jpg', {
    transform: {
      width: 800,
      height: 600,
      resize: 'cover',
      format: 'webp',
      quality: 80,
    }
  });
```

---

## 5. 💾 Caching Headers (Already Configured)

Verify in Netlify.toml:

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 6. 🔧 Environment Variables

### Required for Production

Create `.env.production` file:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0

# Optional: Error tracking
VITE_SENTRY_DSN=your-sentry-dsn-here

# Optional: Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Netlify Environment Variables

Add these in: **Netlify → Site Settings → Environment Variables**

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

⚠️ **NEVER** commit the `.env.production` file to Git!

---

## 7. 📈 Performance Budgets

### Target Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Bundle Size**: < 300 KB (gzipped)
- **API Response Time**: < 200ms (cached), < 500ms (fresh)

### Lighthouse Scores (Minimum)

- **Performance**: > 85
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 90

Run Lighthouse:
```bash
npm run build
npx lighthouse https://your-site.com --view
```

---

## 8. 🧪 Load Testing

### Test with Apache Bench

```bash
# Test homepage with 100 concurrent users
ab -n 1000 -c 100 https://your-site.com/

# Test API endpoint
ab -n 500 -c 50 https://your-site.com/api/news

# Expected results:
# - Requests per second: > 50
# - Mean response time: < 500ms
# - Failed requests: 0
```

### Test Cache Performance

```javascript
// In browser console
console.time('First Load');
await fetch('/api/news'); // Should take 200-500ms
console.timeEnd('First Load');

console.time('Cached Load');
await fetch('/api/news'); // Should take < 50ms
console.timeEnd('Cached Load');
```

---

## 9. 🔍 Database Query Optimization

### Explain Analyze Slow Queries

```sql
-- Check query performance
EXPLAIN ANALYZE 
SELECT id, title, date, image_url 
FROM news 
ORDER BY date DESC 
LIMIT 10;

-- Should use index scan (idx_news_date)
-- Total time should be < 10ms
```

### Common Query Patterns to Optimize

```sql
-- ❌ BAD: Select all columns
SELECT * FROM news;

-- ✅ GOOD: Select only needed columns
SELECT id, title, date, image_url FROM news;

-- ❌ BAD: No limit on large tables
SELECT * FROM blog_posts ORDER BY date DESC;

-- ✅ GOOD: Always use LIMIT for pagination
SELECT id, title FROM blog_posts ORDER BY date DESC LIMIT 20 OFFSET 0;

-- ❌ BAD: Functions in WHERE clause (can't use indexes)
SELECT * FROM news WHERE LOWER(title) = 'test';

-- ✅ GOOD: Direct column comparison
SELECT * FROM news WHERE title = 'Test';
```

---

## 10. 🚀 CDN Configuration (Optional but Recommended)

### Cloudflare Setup

1. Sign up for Cloudflare (free tier)
2. Point your domain to Cloudflare nameservers
3. Enable these features:
   - **Auto Minify**: JS, CSS, HTML
   - **Brotli compression**: Enabled
   - **Cache Level**: Standard
   - **Browser Cache TTL**: 4 hours
   - **Always Online**: Enabled

### Cloudflare Page Rules

```
Pattern: yoursite.com/static/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month

Pattern: yoursite.com/api/*
Settings:
- Cache Level: Bypass
```

---

## 11. 📱 Mobile Optimization

### Responsive Images

```typescript
// Use srcset for responsive images
<img
  src={optimizeImageUrl(image, { width: 800 })}
  srcSet={`
    ${optimizeImageUrl(image, { width: 400 })} 400w,
    ${optimizeImageUrl(image, { width: 800 })} 800w,
    ${optimizeImageUrl(image, { width: 1200 })} 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="..."
  loading="lazy"
/>
```

### Lazy Loading

```typescript
// Add to all images below the fold
<img
  src={imageUrl}
  alt="..."
  loading="lazy" // Browser-native lazy loading
/>
```

---

## 12. 🔐 Security Hardening

### Content Security Policy

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      frame-ancestors 'none';
    """
```

### Enable HTTPS Only

In Supabase Dashboard:
- **Settings → API → API Settings**
- Check "Enforce SSL for database connections"
- Check "Require HTTPS for API requests"

---

## 13. 💰 Cost Optimization Checklist

- [x] Client-side caching enabled (cache.ts)
- [x] Request deduplication (prevents duplicate API calls)
- [x] Field selection optimization (only fetch needed columns)
- [x] Image optimization with transformations
- [ ] Migrate from Base64 to Storage (99% cost saving!)
- [ ] Image compression before upload
- [x] Stale-while-revalidate pattern
- [ ] CDN for static assets
- [x] Database indexes for common queries
- [ ] Connection pooling configured
- [ ] Auto-vacuum enabled

**Expected Savings**: 95-99% reduction in egress costs

---

## 14. 📊 Monthly Cost Estimate (After All Optimizations)

### Current Setup (Base64 + Basic Caching)
- **1,000 users/month**: ~$15-20
- **5,000 users/month**: ~$75-100
- **10,000 users/month**: ~$150-200

### After Full Optimization (Storage + Compression + CDN)
- **1,000 users/month**: **$0** (within free tier)
- **5,000 users/month**: **~$0.50**
- **10,000 users/month**: **~$2**

**Break-even point**: ~15,000 users/month before you need to upgrade from free tier

---

## 15. 🎯 Pre-Launch Checklist

**Database**
- [ ] All indexes created
- [ ] RLS policies enabled and tested
- [ ] Point-in-Time Recovery enabled
- [ ] Backups configured
- [ ] Vacuum scheduled

**Caching**
- [x] Client-side caching implemented
- [x] Cache invalidation working
- [ ] CDN configured (optional)
- [x] Browser caching headers set

**Performance**
- [ ] Lighthouse score > 85
- [ ] Load testing passed
- [ ] Mobile performance tested
- [ ] Images optimized

**Security**
- [x] RLS policies active
- [x] HTTPS enforced
- [x] Security headers configured
- [ ] Rate limiting enabled
- [ ] CSP configured

**Monitoring**
- [ ] Supabase alerts set up
- [ ] Error tracking (Sentry) configured
- [ ] Analytics installed
- [ ] Uptime monitoring (optional)

**Code**
- [ ] All admin managers have cache invalidation
- [ ] Production build optimized
- [ ] Error boundaries implemented
- [ ] Environment variables secured
- [ ] Console.logs removed from production

---

## 🚀 Deployment Steps

1. **Review this checklist** - Check off all items
2. **Run production build** - `npm run build`
3. **Test locally** - `npx serve dist`
4. **Deploy to staging** - Test everything again
5. **Monitor for 24 hours** - Check Supabase dashboard
6. **Deploy to production** - Go live!
7. **Monitor actively** - Watch metrics for first week

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Support**: https://supabase.com/support
- **Community**: https://github.com/supabase/supabase/discussions
- **Status**: https://status.supabase.com

---

**Last Updated**: March 29, 2026  
**Next Review**: Before production deployment

Good luck! 🎉
