-- Add static HTML and LLM insights columns to linkedin_datasets table
-- Run this SQL in your Supabase SQL Editor

-- Add the new columns for static HTML generation
ALTER TABLE linkedin_datasets ADD COLUMN static_html_content TEXT;
ALTER TABLE linkedin_datasets ADD COLUMN llm_insights JSONB;

-- Create indexes for the new columns
CREATE INDEX idx_linkedin_datasets_static_html ON linkedin_datasets(static_html_content);
CREATE INDEX idx_linkedin_datasets_llm_insights ON linkedin_datasets USING GIN (llm_insights);

-- Drop any existing update policies
DROP POLICY IF EXISTS "Misfits admins can update all datasets" ON linkedin_datasets;
DROP POLICY IF EXISTS "Allow updates for API routes or misfits admins" ON linkedin_datasets;

-- Create a new policy that allows updates for API routes OR authenticated misfits users
CREATE POLICY "Allow updates for API routes or misfits admins" ON linkedin_datasets
  FOR UPDATE USING (
    auth.uid() IS NULL OR  -- Allow API routes (no auth context)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@misfits.capital'
    )
  );

-- Grant permissions
GRANT ALL ON linkedin_datasets TO authenticated;
GRANT ALL ON linkedin_datasets TO anon;
