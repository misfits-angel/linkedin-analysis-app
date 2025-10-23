-- Migration script to add missing columns to existing linkedin_datasets table
-- Run this in your Supabase SQL Editor if the table already exists

-- Add the linkedin_profile_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linkedin_datasets' 
        AND column_name = 'linkedin_profile_url'
    ) THEN
        ALTER TABLE linkedin_datasets ADD COLUMN linkedin_profile_url TEXT;
    END IF;
END $$;

-- Add index for the new column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'linkedin_datasets' 
        AND indexname = 'idx_linkedin_datasets_profile_url'
    ) THEN
        CREATE INDEX idx_linkedin_datasets_profile_url ON linkedin_datasets(linkedin_profile_url);
    END IF;
END $$;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'linkedin_datasets' 
AND column_name IN ('file_name', 'raw_csv_data', 'storage_path', 'linkedin_profile_url')
ORDER BY column_name;
