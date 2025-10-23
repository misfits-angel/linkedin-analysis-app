-- Add Authentication Support to Existing LinkedIn Datasets Table
-- Run this SQL in your Supabase SQL Editor

-- Add user_id column to existing table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'linkedin_datasets' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE linkedin_datasets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_linkedin_datasets_user_id ON linkedin_datasets(user_id);

-- Drop existing RLS policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON linkedin_datasets;
DROP POLICY IF EXISTS "Enable insert access for all users" ON linkedin_datasets;
DROP POLICY IF EXISTS "Enable update access for all users" ON linkedin_datasets;
DROP POLICY IF EXISTS "Enable delete access for all users" ON linkedin_datasets;

-- Create new RLS policies for @misfits.capital admin users
-- All @misfits.capital users are treated as admins with full access

-- Policy 1: @misfits.capital users can read ALL datasets
CREATE POLICY "Misfits admins can read all datasets" ON linkedin_datasets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@misfits.capital'
    )
  );

-- Policy 2: @misfits.capital users can insert datasets
CREATE POLICY "Misfits admins can insert datasets" ON linkedin_datasets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@misfits.capital'
    )
  );

-- Policy 3: @misfits.capital users can update ALL datasets
CREATE POLICY "Misfits admins can update all datasets" ON linkedin_datasets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@misfits.capital'
    )
  );

-- Policy 4: @misfits.capital users can delete ALL datasets
CREATE POLICY "Misfits admins can delete all datasets" ON linkedin_datasets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@misfits.capital'
    )
  );

-- Create a function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically set user_id (drop existing if exists)
DROP TRIGGER IF EXISTS set_user_id_on_insert ON linkedin_datasets;
CREATE TRIGGER set_user_id_on_insert
    BEFORE INSERT ON linkedin_datasets
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- Update existing records to have a default user_id (optional - you can assign specific users)
-- This will set all existing records to have user_id = NULL initially
-- You can manually assign them to specific users later if needed
UPDATE linkedin_datasets 
SET user_id = NULL 
WHERE user_id IS NULL;

-- Grant necessary permissions
GRANT ALL ON linkedin_datasets TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Note: Existing data will have user_id = NULL
-- You may want to manually assign these to specific users or create a migration script