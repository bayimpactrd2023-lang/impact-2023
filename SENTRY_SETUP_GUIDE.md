# 🔍 Sentry Error Monitoring Setup Guide

**Time Required**: 5-10 minutes  
**Cost**: FREE (up to 5,000 errors/month)  
**Benefit**: Track all production errors automatically

---

## 📋 What is Sentry?

Sentry is an error monitoring service that:
- 🐛 **Captures all errors** in your production app
- 📊 **Shows detailed stack traces** for debugging
- 🎬 **Records session replays** of user actions before error
- ⚡ **Monitors performance** (slow pages, API calls)
- 📧 **Sends email alerts** when errors occur
- 📈 **Tracks error trends** over time

**Already Integrated**: ✅ Sentry is already installed and configured in your codebase!

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Sentry Account

1. Go to **https://sentry.io**
2. Click **"Get Started"**
3. Sign up with:
   - GitHub (recommended - fastest)
   - Google
   - Email

**Cost**: FREE tier (no credit card required)

---

### Step 2: Create a New Project

1. After signing in, click **"Create Project"**
2. Select platform: **React**
3. Set alert frequency: **Every event** (recommended for new projects)
4. Project name: **impact-rd-website** (or your preferred name)
5. Click **"Create Project"**

---

### Step 3: Get Your DSN

After creating the project, you'll see a page with setup instructions.

1. Look for a section called **"Client Keys (DSN)"** or similar
2. Copy the **DSN** string - it looks like:
   ```
   https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/1234567
   ```

**Important**: Keep this DSN private! Don't commit it to GitHub.

---

### Step 4: Add DSN to Environment Variables

**Option A: Netlify (Recommended for Production)**

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site Settings** → **Environment Variables**
4. Click **"Add a variable"**
5. Add:
   - **Key**: `VITE_SENTRY_DSN`
   - **Value**: Your DSN from Step 3
6. Click **"Save"**
7. Trigger a new deploy (Site Overview → Trigger Deploy)

**Option B: Local Development (Testing)**

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add this line:
   ```
   VITE_SENTRY_DSN=your_dsn_here
   ```
3. Replace `your_dsn_here` with your actual DSN
4. Restart your dev server: `npm run dev`

**Note**: `.env.local` should be in `.gitignore` (already configured)

---

### Step 5: Deploy & Test

1. **Deploy your site** (if using Netlify, it will auto-deploy after Step 4)
2. **Visit your live site** in production
3. **Trigger a test error** (see below)
4. **Check Sentry dashboard** - you should see the error within 1-2 minutes!

---

## 🧪 Testing Sentry (Optional)

To verify Sentry is working, you can trigger a test error:

### Method 1: Browser Console (Easiest)

1. Open your **live production site** (not localhost)
2. Open browser console (F12)
3. Type this command:
   ```javascript
   throw new Error('Sentry test error - everything is working!');
   ```
4. Press Enter
5. Check Sentry dashboard - error should appear in 1-2 minutes

### Method 2: Temporary Code (Most Realistic)

1. Add this to any component (e.g., HomePage.tsx):
   ```typescript
   import { useEffect } from 'react';
   
   useEffect(() => {
     // Test error - remove after testing
     throw new Error('Sentry test error - everything is working!');
   }, []);
   ```
2. Deploy and visit that page
3. Check Sentry dashboard
4. **IMPORTANT**: Remove the test code after verifying!

---

## 📊 What You'll See in Sentry

When an error occurs, Sentry shows:

### Error Details:
- ❌ **Error message** - What went wrong
- 📍 **File & line number** - Where it happened
- 🔄 **Stack trace** - Call stack leading to error
- 🌐 **Browser & OS** - User's environment
- 📱 **Device info** - Screen size, memory, etc.

### User Context:
- 🔗 **URL** - Which page had the error
- ⏰ **Timestamp** - When it happened
- 👤 **User ID** - If user is logged in (we set this for admin users)

### Session Replay (For errors only):
- 🎬 **Video replay** - See what user did before error
- 🖱️ **Click tracking** - User interactions
- 📝 **Form inputs** - What they typed (masked for privacy)

### Performance Data:
- ⚡ **Load time** - How long page took to load
- 📈 **Memory usage** - Browser memory consumption
- 🌐 **Network requests** - API calls made

---

## 🎯 Sentry Dashboard Navigation

### Main Pages:

1. **Issues** - List of all errors
   - Click any error to see details
   - Group similar errors automatically
   - Mark as resolved when fixed

