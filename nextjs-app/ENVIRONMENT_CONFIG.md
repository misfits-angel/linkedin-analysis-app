# Environment Configuration

## Required Environment Variables

### For Local Development (.env.local)

Create a `.env.local` file in the `nextjs-app` directory with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site Configuration - Custom Domain
NEXT_PUBLIC_SITE_URL=https://users.theunstoppable.ai

# Gemini API Configuration (for LLM features)
GEMINI_API_KEY=your_gemini_api_key_here
```

### For Vercel Deployment

Add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables for all environments (Production, Preview, Development):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - `https://users.theunstoppable.ai`
- `GEMINI_API_KEY` - Your Google Gemini API key

## Custom Domain Setup

The application is configured to use `https://users.theunstoppable.ai` as the base URL for all shareable report links.

If you've already added the custom domain in Vercel:
1. ✅ Domain added in Vercel dashboard
2. ✅ Set `NEXT_PUBLIC_SITE_URL=https://users.theunstoppable.ai` in Vercel environment variables
3. ✅ Code updated to use the custom domain

The report URLs will now be:
- ✅ `https://users.theunstoppable.ai/{token}`
- ❌ ~~`https://users.theunstoppable.ai/report/{token}`~~
- ❌ ~~`https://linkedin-analysis-app.vercel.app/report/{token}`~~

