# Vercel Deployment - Quick Start

## 🚀 Deploy in 5 Minutes

### 1. Go to Vercel
Visit: https://vercel.com

### 2. Import Project
- Click **"Add New Project"**
- Select: `misfits-angel/linkedin-analysis-app`

### 3. Configure
- **Root Directory**: `nextjs-app` ⚠️ IMPORTANT!
- **Framework**: Next.js (auto-detected)

### 4. Add Environment Variable
```
NEXT_PUBLIC_OPENAI_API_KEY = your_openai_api_key
```

### 5. Deploy
Click **"Deploy"** and wait ~2 minutes

### 6. Done! 🎉
Your app is live at: `https://your-app-name.vercel.app`

---

## 📋 Critical Settings

| Setting | Value |
|---------|-------|
| Root Directory | `nextjs-app` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node Version | 18.x or higher |

---

## 🔑 Required Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API for insights | Yes (for LLM features) |
| `GEMINI_API_KEY` | Google Gemini API | Optional |

---

## ⚡ Auto-Deployment

Once set up:
- **Push to `main`** → Automatic production deployment
- **Create PR** → Automatic preview deployment
- **Zero downtime** → Seamless updates

---

## 💡 Pro Tips

1. **Test locally first**: `cd nextjs-app && npm run build`
2. **Free tier limit**: 10-second function timeout
3. **Upgrade to Pro**: For 60-second timeout (needed for LLM)
4. **Check logs**: Vercel Dashboard → Deployments → Function Logs

---

## 🆘 Quick Troubleshooting

**Build fails?**
- Verify root directory is `nextjs-app`
- Check Node version is 18+

**API not working?**
- Check environment variables in Vercel dashboard
- Redeploy after adding variables

**Timeout errors?**
- Upgrade to Vercel Pro ($20/month)
- Or optimize API calls

---

## 📚 Full Documentation

For detailed instructions, see: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**GitHub Repo**: https://github.com/misfits-angel/linkedin-analysis-app

**Current Status**: ✅ All changes pushed and ready to deploy!

