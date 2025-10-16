"""
LinkedIn Post Topic Analysis using Gemini LLM

This script analyzes LinkedIn posts to identify topics and performance patterns
using Google's Gemini AI model for accurate topic classification.
"""

import os
import json
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file. Please add it.")

genai.configure(api_key=GEMINI_API_KEY)

def parse_date(date_str):
    """Parse various date formats from CSV."""
    if not date_str or pd.isna(date_str):
        return None
    
    # Handle relative dates (1w, 2mo, 3d, etc.)
    import re
    relative_match = re.match(r'^(\d+)(w|d|mo|h|m|y)$', str(date_str))
    if relative_match:
        value = int(relative_match.group(1))
        unit = relative_match.group(2)
        now = datetime.now()
        
        if unit == 'h':
            return now - timedelta(hours=value)
        elif unit == 'd':
            return now - timedelta(days=value)
        elif unit == 'w':
            return now - timedelta(weeks=value)
        elif unit == 'mo':
            return now - timedelta(days=value*30)
        elif unit == 'y':
            return now - timedelta(days=value*365)
    
    # Try parsing as regular date
    try:
        return pd.to_datetime(date_str)
    except:
        return None

def load_posts(csv_file):
    """Load and filter posts from CSV."""
    df = pd.read_csv(csv_file)
    
    # Filter valid posts
    df = df[df['postContent'].notna() & (df['postContent'].str.strip() != '')]
    
    # Parse dates
    df['parsed_date'] = df.apply(
        lambda row: parse_date(row.get('postTimestamp') or row.get('timestamp') or row.get('postDate')),
        axis=1
    )
    
    # Filter last 12 months
    twelve_months_ago = datetime.now() - timedelta(days=365)
    df = df[df['parsed_date'] >= twelve_months_ago]
    
    # Calculate engagement
    df['likeCount'] = pd.to_numeric(df['likeCount'], errors='coerce').fillna(0)
    df['commentCount'] = pd.to_numeric(df['commentCount'], errors='coerce').fillna(0)
    df['repostCount'] = pd.to_numeric(df['repostCount'], errors='coerce').fillna(0)
    df['engagement'] = df['likeCount'] + df['commentCount'] + df['repostCount']
    
    print(f"✅ Loaded {len(df)} posts from last 12 months")
    return df

def analyze_topics_with_llm(posts_df):
    """Use Gemini to analyze topics across all posts."""
    
    # Prepare data for LLM
    posts_data = []
    for idx, row in posts_df.iterrows():
        posts_data.append({
            'id': idx,
            'content': row['postContent'][:500],  # Truncate long posts
            'engagement': int(row['engagement']),
            'likes': int(row['likeCount']),
            'comments': int(row['commentCount'])
        })
    
    # Create prompt for Gemini
    prompt = f"""
You are analyzing {len(posts_data)} LinkedIn posts to identify topics and performance patterns.

Here are the posts with their engagement metrics:

{json.dumps(posts_data, indent=2)}

Please analyze these posts and provide:

1. **TOPIC_DISTRIBUTION**: For each post, assign 1-3 relevant topics from this list (or add new ones if needed):
   - hiring, ai, product, startup, tech, growth, leadership, fintech, engineering, team, culture, milestone, announcement, personal

2. **SUMMARY**: Write 2-3 sentences describing what topics this person writes about and which topics tend to perform better based on engagement metrics.

Respond ONLY with valid JSON in this exact format:
{{
  "posts": [
    {{
      "id": 0,
      "topics": ["startup", "tech"]
    }},
    ...
  ],
  "summary": "You primarily write about...",
  "topic_stats": {{
    "startup": {{"count": 5, "avg_engagement": 120, "median_engagement": 110}},
    "tech": {{"count": 8, "avg_engagement": 90, "median_engagement": 85}}
  }}
}}

Focus on accuracy. A post about "hiring engineers" should be tagged as both "hiring" AND "tech/engineering".
"""
    
    print("🤖 Sending posts to Gemini for analysis...")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        result = json.loads(response_text.strip())
        
        print("✅ LLM analysis complete!")
        return result
        
    except Exception as e:
        print(f"❌ Error calling Gemini API: {e}")
        raise

def merge_with_existing_analysis(posts_df, llm_result, output_json_file):
    """Merge LLM topic analysis with existing statistical analysis."""
    
    # Load existing analysis or create new one
    if os.path.exists(output_json_file):
        with open(output_json_file, 'r') as f:
            data = json.load(f)
        print(f"📊 Loaded existing analysis from {output_json_file}")
    else:
        print("📊 Creating new analysis structure...")
        data = {
            "summary": {},
            "trends": {},
            "mix": {},
            "topics": {},
            "posts": []
        }
    
    # Add LLM summary
    data['topics']['llm_summary'] = llm_result.get('summary', '')
    data['topics']['tag_counts'] = {}
    data['topics']['tag_share'] = {}
    data['topics']['tag_median_engagement'] = {}
    
    # Process topic stats from LLM
    topic_stats = llm_result.get('topic_stats', {})
    total_posts = len(posts_df)
    
    for topic, stats in topic_stats.items():
        data['topics']['tag_counts'][topic] = stats['count']
        data['topics']['tag_share'][topic] = stats['count'] / total_posts
        data['topics']['tag_median_engagement'][topic] = stats['median_engagement']
    
    print(f"✅ Identified {len(topic_stats)} topics")
    
    return data

def main():
    """Main execution function."""
    print("\n" + "="*60)
    print("LinkedIn Topic Analysis with LLM")
    print("="*60 + "\n")
    
    # Configuration
    CSV_FILE = 'extracted_linkedin_data.csv'
    OUTPUT_FILE = 'linkedin_analysis_llm.json'
    
    # Check if CSV exists
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file not found: {CSV_FILE}")
        print("Please make sure the file exists in the current directory.")
        return
    
    # Load posts
    posts_df = load_posts(CSV_FILE)
    
    if len(posts_df) == 0:
        print("❌ No valid posts found in CSV")
        return
    
    # Analyze with LLM
    llm_result = analyze_topics_with_llm(posts_df)
    
    # Merge with existing analysis
    final_data = merge_with_existing_analysis(posts_df, llm_result, OUTPUT_FILE)
    
    # Save results
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(final_data, f, indent=2)
    
    print(f"\n✅ Analysis complete! Results saved to: {OUTPUT_FILE}")
    print(f"\n📝 Topic Summary:")
    print(f"   {llm_result.get('summary', 'No summary available')}")
    
    print(f"\n📊 Topic Distribution:")
    for topic, stats in llm_result.get('topic_stats', {}).items():
        print(f"   • {topic.capitalize()}: {stats['count']} posts (median engagement: {stats['median_engagement']})")
    
    print(f"\n💡 Next step: Upload this JSON file to your LinkedIn dashboard")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()

