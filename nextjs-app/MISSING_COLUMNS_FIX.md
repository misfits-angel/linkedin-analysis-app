# Missing Columns Fix

## Problem
The Supabase database had the following columns but they weren't being populated with data:
- `file_name`
- `raw_csv_data` 
- `storage_path`
- `linkedin_profile_url`

## Solution
Updated the data flow to capture and store this metadata:

### 1. Updated `analyzeCsvData` function
- Now accepts a `metadata` parameter
- Returns the metadata in the analysis result

### 2. Updated `saveData` function
- Now saves all metadata fields to Supabase:
  - `file_name` ← `data.fileName`
  - `raw_csv_data` ← `data.rawCsvData` (JSONB)
  - `storage_path` ← `data.storagePath`
  - `linkedin_profile_url` ← `data.linkedinProfileUrl`

### 3. Updated file upload handlers
- Extract file name from uploaded file
- Store raw CSV text for re-processing
- Attempt to extract LinkedIn profile URL from CSV data
- Pass all metadata through the analysis pipeline

## Data Flow
```
File Upload → Extract Metadata → Analyze CSV → Save to Supabase
     ↓              ↓              ↓              ↓
  file.name    rawCsvData    fileName, etc.   All columns populated
```

## Testing
1. Upload a CSV file through the app
2. Check Supabase dashboard → Table Editor → `linkedin_datasets`
3. Verify all columns are populated:
   - `file_name`: Should show the uploaded filename
   - `raw_csv_data`: Should contain the original CSV text as JSON
   - `storage_path`: Will be null unless using Supabase Storage
   - `linkedin_profile_url`: Will be populated if CSV contains profile URL columns

## Notes
- The `raw_csv_data` is stored as JSONB for flexibility
- LinkedIn profile URL extraction looks for common column names: `profileUrl`, `linkedinUrl`, `authorUrl`
- All changes are backward compatible - existing functionality remains unchanged
