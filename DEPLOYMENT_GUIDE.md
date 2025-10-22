# Vercel Deployment Guide

This guide will help you deploy the LinkedIn Analysis Next.js application to Vercel.

## Prerequisites

1. **GitHub Account**: Your code is already pushed to: `https://github.com/misfits-angel/linkedin-analysis-app`
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier is sufficient to start)
3. **OpenAI API Key** (optional): For LLM-powered insights features

## Step-by-Step Deployment

### 1. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"** or **"Import Project"**
3. Select your repository: `misfits-angel/linkedin-analysis-app`
4. Authorize Vercel to access your GitHub repository if prompted

### 2. Configure Project Settings

When setting up the project, configure the following:

#### Framework Preset
- **Framework**: Next.js (should be auto-detected)

#### Root Directory
- **Root Directory**: `nextjs-app`
- ⚠️ **IMPORTANT**: Click "Edit" next to "Root Directory" and set it to `nextjs-app` since the Next.js app is in a subdirectory

#### Build & Development Settings
These should be auto-filled, but verify:
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default for Next.js)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 3. Environment Variables

Add the following environment variables in the Vercel dashboard:

1. Click on **"Environment Variables"** section
2. Add these variables:

```
Name: NEXT_PUBLIC_OPENAI_API_KEY
Value: [Your OpenAI API Key]
Environment: Production, Preview, Development
```

> **Note**: The `NEXT_PUBLIC_` prefix makes this variable accessible in the browser. If you prefer server-only access, remove the prefix and only use it in API routes.

**Optional Variables:**
```
Name: GEMINI_API_KEY
Value: [Your Google Gemini API Key]
Environment: Production, Preview, Development
```

### 4. Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a production URL like: `https://your-app-name.vercel.app`

### 5. Verify Deployment

After deployment:
1. Click on the deployment URL
2. Test the following:
   - ✅ Page loads correctly
   - ✅ File upload functionality works
   - ✅ Charts render properly
   - ✅ LLM insights generate (if API keys are configured)

## Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to **"Domains"** tab
3. Add your custom domain
4. Update your DNS settings as instructed by Vercel

### Continuous Deployment

Vercel automatically sets up continuous deployment:
- **Production**: Every push to `main` branch automatically deploys to production
- **Preview**: Pull requests get their own preview URLs
- **Rollback**: Easy rollback to previous deployments from the dashboard

## Environment-Specific Deployments

### Preview Deployments
- Every branch gets a unique preview URL
- Perfect for testing before merging to main
- Format: `https://your-app-name-git-branch-name.vercel.app`

### Production Deployment
- Automatically deploys when you push to `main` branch
- Uses production environment variables

## Troubleshooting

### Build Fails

**Issue**: Build fails with "Cannot find module"
**Solution**: 
1. Check that root directory is set to `nextjs-app`
2. Verify all dependencies are in `package.json`
3. Check build logs for specific missing packages

**Issue**: TypeScript errors during build
**Solution**: 
1. The project is configured to use JavaScript, but TypeScript types are for development
2. Ensure `tsconfig.json` has proper configurations
3. Run `npm run build` locally to catch errors before deployment

### Runtime Errors

**Issue**: API routes timeout
**Solution**:
1. Vercel free tier has 10-second timeout limit
2. Upgrade to Pro plan for 60-second timeout (required for LLM operations)
3. Or optimize API calls to complete faster

**Issue**: Environment variables not working
**Solution**:
1. Check variable names match exactly (including `NEXT_PUBLIC_` prefix if needed)
2. Redeploy after adding environment variables
3. Clear browser cache and test again

### API Key Issues

**Issue**: LLM features not working
**Solution**:
1. Verify API keys are correct in Vercel dashboard
2. Check API key has sufficient credits/quota
3. Review API route logs in Vercel dashboard

## Monitoring & Analytics

### View Logs
1. Go to your project in Vercel dashboard
2. Click on **"Deployments"** tab
3. Select a deployment
4. Click **"View Function Logs"** to see API route logs

### Performance
- Vercel automatically provides analytics
- Go to **"Analytics"** tab in project dashboard
- Monitor response times, errors, and visitor metrics

## Updating the Application

### Making Changes
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Vercel automatically detects the push and redeploys

### Rollback
If something goes wrong:
1. Go to **"Deployments"** in Vercel dashboard
2. Find a previous working deployment
3. Click the three dots menu
4. Select **"Promote to Production"**

## Cost Considerations

### Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth per month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ⚠️ 10-second function timeout

### Pro Tier ($20/month) Adds:
- ✅ 60-second function timeout (recommended for LLM operations)
- ✅ 1TB bandwidth
- ✅ Advanced analytics
- ✅ Team collaboration features

## Security Best Practices

1. **Never commit API keys** - Always use environment variables
2. **Use different keys** for development and production
3. **Rotate keys regularly** - Update in Vercel dashboard when needed
4. **Enable Vercel's security features** in project settings

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **GitHub Repository**: https://github.com/misfits-angel/linkedin-analysis-app

## Quick Deployment Checklist

- [ ] GitHub repository is up to date
- [ ] Vercel account created and connected to GitHub
- [ ] Project imported with root directory set to `nextjs-app`
- [ ] Environment variables configured (at minimum `NEXT_PUBLIC_OPENAI_API_KEY`)
- [ ] Build succeeds without errors
- [ ] Application loads at deployment URL
- [ ] All features tested and working
- [ ] Custom domain configured (optional)
- [ ] Monitoring and analytics reviewed

---

**Ready to Deploy?** Follow the steps above and your LinkedIn Analysis app will be live in minutes! 🚀

