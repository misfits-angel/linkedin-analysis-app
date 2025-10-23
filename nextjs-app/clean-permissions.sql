-- Clean up conflicting policies and fix API permissions
-- Run this SQL in your Supabase SQL Editor

-- Drop all existing policies that reference auth.users table (causing permission issues)
DROP POLICY IF EXISTS "Enable delete access for misfits.capital users" ON linkedin_datasets;
DROP POLICY IF EXISTS "Enable insert access for misfits.capital users" ON linkedin_datasets;
DROP POLICY IF EXISTS "Enable update access for misfits.capital users" ON linkedin_datasets;
DROP POLICY IF EXISTS "Misfits admins can delete all datasets" ON linkedin_datasets;
DROP POLICY IF EXISTS "Misfits admins can insert datasets" ON linkedin_datasets;
DROP POLICY IF EXISTS "Misfits admins can read all datasets" ON linkedin_datasets;

-- Keep the working policies - they already handle both authenticated users and API routes properly
-- The existing policies that will remain are:
-- - "Allow authenticated users to delete data" (works for authenticated users)
-- - "Allow authenticated users to insert data" (works for authenticated users) 
-- - "Allow authenticated users to read all data" (works for authenticated users)
-- - "Allow authenticated users to update data" (works for authenticated users)
-- - "Allow updates for API routes or misfits admins" (works for both API routes and misfits users)

-- Note: The existing policies already allow both authenticated users and API routes
-- API routes have auth.uid() = NULL, so they fall under the "Allow authenticated users" policies
-- No additional policies needed