2. **Performance** - Page load times
   - See slowest pages
   - Track API response times
   - Identify bottlenecks

3. **Replays** - Session recordings
   - Watch user sessions with errors
   - See what led to the error
   - Understand user behavior

4. **Releases** - Track versions (optional)
   - See which version has most errors
   - Track error trends over time

---

## ⚙️ Configuration (Already Done)

The following features are already configured in `/src/lib/sentry.ts`:

✅ **React Router Integration** - Track navigation errors  
✅ **Session Replay** - Only record sessions with errors (saves quota)  
✅ **Performance Monitoring** - Sample 10% of page loads  
✅ **Smart Filtering** - Ignore browser extension errors  
✅ **Environment Detection** - Only run in production  
✅ **Error Context** - Include page section in error tags  
✅ **Privacy Protection** - Mask sensitive data in replays  

---

## 💰 Pricing & Limits

### FREE Tier (Default):
- ✅ **5,000 errors/month** - More than enough for most sites
- ✅ **10,000 performance transactions/month**
- ✅ **50 session replays/month**
- ✅ **90 days data retention**
- ✅ **Unlimited team members**

### What Happens When You Exceed Free Tier?

**Option 1**: Upgrade to Team plan ($26/month)
- 50,000 errors/month
- 100,000 performance transactions/month
- 500 session replays/month

**Option 2**: Stay on free tier
- Sentry will stop accepting new errors for the month
- Existing errors remain visible
- Resets at start of next month
- Your website continues working normally!

**For IMPACT R&D**: With proper error handling, you'll likely stay under 5,000 errors/month

---

## 🔕 Email Alerts (Recommended)

Set up email alerts for critical errors:

1. Go to Sentry Project → **Settings** → **Alerts**
2. Click **"Create Alert Rule"**
3. Select **"Issues"**
4. Configure:
   - **When**: First seen (for new errors)
   - **If**: All events (or filter by environment: production)
   - **Then**: Send email to your admin email
5. Click **"Save Rule"**

Now you'll get emailed immediately when new errors occur!

---

## 🐛 Common Issues

### "Sentry not initialized" in console

**Cause**: VITE_SENTRY_DSN not set  
**Fix**: Add DSN to environment variables (see Step 4)

### "Invalid DSN" error

**Cause**: DSN format incorrect  
**Fix**: Copy DSN exactly from Sentry dashboard (should start with `https://`)

### No errors showing in dashboard

**Possible causes**:
1. ✅ DSN not set correctly
2. ✅ Testing on localhost (Sentry only runs in production)
3. ✅ No actual errors occurring (good thing!)
4. ✅ Adblocker blocking Sentry (try disabling)

**Test**: Trigger a test error (see "Testing Sentry" section)

### Session replays not recording

**This is normal!** We only record sessions with errors to save quota.  
To test replays: Trigger an error and check the error's "Replays" tab.

---

## 🎓 Learn More

### Sentry Documentation:
- **Getting Started**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Best Practices**: https://docs.sentry.io/platforms/javascript/best-practices/
- **Session Replay**: https://docs.sentry.io/product/session-replay/

### Our Implementation:
- **Sentry config**: `/src/lib/sentry.ts`
- **Error boundary**: `/src/app/components/ErrorBoundary.tsx`
- **App initialization**: `/src/app/App.tsx`

---

## ✅ Checklist

Before going live, verify:

- [ ] Sentry account created
- [ ] Project created in Sentry
- [ ] DSN copied from Sentry dashboard
- [ ] `VITE_SENTRY_DSN` environment variable set in Netlify
- [ ] Site redeployed after adding environment variable
- [ ] Test error triggered in production
- [ ] Error appears in Sentry dashboard
- [ ] Email alerts configured (optional but recommended)

---

## 🎉 You're All Set!

Your production site now has:
- ✅ **Automatic error tracking**
- ✅ **Session replay** for debugging
- ✅ **Performance monitoring**
- ✅ **Email alerts** (if configured)

**What to do when you get an error alert**:

1. Click the email link to view error in Sentry
2. Review error details and stack trace
3. Watch session replay to understand what user did
4. Fix the bug in your code
5. Deploy the fix
6. Mark error as "Resolved" in Sentry
7. Monitor to ensure error doesn't recur

**Peace of mind**: You'll know immediately if something breaks in production! 😌

---

**Questions?** Check Sentry docs or leave the DSN empty to skip monitoring.  
**Ready?** Follow the 5 steps above - takes less than 10 minutes!

Good luck! 🍀
