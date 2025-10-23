-- Fix API permissions for report generation
-- Run this SQL in your Supabase SQL Editor

-- Drop any existing update policies
DROP POLICY IF EXISTS "Misfits admins can update all datasets" ON linkedin_datasets;
DROP POLICY IF EXISTS "Allow updates for API routes or misfits admins" ON linkedin_datasets;

-- Create a new policy that allows updates for API routes OR authenticated misfits users
CREATE POLICY "Allow updates for API routes or misfits admins" ON linkedin_datasets
  FOR UPDATE USING (
    auth.uid() IS NULL OR  -- Allow API routes (no auth context)
    auth.jwt() ->> 'email' LIKE '%@misfits.capital'  -- Allow misfits users via JWT
  );
