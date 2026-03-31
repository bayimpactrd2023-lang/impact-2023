# ✅ R2 Setup Complete Checklist

## 📋 Pre-Setup (Already Done ✅)

- [x] Created R2 bucket "impact-images"
- [x] Generated R2 API tokens
- [x] Installed @aws-sdk/client-s3
- [x] Created `/src/utils/r2Upload.ts`
- [x] Updated `/src/utils/storageUpload.ts`
- [x] Deployed to Netlify

## 🚀 Final Setup Steps (YOU NEED TO DO)

### 1. Enable Public Access in Cloudflare

- [ ] Go to: https://dash.cloudflare.com/
- [ ] Navigate: R2 Object Storage → impact-images
- [ ] Scroll to: "Public Development URL" section
- [ ] Click: **Enable** button
- [ ] Copy: The generated URL (e.g., `https://pub-1a2b3c4d.r2.dev`)
- [ ] Save: Keep this URL for next steps

**Expected Result:** 
```
✅ Public Development URL is enabled
✅ You have copied: https://pub-XXXXXXXXXX.r2.dev
```

---

### 2. Update Local Environment

- [ ] Create file: `.env.local` in project root
- [ ] Add these variables:
  ```bash
  VITE_R2_ACCOUNT_ID=28eec24bb9bab22e118ae4ba787be7e2
  VITE_R2_ACCESS_KEY_ID=your_access_key_here
  VITE_R2_SECRET_ACCESS_KEY=your_secret_key_here
  VITE_R2_BUCKET_NAME=impact-images
  VITE_R2_PUBLIC_URL=https://pub-XXXXXXXXXX.r2.dev  # ⬅️ YOUR URL HERE
  ```
- [ ] Replace: `your_access_key_here` with your actual R2 access key
- [ ] Replace: `your_secret_key_here` with your actual R2 secret key
- [ ] Replace: `https://pub-XXXXXXXXXX.r2.dev` with your actual R2.dev URL
- [ ] Save: `.env.local` file
- [ ] Restart: Your dev server (`npm run dev` or similar)

**Expected Result:**
```
✅ .env.local file created with all variables
✅ No placeholder values (XXXXX) remaining
✅ Dev server restarted
```

---

### 3. Update Netlify Environment

- [ ] Go to: https://app.netlify.com/
- [ ] Select: Your site
- [ ] Navigate: Site configuration → Environment variables
- [ ] Add/Update variable:
  - Key: `VITE_R2_PUBLIC_URL`
  - Value: `https://pub-XXXXXXXXXX.r2.dev` (your actual URL)
  - Scopes: All build contexts
- [ ] Click: **Save**
- [ ] Deploy: Trigger new deployment

**Expected Result:**
```
✅ VITE_R2_PUBLIC_URL added to Netlify
✅ Site redeployed successfully
✅ Environment variable available in production
```

---

### 4. Verify Configuration

- [ ] Run: `npm run verify:r2`
- [ ] Check: All items show ✅ green checkmarks
- [ ] Fix: Any ❌ red errors before proceeding

**Expected Output:**
```
🔍 Verifying R2 Configuration...

✅ VITE_R2_ACCOUNT_ID
   Value: 28eec24bb9bab22e118ae4ba787be7e2

✅ VITE_R2_ACCESS_KEY_ID
   Value: ***xyz

✅ VITE_R2_SECRET_ACCESS_KEY
   Value: ***abc

✅ VITE_R2_BUCKET_NAME
   Value: impact-images

✅ VITE_R2_PUBLIC_URL
   Value: https://pub-XXXXXXXXXX.r2.dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All checks passed!
🎉 Your R2 configuration is ready!
🚀 New uploads will use R2 with FREE egress
```

---

### 5. Test Upload (Development)

- [ ] Start: Dev server (`npm run dev`)
- [ ] Open: http://localhost:5173/admin
- [ ] Login: With your admin credentials
- [ ] Go to: News or Highlights section
- [ ] Click: **Add New**
- [ ] Upload: A test image
- [ ] Check: Browser console (F12 → Console tab)
- [ ] Verify: Console shows R2 upload messages

**Expected Console Output:**
```
[R2] Uploading test.jpg to news/...
[StorageUpload] Using R2 for upload
[R2] Upload successful: https://pub-XXXXXXXXXX.r2.dev/news/1234567890-abc123.jpg
```

**❌ If you see this instead:**
```
[StorageUpload] R2 not configured, using Supabase Storage
```
→ Go back to Step 2 and verify environment variables

---

### 6. Verify Image Display

- [ ] Save: The uploaded item
- [ ] View: The item on the public site
- [ ] Right-click: On the image
- [ ] Select: "Copy image address" or "Inspect"
- [ ] Check: URL starts with your R2.dev domain

**Expected Image URL:**
```
✅ https://pub-XXXXXXXXXX.r2.dev/news/1234567890-abc123.jpg
```

**❌ Wrong URL (Supabase):**
```
❌ https://xxx.supabase.co/storage/v1/object/public/images/...
```

---

### 7. Test in Production

- [ ] Deploy: Push changes to production
- [ ] Wait: For Netlify build to complete
- [ ] Open: Production admin panel
- [ ] Upload: Another test image
- [ ] Check: Browser console for R2 upload
- [ ] Verify: Image URL uses R2.dev domain

