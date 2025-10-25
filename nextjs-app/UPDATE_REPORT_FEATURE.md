# Update Report Feature

## Overview
Added the ability to update existing shareable reports without deleting and regenerating them. This allows you to control and change which cards are visible in the report while keeping the same shareable URL.

## What's New

### 1. Update Report API Endpoint
**Location:** `src/app/api/update-report/[datasetId]/route.js`

**Method:** `PUT`

**Features:**
- Updates card visibility settings
- Updates editable content (Unstoppable section)
- Optionally regenerates AI insights
- Keeps the same shareable URL
- Validates that a report exists before updating

**Request Body:**
```json
{
  "cardVisibility": { /* card visibility settings */ },
  "editableContent": { /* editable content */ },
  "regenerateInsights": false // optional, set to true to regenerate AI analysis
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report updated successfully",
  "url": "https://your-domain.com/report/token",
  "updatedFields": {
    "cardVisibility": true,
    "editableContent": true,
    "llmInsights": false
  }
}
```

### 2. Updated UI Components

#### AdminControlSection Component
**Location:** `src/components/AdminControlSection.jsx`

**Changes:**
- Added "Update Report" button next to the "Delete" button
- New props: `onUpdateReport`, `isUpdatingReport`
- Updated help text to guide users
- Increased collapsible section height to accommodate new button

**UI Layout:**
```
[Copy URL Button]
[Update Report Button (full width)] [Delete Button]
```

#### Main Page Component
**Location:** `src/app/page.jsx`

**Changes:**
- Added `isUpdatingReport` state
- Added `handleUpdateReport` function
- Passes update handlers to AdminControlSection

## How to Use

### For Users:

1. **Load a Profile** - Select a profile that already has a shareable report
2. **Modify Settings** - Change card visibility or edit Unstoppable content
3. **Click "Update Report"** - The button appears next to the Delete button
4. **Confirmation** - You'll see a success message when the update is complete
5. **Share** - The shareable URL remains the same, but now reflects your changes

### For Developers:

#### To Update a Report Programmatically:
```javascript
const response = await fetch(`/api/update-report/${datasetId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cardVisibility: cardVisibilitySettings,
    editableContent: editableContent,
    regenerateInsights: false // set to true to regenerate AI insights
  }),
})

const result = await response.json()
```

#### To Regenerate AI Insights:
Set `regenerateInsights: true` in the request body. This will:
- Regenerate narrative insights
- Re-analyze topics
- Re-evaluate posts
- Re-analyze positioning

**Note:** This takes longer and uses AI API credits.

## Benefits

### Before (Delete & Regenerate):
1. Make changes to card visibility
2. Delete the existing report
3. Generate a new report
4. Get a NEW shareable URL
5. Share the new URL with recipients

❌ **Problem:** Recipients need to be notified of the new URL

### After (Update):
1. Make changes to card visibility
2. Click "Update Report"
3. Same shareable URL is updated

✅ **Benefit:** Recipients can use the same URL and see the updated report

## Technical Details

### Database Updates
The update endpoint modifies these columns in the `linkedin_datasets` table:
- `card_visibility_settings` - JSON object with card visibility preferences
- `editable_content` - JSON object with editable content
- `llm_insights` - (optional) JSON object with AI-generated insights
- `updated_at` - Timestamp of the last update

**Important:** The `shareable_url` column is NOT changed, ensuring the URL remains stable.

### Error Handling
- Validates that dataset exists
- Validates that a shareable report exists (has `shareable_url`)
- Gracefully handles LLM analysis failures
- Returns detailed error messages

### Security
- Uses the same authentication as generate-report
- Validates dataset ownership (inherited from Supabase RLS)
- Prevents updating non-existent reports

## Future Enhancements

Potential improvements:
1. Add a "Regenerate AI Insights" checkbox in the UI
2. Show a diff of what changed
3. Add version history for reports
4. Add a "Preview Changes" button
5. Add toast notifications instead of alerts
6. Track update history with timestamps

## Testing

### Manual Testing Steps:
1. ✅ Create a new profile and generate a report
2. ✅ Change card visibility settings
3. ✅ Click "Update Report"
4. ✅ Verify the shareable URL still works
5. ✅ Verify the report reflects the new card visibility
6. ✅ Edit Unstoppable content
7. ✅ Click "Update Report" again
8. ✅ Verify the editable content is updated in the report
9. ✅ Try updating a profile without a report (should show error)
10. ✅ Verify Delete still works as expected

### API Testing:
```bash
# Test update endpoint
curl -X PUT http://localhost:3000/api/update-report/[datasetId] \
  -H "Content-Type: application/json" \
  -d '{
    "cardVisibility": {"linkedin-analytics": true},
    "editableContent": {"why-us": "Updated content"},
    "regenerateInsights": false
  }'
```

## Files Modified

1. ✅ `src/app/api/update-report/[datasetId]/route.js` - New API endpoint
2. ✅ `src/components/AdminControlSection.jsx` - Added Update button
3. ✅ `src/app/page.jsx` - Added update handler

## Migration Notes

No database migration required. The feature uses existing columns:
- `shareable_url` (existing)
- `card_visibility_settings` (existing)
- `editable_content` (existing)
- `llm_insights` (existing)
- `updated_at` (existing)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify the dataset has a shareable_url
4. Ensure localStorage has the latest settings

