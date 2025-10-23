# Supabase Environment Setup Guide

## Issues Found

1. **Missing Supabase Environment Variables**: The `.env.local` file doesn't exist
2. **PostgreSQL Trigger Function Error**: Fixed the `text ->> unknown` operator error in the schema

## Fix Applied

✅ **Fixed PostgreSQL Trigger Function**: Updated the `extract_quick_metrics()` function in `supabase-schema.sql` to use correct JSONB operators:
- Changed `NEW.analysis_data->>'summary'->>'posts_last_12m'` to `NEW.analysis_data->'summary'->>'posts_last_12m'`
- Changed `NEW.analysis_data->>'summary'->>'median_engagement'` to `NEW.analysis_data->'summary'->>'median_engagement'`

## Next Steps Required

### 1. Create `.env.local` file
Create a file named `.env.local` in the `nextjs-app` directory with:

```bash
# Supabase Configuration
# Get these values from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here

# Gemini API Key (for LLM features)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and create/login to your project
2. Go to Settings → API
3. Copy your Project URL and anon/public key
4. Replace the placeholder values in `.env.local`

### 3. Set up Supabase Database
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `supabase-schema.sql` to create the table and functions

**If you already have an existing table**, run the migration script instead:
1. Copy and run the contents of `add-missing-columns.sql` to add the missing columns

### 4. Restart Development Server
```bash
cd nextjs-app
npm run dev
```

## What This Fixes

- ✅ **404 Not Found Error**: Will be resolved once Supabase URL/key are configured
- ✅ **PostgreSQL Operator Error**: Fixed the trigger function syntax
- ✅ **Data Persistence**: Will work with both Supabase and localStorage fallback

## Current Status

The app will continue to work with localStorage fallback until Supabase is configured. The console logs show:
- ✅ Data saved to localStorage (working)
- ❌ Supabase save failed (expected until configured)
- ✅ App continues to function normally
