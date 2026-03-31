# 🚀 Quick Reference Card

**One-page reference for IMPACT R&D Website**

---

## ⚡ Quick Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
```

---

## 🔑 Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

# Optional (for error monitoring)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/QUICK_DEPLOY.md` | 15-min deployment guide |
| `/ALL_TASKS_COMPLETE.md` | Complete overview |
| `/SENTRY_SETUP_GUIDE.md` | Error monitoring |
| `/.env.example` | Environment variables |
| `/database_indexes_production.sql` | DB optimization |

---

## ✅ Deployment Checklist

**Database (5 min)**:
- [ ] Run `/database_schema.sql` in Supabase
- [ ] Run `/database_indexes_production.sql` in Supabase
- [ ] Create Storage bucket: `images` (make public)

**Netlify (5 min)**:
- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Deploy!

**Sentry (5 min - Optional)**:
- [ ] Sign up at https://sentry.io
- [ ] Get DSN
- [ ] Add `VITE_SENTRY_DSN` to Netlify
- [ ] Redeploy

---

## 🎯 What's Complete

- ✅ Cache invalidation (9 managers)
- ✅ Supabase Storage migration
- ✅ Image compression (70-85% reduction)
- ✅ Vite build optimization
- ✅ Error boundaries
- ✅ Rate limiting
- ✅ Sentry monitoring

**Status**: 100% Production Ready 🟢

---

## 💰 Cost Structure

**FREE TIER** (up to 10K users):
- Supabase: $0/month
- Netlify: $0/month
- Sentry: $0/month

**Total**: $0/month 🎉

---

## 🐛 Quick Troubleshooting

**Build fails?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Images not uploading?**
- Check Storage bucket exists (`images`)
- Verify bucket is public
- File size < 10MB

**Sentry not working?**
- Check `VITE_SENTRY_DSN` is set
- Test in production (not localhost)
- Trigger test error

---

## 📊 Performance Targets

- ⚡ Page load: <1 second
- 📦 Bundle: <500KB
- 🖼️ Images: <1MB each
- 🔄 Cache hit: >80%

---

## 🔗 Important Links

- **Supabase**: https://app.supabase.com
- **Netlify**: https://app.netlify.com
- **Sentry**: https://sentry.io
- **Docs**: See files above

---

## 📞 Support

All answers in:
1. `/QUICK_DEPLOY.md` - Deployment
2. `/ALL_TASKS_COMPLETE.md` - Everything
3. `/SENTRY_SETUP_GUIDE.md` - Monitoring

---

**Ready?** → `/QUICK_DEPLOY.md` → 🚀

*Last Updated: March 29, 2026*
