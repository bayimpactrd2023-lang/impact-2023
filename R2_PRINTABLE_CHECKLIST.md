# ☑️ R2 Setup Checklist (Print This!)

---

## ✅ Pre-Setup (Already Done)

- [x] R2 bucket created ("impact-images")
- [x] R2 API tokens generated
- [x] Code implemented
- [x] Documentation created

---

## 🎯 Your Tasks (5 Minutes)

### 1. Cloudflare Dashboard (2 min)

- [ ] Go to: https://dash.cloudflare.com/
- [ ] Click: R2 Object Storage
- [ ] Click: impact-images
- [ ] Scroll to: "Public Development URL"
- [ ] Click: **Enable** button
- [ ] Copy URL: `https://pub-____________.r2.dev`
- [ ] Paste URL here: _________________________________

### 2. Local Environment (1 min)

- [ ] Create file: `.env.local` in project root
- [ ] Add Supabase vars (if not already there)
- [ ] Add R2 vars:
  ```
  VITE_R2_ACCOUNT_ID=28eec24bb9bab22e118ae4ba787be7e2
  VITE_R2_ACCESS_KEY_ID=your_key
  VITE_R2_SECRET_ACCESS_KEY=your_secret
  VITE_R2_BUCKET_NAME=impact-images
  VITE_R2_PUBLIC_URL=https://pub-____________.r2.dev
  ```
- [ ] Replace `your_key` with actual access key
- [ ] Replace `your_secret` with actual secret key
- [ ] Replace `____________` with your R2.dev URL
- [ ] Save file
- [ ] Restart dev server

### 3. Netlify (1 min)

- [ ] Go to: https://app.netlify.com/
- [ ] Select your site
- [ ] Click: Site configuration
- [ ] Click: Environment variables
- [ ] Click: Add a variable
- [ ] Key: `VITE_R2_PUBLIC_URL`
- [ ] Value: `https://pub-____________.r2.dev`
- [ ] Scopes: All
- [ ] Click: Save

### 4. Verify (30 sec)

- [ ] Run: `npm run verify:r2`
- [ ] Check: All items show ✅
- [ ] Fix: Any ❌ errors

### 5. Test (1 min)

- [ ] Start: `npm run dev`
- [ ] Open: http://localhost:5173/admin
- [ ] Login with admin credentials
- [ ] Upload test image
- [ ] Check console: `[R2] Upload successful`
- [ ] Verify image URL starts with R2.dev

### 6. Deploy (30 sec)

- [ ] Commit: `git add . && git commit -m "Enable R2"`
- [ ] Push: `git push`
- [ ] Wait: Netlify auto-deploys
- [ ] Test: Upload image in production

---

## ✅ Success Indicators

You're done when:

- [ ] `npm run verify:r2` = All ✅
- [ ] Console shows `[R2] Upload successful`
- [ ] Image URLs = `https://pub-XXX.r2.dev/...`
- [ ] R2 metrics show activity
- [ ] Egress cost = $0.00

---

## 💰 Expected Savings

- Before: $2,772/month
- After: $90/month
- Savings: **$2,682/month** ✅

---

## 🆘 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| "R2 not configured" | Add `VITE_R2_PUBLIC_URL` to `.env.local` |
| 404 errors | Enable Public URL in Cloudflare |
| CORS errors | Add CORS policy in R2 settings |
| Verification fails | Check env vars, restart server |

---

## 📞 Need Help?

- Run: `npm run verify:r2`
- Read: `START_HERE_R2_SETUP.md`
- Check: `R2_COMPLETE_CHECKLIST.md`

---

## 📅 Completion Date: _______________

**Time spent**: _____ minutes  
**Money saved**: $2,682/month  
**Completed by**: _______________

---

✅ **ALL DONE!** Share this success with your team! 🎉

---

*Print this page and check off items as you complete them*
