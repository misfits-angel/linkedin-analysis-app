-- LinkedIn Datasets Table for Multi-User Dashboard
-- Run this SQL in your Supabase SQL Editor

-- Create the main table
CREATE TABLE linkedin_datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Metadata for quick queries and display
  author_name TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Quick access metrics (extracted from analysis_data for fast queries)
  total_posts INTEGER,
  median_engagement INTEGER,
  date_range_start DATE,
  date_range_end DATE,
  
  -- The complete analyzed data (JSONB for flexibility)
  analysis_data JSONB NOT NULL,
  
  -- Optional: Store original CSV data for re-processing if needed
  raw_csv_data JSONB,
  
  -- Optional: Store file path if using storage bucket
  storage_path TEXT,
  
  -- LinkedIn profile URL for the author
  linkedin_profile_url TEXT
);

-- Create indexes for fast queries
CREATE INDEX idx_linkedin_datasets_author ON linkedin_datasets(author_name);
CREATE INDEX idx_linkedin_datasets_created ON linkedin_datasets(created_at DESC);
CREATE INDEX idx_linkedin_datasets_analysis ON linkedin_datasets USING GIN (analysis_data);
CREATE INDEX idx_linkedin_datasets_posts ON linkedin_datasets(total_posts);
CREATE INDEX idx_linkedin_datasets_profile_url ON linkedin_datasets(linkedin_profile_url);

-- Enable Row Level Security (RLS)
ALTER TABLE linkedin_datasets ENABLE ROW LEVEL SECURITY;

-- Create policies for multi-user access
-- Policy 1: Anyone can read all datasets (for team sharing)
CREATE POLICY "Enable read access for all users" ON linkedin_datasets
  FOR SELECT USING (true);

-- Policy 2: Anyone can insert new datasets (for uploads)
CREATE POLICY "Enable insert access for all users" ON linkedin_datasets
  FOR INSERT WITH CHECK (true);

-- Policy 3: Anyone can update datasets (for re-uploads)
CREATE POLICY "Enable update access for all users" ON linkedin_datasets
  FOR UPDATE USING (true);

-- Policy 4: Anyone can delete datasets (for cleanup)
CREATE POLICY "Enable delete access for all users" ON linkedin_datasets
  FOR DELETE USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_linkedin_datasets_updated_at 
    BEFORE UPDATE ON linkedin_datasets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to extract quick metrics from analysis_data
CREATE OR REPLACE FUNCTION extract_quick_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract total posts
    NEW.total_posts = (NEW.analysis_data->'summary'->>'posts_last_12m')::INTEGER;
    
    -- Extract median engagement
    NEW.median_engagement = (NEW.analysis_data->'summary'->>'median_engagement')::INTEGER;
    
    -- Extract date range from posts array
    IF NEW.analysis_data ? 'posts' AND jsonb_array_length(NEW.analysis_data->'posts') > 0 THEN
        NEW.date_range_start = (NEW.analysis_data->'posts'->0->>'date')::DATE;
        NEW.date_range_end = (NEW.analysis_data->'posts'->-1->>'date')::DATE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically extract metrics
CREATE TRIGGER extract_metrics_on_insert_update
    BEFORE INSERT OR UPDATE ON linkedin_datasets
    FOR EACH ROW
    EXECUTE FUNCTION extract_quick_metrics();

-- Create a function to query posts by date range (for AI bot)
CREATE OR REPLACE FUNCTION get_posts_by_date_range(
    dataset_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    post_content TEXT,
    post_date TIMESTAMPTZ,
    likes INTEGER,
    comments INTEGER,
    reposts INTEGER,
    engagement INTEGER,
    post_type TEXT,
    day_of_week TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (post->>'content')::TEXT,
        (post->>'date')::TIMESTAMPTZ,
        (post->>'likes')::INTEGER,
        (post->>'comments')::INTEGER,
        (post->>'reposts')::INTEGER,
        (post->>'eng')::INTEGER,
        (post->>'type')::TEXT,
        (post->>'dayOfWeek')::TEXT
    FROM 
        linkedin_datasets,
        jsonb_array_elements(analysis_data->'posts') AS post
    WHERE 
        id = dataset_id
        AND (post->>'date')::DATE >= start_date
        AND (post->>'date')::DATE <= end_date
    ORDER BY 
        (post->>'date')::TIMESTAMPTZ DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get high engagement posts
CREATE OR REPLACE FUNCTION get_high_engagement_posts(
    dataset_id UUID,
    min_engagement INTEGER DEFAULT 100
)
RETURNS TABLE (
    post_content TEXT,
    post_date TIMESTAMPTZ,
    likes INTEGER,
    comments INTEGER,
    reposts INTEGER,
    engagement INTEGER,
    post_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (post->>'content')::TEXT,
        (post->>'date')::TIMESTAMPTZ,
        (post->>'likes')::INTEGER,
        (post->>'comments')::INTEGER,
        (post->>'reposts')::INTEGER,
        (post->>'eng')::INTEGER,
        (post->>'type')::TEXT
    FROM 
        linkedin_datasets,
        jsonb_array_elements(analysis_data->'posts') AS post
    WHERE 
        id = dataset_id
        AND (post->>'eng')::INTEGER >= min_engagement
    ORDER BY 
        (post->>'eng')::INTEGER DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert a sample record to test (optional)
-- INSERT INTO linkedin_datasets (author_name, file_name, analysis_data) 
-- VALUES ('Test User', 'test.csv', '{"profile": {"name": "Test User"}, "summary": {"posts_last_12m": 0}, "posts": []}');

-- Grant necessary permissions
GRANT ALL ON linkedin_datasets TO authenticated;
GRANT ALL ON linkedin_datasets TO anon;
