# 🚀 R2 Quick Setup Checklist

## ⏱️ 5-Minute Setup

### Step 1: Enable Public Access (2 minutes)
```
1. Go to: https://dash.cloudflare.com/
2. Click: R2 Object Storage > impact-images
3. Find: "Public Development URL" section
4. Click: Enable button
5. Copy: The generated URL (looks like https://pub-XXXXX.r2.dev)
```

### Step 2: Update Local Environment (1 minute)
Create `.env.local` file:
```bash
VITE_R2_ACCOUNT_ID=28eec24bb9bab22e118ae4ba787be7e2
VITE_R2_ACCESS_KEY_ID=your_access_key
VITE_R2_SECRET_ACCESS_KEY=your_secret_key
VITE_R2_BUCKET_NAME=impact-images
VITE_R2_PUBLIC_URL=https://pub-XXXXX.r2.dev  # ⬅️ PASTE YOUR URL HERE
```

### Step 3: Update Netlify (1 minute)
```
1. Go to: https://app.netlify.com/
2. Click: Your site > Site configuration > Environment variables
3. Add/Update: VITE_R2_PUBLIC_URL = https://pub-XXXXX.r2.dev
4. Save and redeploy
```

### Step 4: Verify (1 minute)
```bash
npm run verify:r2
```

## 🎯 Expected Results

### Before (Supabase only)
- Image URL: `https://xxx.supabase.co/storage/v1/object/public/images/...`
- Egress cost: **$0.09/GB** 💸
- 10K users: **$2,772/month**

### After (R2 enabled)
- Image URL: `https://pub-XXXXX.r2.dev/news/...`
- Egress cost: **$0.00/GB** ✅
- 10K users: **~$90/month**

## ✅ Success Indicators

Upload a test image in admin panel and check console:
```
[R2] Uploading test.jpg to news/...
[R2] Upload successful: https://pub-XXXXX.r2.dev/news/1234567890.jpg
```

## 🆘 Need Help?

See full guide: [R2_PUBLIC_ACCESS_SETUP.md](./R2_PUBLIC_ACCESS_SETUP.md)

## 💡 Pro Tips

1. **Custom Domain**: Use `images.impactrd.org` instead of R2.dev URL
2. **CORS**: Add policy if you get CORS errors
3. **Migration**: Old images stay in Supabase, new ones go to R2
4. **Monitoring**: Check R2 metrics at https://dash.cloudflare.com/

## 📊 Cost Comparison

| Users | Supabase Only | With R2 | Savings |
|-------|---------------|---------|---------|
| 100   | $28/month     | $25/month | 11% |
| 1,000 | $277/month    | $35/month | 87% |
| 10,000| $2,772/month  | $90/month | 97% |

## 🔒 Security

- ✅ Public read access is SAFE
- ✅ Only YOU can upload/delete
- ✅ API keys stay private
- ✅ No listing/browsing allowed

---

**Ready?** Start with Step 1 above! 🎉
