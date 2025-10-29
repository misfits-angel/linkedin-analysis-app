# Debugging LLM Insights Issue

## Problem
AI-generated insights are not appearing in the report. Instead, seeing placeholder text: "AI-powered insights will appear here."

## Diagnosis Steps

### Step 1: Check Browser Console
Open the browser console (F12) and look for the debug logs:

```javascript
🎨 ProposalContent rendering with data: {...}
📊 Dataset loaded: {...}
```

Look for:
- `hasLlmInsights: true/false`
- `cardSummaries: {...}` (should have actual summaries, not undefined)

### Step 2: Check Database Schema
Verify that your Supabase database has the `llm_insights` column:

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run this query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'linkedin_datasets' 
AND column_name = 'llm_insights';
```

If this returns no results, you need to run the migration:

```sql
-- Run the migration from add-shareable-report-fields.sql
ALTER TABLE linkedin_datasets 
ADD COLUMN IF NOT EXISTS llm_insights JSONB;

CREATE INDEX IF NOT EXISTS idx_linkedin_datasets_llm_insights 
ON linkedin_datasets USING GIN (llm_insights);
```

### Step 3: Check Environment Variables
Verify your `.env.local` file has the Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

If missing, add it and restart your Next.js dev server.

### Step 4: Check Existing Data
Check if your existing report has LLM insights stored:

```sql
SELECT 
  id,
  author_name,
  shareable_url,
  llm_insights IS NOT NULL as has_llm_insights,
  jsonb_pretty(llm_insights) as insights_preview
FROM linkedin_datasets
WHERE shareable_url IS NOT NULL
LIMIT 5;
```

### Step 5: Regenerate Report
If the report was created before LLM insights were implemented, you need to regenerate it:

1. Go back to the main dashboard
2. Find the dataset
3. Click "Generate Report" again
4. Check the server logs for:
   - `🔄 Step 5/5: Generating card summaries...`
   - `✅ Step 5/5: Card summaries generated successfully`

## Expected Data Structure

The `llm_insights` column should contain:

```json
{
  "narrativeInsights": {...},
  "topicAnalysis": {...},
  "postEvaluation": {...},
  "positioningAnalysis": {...},
  "cardSummaries": {
    "snapshotsSummary": "Text summary here...",
    "postingActivitySummary": "Text summary here...",
    "analyticsCardSummary": "Text summary here...",
    "cadenceChartSummary": "Text summary here..."
  }
}
```

## Common Fixes

### Fix 1: Missing Database Column
Run the SQL migration in `add-shareable-report-fields.sql` in your Supabase SQL Editor.

### Fix 2: Missing API Key
1. Create/edit `nextjs-app/.env.local`
2. Add: `GEMINI_API_KEY=your_key_here`
3. Restart dev server: `npm run dev`

### Fix 3: Regenerate Report
If you already have a report but it's missing insights:
1. Delete the old report (or clear the `shareable_url` field in database)
2. Regenerate the report from the dashboard

### Fix 4: Check Posts Data Structure
The API expects posts with these fields:
- `postContent` or `content`
- `likeCount` or `likes`
- `commentCount` or `comments`
- `repostCount` or `reposts`
- `postTimestamp` or `date`

## Server-Side Logs to Check

When generating a report, look for these logs in your terminal:

```
🚀 API Route: Starting generate-report request
🔍 Dataset ID: ...
✅ Dataset found: ...
🤖 Starting LLM analysis for dataset: ...
🔄 Step 1/4: Generating narrative insights...
✅ Step 1/4: Narrative insights generated successfully
🔄 Step 2/4: Analyzing topics...
✅ Step 2/4: Topic analysis completed successfully
🔄 Step 3/4: Evaluating posts...
✅ Step 3/4: Post evaluation completed successfully
🔄 Step 4/4: Analyzing positioning...
✅ Step 4/4: Positioning analysis completed successfully
🔄 Step 5/5: Generating card summaries...
✅ Step 5/5: Card summaries generated successfully
🎉 All LLM analysis steps completed!
💾 Updating dataset with data: ...
✅ Database update successful
```

If you see warnings like:
- `⚠️ No posts data available for LLM analysis`
- `⚠️ GEMINI_API_KEY not configured`
- `⚠️ Step 5/5: Card summaries generation failed`

Then you have identified the issue!

## Quick Test

To test if the issue is fixed:

1. Create a new test dataset or clear the `shareable_url` of an existing one
2. Generate a new report
3. Check the browser console for the debug logs
4. The placeholder text should be replaced with actual AI insights

