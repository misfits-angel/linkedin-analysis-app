-- Check current permissions and policies for linkedin_datasets table
-- Run this SQL in your Supabase SQL Editor

-- Check existing policies on linkedin_datasets table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'linkedin_datasets'
ORDER BY policyname;

-- Check if the columns already exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'linkedin_datasets' 
AND column_name IN ('static_html_content', 'llm_insights', 'shareable_url')
ORDER BY column_name;

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'linkedin_datasets'
ORDER BY ordinal_position;