**Alternatively, use test page:**
- [ ] Open: https://your-site.netlify.app/r2-test.html
- [ ] Check: All configuration items show ✅
- [ ] Upload: Test image
- [ ] Verify: Success message shows R2 URL

---

### 8. Monitor & Validate

- [ ] Check: Cloudflare R2 dashboard
- [ ] Verify: Objects count increased
- [ ] Check: Bucket size increased
- [ ] Verify: Operations count increased
- [ ] Confirm: Egress shows $0.00

**Cloudflare R2 Dashboard Check:**
```
Go to: https://dash.cloudflare.com/
Navigate: R2 Object Storage → impact-images → Metrics

✅ Objects: Increasing (new uploads)
✅ Storage: Increasing (new data)
✅ Class A Ops: Increasing (PUT requests)
✅ Class B Ops: Increasing (GET requests)
✅ Egress: $0.00 (FREE via R2.dev) 🎉
```

---

## 🎯 Success Criteria

You've successfully completed setup when:

- ✅ Public Development URL is enabled in Cloudflare
- ✅ `VITE_R2_PUBLIC_URL` is set in both local and Netlify
- ✅ `npm run verify:r2` shows all green checkmarks
- ✅ Test image upload shows R2 messages in console
- ✅ Image URLs start with `https://pub-XXXXXXXXXX.r2.dev`
- ✅ Images display correctly on your website
- ✅ R2 metrics show increasing usage
- ✅ Egress costs are $0.00

---

## 📊 Before vs After

### Before Setup
```
Upload: Image → Supabase Storage
Access: Browser → Supabase → Image (costs $0.09/GB egress)
Cost: $2,772/month for 10K users 💸
```

### After Setup
```
Upload: Image → Cloudflare R2
Access: Browser → R2.dev → Image (FREE egress)
Cost: $90/month for 10K users ✅
Savings: $2,682/month (97% reduction) 🎉
```

---

## 🔧 Troubleshooting

### Issue: Verification script fails

**Check:**
- [ ] .env.local file exists
- [ ] All variables are set (no empty values)
- [ ] No placeholder XXXXX values
- [ ] Dev server restarted after adding env vars

**Fix:**
```bash
# Check if .env.local exists
ls -la .env.local

# Verify variables are loaded
npm run verify:r2

# Restart dev server
# Press Ctrl+C to stop, then restart
```

---

### Issue: Images still using Supabase

**Check:**
- [ ] Console shows "[R2] Uploading..." message
- [ ] VITE_R2_PUBLIC_URL is set correctly
- [ ] Dev server restarted after env changes

**Note:** Old images will still be in Supabase. Only NEW uploads use R2.

---

### Issue: 404 on R2 URLs

**Check:**
- [ ] Public Development URL is ENABLED (not just created)
- [ ] URL format is correct: `https://pub-XXXXX.r2.dev`
- [ ] No trailing slash in VITE_R2_PUBLIC_URL

**Fix:**
```bash
# In .env.local, make sure format is:
VITE_R2_PUBLIC_URL=https://pub-1a2b3c4d.r2.dev
# NOT:
# VITE_R2_PUBLIC_URL=https://pub-1a2b3c4d.r2.dev/
# VITE_R2_PUBLIC_URL=https://pub-1a2b3c4d.r2.dev/impact-images
```

---

### Issue: CORS errors

**Check:**
- [ ] Browser console shows CORS error
- [ ] Images are from R2.dev domain

**Fix:**
1. Go to Cloudflare R2 dashboard
2. Select impact-images bucket
3. Go to Settings → CORS Policy
4. Add this policy:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```
5. Save and test again

---

## 📚 Additional Resources

- **Quick Start:** `R2_QUICK_SETUP.md`
- **Full Guide:** `R2_PUBLIC_ACCESS_SETUP.md`
- **Visual Guide:** `R2_VISUAL_GUIDE.txt`
- **Implementation Status:** `R2_SETUP_STATUS.md`
- **Test Page:** `/r2-test.html`

---

## ✅ Final Checklist Summary

Mark each as complete:

- [ ] 1. Enabled Public Development URL in Cloudflare
- [ ] 2. Copied R2.dev URL
- [ ] 3. Created .env.local with all variables
- [ ] 4. Added VITE_R2_PUBLIC_URL to Netlify
- [ ] 5. Ran `npm run verify:r2` (all passed)
- [ ] 6. Uploaded test image (console shows R2)
- [ ] 7. Verified image URL uses R2.dev
- [ ] 8. Tested in production
- [ ] 9. Checked R2 metrics dashboard
- [ ] 10. Confirmed egress is $0.00

**All done?** 🎉 **Congratulations!** You're now saving ~$2,682/month on egress costs!

---

## 🎉 Next Steps After Setup

1. **Monitor R2 usage** - Check metrics weekly
2. **Consider custom domain** - Use `images.impactrd.org` instead of R2.dev
3. **Optional: Migrate old images** - Move existing Supabase images to R2
4. **Update documentation** - Note the R2 setup in your project docs
5. **Celebrate!** - You just saved your organization thousands per month! 🎊

---

**Questions?** Check the documentation files or Cloudflare R2 support.

**Need help?** Run `npm run verify:r2` to diagnose issues.
