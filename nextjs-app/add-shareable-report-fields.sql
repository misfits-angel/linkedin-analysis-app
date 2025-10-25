-- Add fields for shareable reports functionality
-- Run this SQL in your Supabase SQL Editor

-- Add shareable_url field for unique report URLs
ALTER TABLE linkedin_datasets 
ADD COLUMN IF NOT EXISTS shareable_url TEXT UNIQUE;

-- Add llm_insights field to store AI analysis results
ALTER TABLE linkedin_datasets 
ADD COLUMN IF NOT EXISTS llm_insights JSONB;

-- Add card_visibility_settings field to store which cards should be visible in reports
ALTER TABLE linkedin_datasets 
ADD COLUMN IF NOT EXISTS card_visibility_settings JSONB;

-- Add static_html_content field for static report generation (optional)
ALTER TABLE linkedin_datasets 
ADD COLUMN IF NOT EXISTS static_html_content TEXT;

-- Create index on shareable_url for fast lookups
CREATE INDEX IF NOT EXISTS idx_linkedin_datasets_shareable_url ON linkedin_datasets(shareable_url);

-- Create index on llm_insights for AI analysis queries
CREATE INDEX IF NOT EXISTS idx_linkedin_datasets_llm_insights ON linkedin_datasets USING GIN (llm_insights);

-- Create index on card_visibility_settings for report customization
CREATE INDEX IF NOT EXISTS idx_linkedin_datasets_card_visibility ON linkedin_datasets USING GIN (card_visibility_settings);

-- Update the extract_quick_metrics function to handle new fields
CREATE OR REPLACE FUNCTION extract_quick_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract total posts (prefer new field, fallback to old)
    NEW.total_posts = COALESCE(
        (NEW.analysis_data->'summary'->>'posts_in_period')::INTEGER,
        (NEW.analysis_data->'summary'->>'posts_last_12m')::INTEGER
    );
    
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
