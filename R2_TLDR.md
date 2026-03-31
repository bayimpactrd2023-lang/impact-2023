# 🎯 R2 Setup - TL;DR

## What You Need to Do (5 minutes)

### 1. Enable Public Access (Cloudflare Dashboard)
```
https://dash.cloudflare.com/
→ R2 Object Storage 
→ impact-images 
→ Public Development URL 
→ Click "Enable"
→ Copy the URL
```

### 2. Add Environment Variable
**Local (.env.local):**
```bash
VITE_R2_PUBLIC_URL=https://pub-XXXXX.r2.dev
```

**Netlify:**
```
Site configuration → Environment variables → Add:
VITE_R2_PUBLIC_URL = https://pub-XXXXX.r2.dev
```

### 3. Verify
```bash
npm run verify:r2
```

### 4. Test
Upload an image → Check console for "[R2] Upload successful"

### 5. Deploy
```bash
git push
```

## Done! 🎉

---

## Cost Savings
- **Before**: $2,772/month (10K users)
- **After**: $90/month (10K users)
- **Savings**: $2,682/month (97%)

---

## Documentation

| What | Where | Time |
|------|-------|------|
| **Setup guide** | `START_HERE_R2_SETUP.md` | 5 min |
| **Verify config** | `npm run verify:r2` | 30 sec |
| **Test in browser** | `/r2-test.html` | 1 min |
| **Troubleshooting** | `R2_COMPLETE_CHECKLIST.md` | As needed |

---

## Verify Setup
```bash
# Quick check
npm run check:r2

# Detailed verification
npm run verify:r2

# Browser test
open http://localhost:5173/r2-test.html
```

---

## Expected Results

**Console when uploading:**
```
[R2] Uploading image.jpg to news/...
[R2] Upload successful: https://pub-XXX.r2.dev/news/123.jpg
```

**Image URLs:**
```
✅ https://pub-XXX.r2.dev/news/image.jpg
❌ https://xxx.supabase.co/storage/... (old)
```

**R2 Metrics:**
- Objects: Increasing ✅
- Egress: $0.00 ✅

---

## Common Issues

| Issue | Fix |
|-------|-----|
| "R2 not configured" | Add `VITE_R2_PUBLIC_URL` to `.env.local` |
| 404 on R2 URLs | Enable Public URL in Cloudflare |
| CORS errors | Add CORS policy in R2 settings |
| Verification fails | Check all env vars, no placeholders |

---

## Is It Working?

✅ `npm run verify:r2` → All green checkmarks  
✅ Console shows R2 upload messages  
✅ Image URLs use R2.dev domain  
✅ R2 metrics show activity  
✅ Egress cost = $0.00  

---

## Need More Help?

📖 **Full guide**: `START_HERE_R2_SETUP.md`  
📋 **Checklist**: `R2_COMPLETE_CHECKLIST.md`  
📚 **Docs index**: `R2_DOCUMENTATION_INDEX.md`  

---

**Ready? Go to** `START_HERE_R2_SETUP.md` **and start saving!** 💰
