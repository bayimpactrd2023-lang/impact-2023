# =====================================================
# IMPACT R&D - Complete Supabase Project Setup Guide
# =====================================================
# Follow these steps to connect your codebase to the new Supabase project
# =====================================================

## STEP 1: Update Environment Variables (DONE ✓)

Your `.env.local` has been updated with:
- VITE_SUPABASE_URL=https://itwdgcubpfuuacumgylb.supabase.co
- VITE_SUPABASE_ANON_KEY=sb_publishable_nvUI6dodvUUyHfFZgFx-zQ_x-w4hJK8

## STEP 2: Deploy Edge Function

The Edge Function is patched and ready. You need to deploy it to your new project.

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI if not already:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Run the deployment script:
   ```bash
   ./scripts/deploy-edge-function.sh itwdgcubpfuuacumgylb
   ```

   You'll be prompted for:
   - R2_WORKER_URL: `https://r2-upload-proxy.impactrd2023.workers.dev`
   - R2_WORKER_TOKEN: (your Cloudflare Worker token)
   - INTERNAL_SERVICE_ROLE_KEY: (from Supabase Dashboard → API → service_role key)

### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard → Edge Functions
2. Click "Deploy New Function"
3. Function name: `server`
4. Copy the contents of `supabase/functions/server/index.tsx`
5. Set these secrets in Dashboard → Edge Functions → server → Secrets:
   - R2_WORKER_URL
   - R2_WORKER_TOKEN
   - INTERNAL_SERVICE_ROLE_KEY
   - SUPABASE_URL

## STEP 3: Create Database Schema

Run these SQL files in Supabase Dashboard → SQL Editor (in order):

1. **database_schema.sql** - Creates all tables
2. **database_helper_functions.sql** - Creates helper functions
3. **database_migration_*.sql** - Run all migration files
4. **database_indexes_production.sql** - Creates indexes
5. **database_rls_policies_fixed.sql** - Creates RLS policies

## STEP 4: Create Storage Buckets

Run this in SQL Editor:

```sql
-- Create images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create pdfs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pdfs', 'pdfs', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;
```

Or run: `supabase_storage_setup.sql`

## STEP 5: Make Your User an Admin

Run this in SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
WHERE email = 'your-email@example.com';
```

Or run: `scripts/make-user-admin.sql`

## STEP 6: Restart Dev Server

```bash
npm run dev
```

## STEP 7: Test Upload

1. Log in to admin panel
2. Try uploading an image
3. Check browser console for errors

## Troubleshooting

### If R2 upload still fails with CORS:
- Edge Function may not be deployed yet
- Check browser Network tab for preflight response
- Verify Edge Function secrets are set correctly

### If Storage fallback fails with "Bucket not found":
- Run the bucket creation SQL above
- Check Storage section in Supabase Dashboard

### If login fails with 401:
- Verify VITE_SUPABASE_ANON_KEY is the publishable key (not secret)
- Check that user exists in Authentication → Users

### If "Unauthorized: Admin access required":
- Run the make-user-admin.sql script
- Log out and log back in

## Files Modified/Updated

✅ `.env.local` - Updated with new project credentials
✅ `supabase/functions/server/index.tsx` - Fixed CORS for new project
✅ `database_helper_functions.sql` - Removed admin_users references
✅ `database_rls_policies_fixed.sql` - Removed admin_users references
✅ `src/app/context/AuthContext.tsx` - Removed admin_users table check

## Verification Checklist

- [ ] Edge Function deployed to new project
- [ ] Storage buckets created (images, pdfs)
- [ ] Database schema applied
- [ ] User has admin role in metadata
- [ ] Dev server restarted after env changes
- [ ] Image upload works without errors

## Next: Production Deployment

When ready to deploy to production:
1. Set environment variables in hosting platform (Netlify/Vercel)
2. Deploy Edge Function to production project
3. Apply database schema to production
4. Create storage buckets in production
5. Make admin user in production
