-- Add shareable_url column to linkedin_datasets table
-- Run this SQL in your Supabase SQL Editor

-- Add the shareable_url column
ALTER TABLE linkedin_datasets ADD COLUMN shareable_url VARCHAR(255);

-- Create index for fast lookups
CREATE INDEX idx_linkedin_datasets_shareable_url ON linkedin_datasets(shareable_url);

-- Grant permissions
GRANT ALL ON linkedin_datasets TO authenticated;
GRANT ALL ON linkedin_datasets TO anon;
