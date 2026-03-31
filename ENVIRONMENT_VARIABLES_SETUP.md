# 🔐 Environment Variables Setup Guide

## For Figma Make Environment

Since Figma Make runs in a browser, you'll need to configure environment variables for **production deployment** on Netlify or Vercel.

---

## 📋 Required Environment Variables

Copy these variables and add them to your deployment platform (Netlify/Vercel):

### 1️⃣ Supabase Configuration
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find:**
- Go to: https://app.supabase.com/project/_/settings/api
- Copy "Project URL" → `VITE_SUPABASE_URL`
- Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

---

### 2️⃣ Cloudflare R2 Configuration
```bash
VITE_R2_ACCOUNT_ID=28eec24bb9bab22e118ae4ba787be7e2
VITE_R2_BUCKET_NAME=impact-images
VITE_R2_PUBLIC_URL=https://pub-8b56794b58394e41ae27218e680449f7.r2.dev
VITE_R2_ACCESS_KEY_ID=your_r2_access_key_here
VITE_R2_SECRET_ACCESS_KEY=your_r2_secret_key_here
```

**Where to find:**
- Account ID: Already set (28eec24bb9bab22e118ae4ba787be7e2)
- Bucket Name: Already set (impact-images)
- Public URL: Already set (https://pub-8b56794b58394e41ae27218e680449f7.r2.dev)
- Access Key & Secret: Cloudflare Dashboard → R2 → Manage R2 API Tokens

---

## 🌐 Add to Netlify (Production)

### Step 1: Go to Netlify Dashboard
1. Open: https://app.netlify.com
2. Select your site
3. Go to: **Site configuration → Environment variables**

### Step 2: Add Variables
Click "Add a variable" and add each one:

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key` |
| `VITE_R2_ACCOUNT_ID` | `28eec24bb9bab22e118ae4ba787be7e2` |
| `VITE_R2_BUCKET_NAME` | `impact-images` |
| `VITE_R2_PUBLIC_URL` | `https://pub-8b56794b58394e41ae27218e680449f7.r2.dev` |
| `VITE_R2_ACCESS_KEY_ID` | `your_r2_access_key` |
| `VITE_R2_SECRET_ACCESS_KEY` | `your_r2_secret_key` |

### Step 3: Redeploy
1. Click **"Redeploy"** or push a new commit
2. Your site will rebuild with the environment variables

---

## 🔍 Testing in Figma Make

For testing in Figma Make, you can temporarily hardcode values in the code (NOT recommended for production):

**Temporary Test Configuration:**
You can modify `/src/utils/r2Upload.ts` to use hardcoded values for testing, but **remove these before deploying**.

---

## ✅ Verification Checklist

After adding environment variables:

- [ ] Supabase URL configured
- [ ] Supabase anon key configured
- [ ] R2 account ID configured (already set)
- [ ] R2 bucket name configured (already set)
- [ ] R2 public URL configured (already set)
- [ ] R2 access key configured
- [ ] R2 secret key configured
- [ ] Redeployed site
- [ ] Test image upload
- [ ] Verify image loads from R2 URL

---

## 🚨 Security Notes

**NEVER commit these values to Git:**
- ❌ Don't put secrets in your code
- ❌ Don't commit `.env` files
- ✅ Use Netlify environment variables
- ✅ Keep secrets in deployment platform

---

## 📚 Next Steps

1. **Get Supabase credentials**: https://app.supabase.com/project/_/settings/api
2. **Get R2 credentials**: Cloudflare Dashboard → R2 → Manage R2 API Tokens
3. **Add to Netlify**: Site configuration → Environment variables
4. **Redeploy**: Push changes or manual redeploy
5. **Test**: Upload an image and verify it uses R2

---

## 🆘 Need Help?

- **Can't find Supabase keys?** Check `/QUICK_DEPLOY.md`
- **Can't find R2 keys?** Check `/R2_QUICK_SETUP.md`
- **Deployment issues?** Check `/PRODUCTION_DEPLOYMENT_GUIDE.md`

---

**For local development outside Figma Make**, create a `.env.local` file in your project root with these variables.
