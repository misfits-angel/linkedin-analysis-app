# 🚀 Multi-User LinkedIn Analytics Setup Guide

## Step 1: Set Up Supabase Database

1. **Go to your Supabase dashboard**
2. **Open SQL Editor**
3. **Copy and paste the entire content from `supabase-schema.sql`**
4. **Click "Run" to create the table and functions**

## Step 2: Configure Environment Variables

Create a `.env.local` file in the `nextjs-app` directory with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here

# Existing Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

**To find your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_KEY`

## Step 3: Test the Setup

1. **Start the development server:**
   ```bash
   cd nextjs-app
   npm run dev
   ```

2. **Open browser console** (F12) to see debug messages

3. **Upload a CSV file** and check console for:
   - ✅ Supabase URL: Set
   - ✅ Supabase Key: Set
   - 🔄 Attempting to save to Supabase...
   - ✅ Data saved to Supabase with ID: [uuid]

4. **Check Supabase dashboard:**
   - Go to "Table Editor" → "linkedin_datasets"
   - You should see your uploaded data

## Step 4: Verify Multi-User Functionality

1. **Upload multiple CSV files** (different authors)
2. **Refresh the page** - you should see a profile selector
3. **Switch between profiles** - dashboard should update
4. **Open in different browser/incognito** - all profiles should be visible

## Troubleshooting

### ❌ "Supabase credentials not configured"
- Check your `.env.local` file exists
- Verify environment variable names are correct
- Restart the development server after adding env vars

### ❌ "Failed to save to Supabase"
- Check if the table was created successfully
- Verify RLS policies allow insert operations
- Check Supabase logs for detailed error messages

### ❌ "No profiles showing"
- Check browser console for errors
- Verify data was saved to Supabase
- Try refreshing the page

## Expected Behavior

✅ **Profile Selector always visible**  
✅ **Upload CSV → Save to Supabase**  
✅ **All team members see all profiles**  
✅ **Switch between profiles instantly**  
✅ **Data persists across sessions**  

---

**Need help?** Check the browser console for detailed debug messages!
