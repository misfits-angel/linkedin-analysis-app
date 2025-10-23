-- Final fix for API route permissions
-- Run this SQL in your Supabase SQL Editor

-- The issue is that API routes (auth.uid() = NULL) don't have the 'authenticated' role
-- We need to add policies that allow API routes to perform all operations

-- Add policy for API routes to insert data
CREATE POLICY "Allow API routes to insert data" ON linkedin_datasets
  FOR INSERT WITH CHECK (auth.uid() IS NULL);

-- Add policy for API routes to read data  
CREATE POLICY "Allow API routes to read data" ON linkedin_datasets
  FOR SELECT USING (auth.uid() IS NULL);

-- Add policy for API routes to delete data
CREATE POLICY "Allow API routes to delete data" ON linkedin_datasets
  FOR DELETE USING (auth.uid() IS NULL);

-- Note: We already have "Allow updates for API routes or misfits admins" which handles UPDATE
