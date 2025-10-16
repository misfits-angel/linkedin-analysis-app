"""
Flask API for comprehensive LinkedIn post analysis using LLM
This server provides multiple analysis capabilities including narrative insights, 
topic analysis, post evaluation, and positioning analysis for LinkedIn content.
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Flask
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not found in .env file")
else:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_narrative_insights(posts_data):
    """
    Generate human-friendly narrative insights from posts data.
    
    Args:
        posts_data: List of post objects with content, engagement metrics, images, etc.
    
    Returns:
        Dictionary with narrative insights
    """
    
    if not GEMINI_API_KEY:
        return {
            "error": "GEMINI_API_KEY not configured. Please add it to your .env file."
        }
    
    # Prepare condensed data for LLM (to stay within token limits)
    condensed_posts = []
    for idx, post in enumerate(posts_data[:50]):  # Limit to 50 most recent posts
        condensed_posts.append({
            'id': idx,
            'content': post.get('postContent', '')[:300],  # First 300 chars
            'likes': post.get('likeCount', 0),
            'comments': post.get('commentCount', 0),
            'reposts': post.get('repostCount', 0),
            'engagement': post.get('likeCount', 0) + post.get('commentCount', 0) + post.get('repostCount', 0),
            'has_image': bool(post.get('imgUrl')),
            'type': post.get('type', 'Text'),
            'date': post.get('postTimestamp', post.get('postDate', ''))
        })
    
    # Sort by engagement to help LLM identify patterns
    condensed_posts.sort(key=lambda x: x['engagement'], reverse=True)
    
    prompt = f"""
You are analyzing {len(condensed_posts)} LinkedIn posts to generate narrative insights that read like observations from a friend or colleague.

Here are the posts with their engagement data:

{json.dumps(condensed_posts, indent=2)}

Please analyze these posts and provide 5-7 short, human-friendly observations that would help the author understand:

1. **Content patterns**: What topics or themes tend to spark more engagement?
2. **Presentation style**: Do images/videos increase engagement? Does post length matter?
3. **Engagement triggers**: What makes people comment vs just like?
4. **Authenticity moments**: When does showing vulnerability or journey resonate?
5. **Hidden patterns**: Any surprising correlations (e.g., reflective posts vs product updates)?

Write each insight as a short, conversational sentence (1-2 lines max) that reads like a friend observing patterns. Examples:
- "Your reflective posts around team culture tend to spark deeper threads."
- "When you add a small image from the office, comments nearly double."
- "People engage most when you show the journey, not the product."

Respond ONLY with valid JSON in this exact format:
{{
  "insights": [
    "Your reflective posts around team culture tend to spark deeper threads.",
    "When you add a small image from the office, comments nearly double.",
    "People engage most when you show the journey, not the product.",
    ...
  ],
  "key_finding": "A one-sentence summary of the most important pattern.",
  "recommendation": "One actionable tip based on the analysis."
}}

Be specific and data-driven, but keep the tone warm and conversational.
"""
    
    try:
        print("🤖 Generating narrative insights with Gemini...")
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
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
        
        print("✅ Narrative insights generated successfully!")
        return result
        
    except Exception as e:
        print(f"❌ Error generating insights: {e}")
        return {
            "error": f"Failed to generate insights: {str(e)}",
            "insights": [],
            "key_finding": "",
            "recommendation": ""
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "narrative-insights-api",
        "gemini_configured": bool(GEMINI_API_KEY)
    })

def analyze_topics_with_llm(posts_data):
    """
    Analyze topics across all posts using LLM.
    Based on analyze_topics_llm.py but adapted for API use.
    """
    if not GEMINI_API_KEY:
        return {
            "error": "GEMINI_API_KEY not configured. Please add it to your .env file."
        }
    
    # Prepare condensed data for LLM
    condensed_posts = []
    for idx, post in enumerate(posts_data[:50]):  # Limit to 50 most recent posts
        condensed_posts.append({
            'id': idx,
            'content': post.get('postContent', '')[:500],  # First 500 chars
            'engagement': post.get('likeCount', 0) + post.get('commentCount', 0) + post.get('repostCount', 0),
            'likes': post.get('likeCount', 0),
            'comments': post.get('commentCount', 0)
        })
    
    # Sort by engagement to help LLM identify patterns
    condensed_posts.sort(key=lambda x: x['engagement'], reverse=True)
    
    prompt = f"""
You are analyzing {len(condensed_posts)} LinkedIn posts to identify topics and performance patterns.

Here are the posts with their engagement metrics:

{json.dumps(condensed_posts, indent=2)}

Please analyze these posts and provide:

1. **TOPIC_DISTRIBUTION**: For each post, assign 1-3 relevant topics from this list (or add new ones if needed):
   - hiring, ai, product, startup, tech, growth, leadership, fintech, engineering, team, culture, milestone, announcement, personal, strategy, sales, marketing, funding

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
    
    try:
        print("🤖 Analyzing topics with Gemini...")
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
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
        
        print("✅ Topic analysis complete!")
        return result
        
    except Exception as e:
        print(f"❌ Error analyzing topics: {e}")
        return {
            "error": f"Failed to analyze topics: {str(e)}",
            "posts": [],
            "summary": "",
            "topic_stats": {}
        }

@app.route('/generate-insights', methods=['POST'])
def generate_insights_endpoint():
    """
    Generate narrative insights from post data.
    
    Expected JSON payload:
    {
        "posts": [
            {
                "postContent": "...",
                "likeCount": 10,
                "commentCount": 2,
                "repostCount": 1,
                "imgUrl": "...",
                "type": "Image",
                ...
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'posts' not in data:
            return jsonify({
                "error": "Invalid request. Expected JSON with 'posts' array."
            }), 400
        
        posts = data['posts']
        
        if not isinstance(posts, list) or len(posts) == 0:
            return jsonify({
                "error": "Posts must be a non-empty array."
            }), 400
        
        # Generate insights
        insights = generate_narrative_insights(posts)
        
        if 'error' in insights:
            return jsonify(insights), 500
        
        return jsonify({
            "success": True,
            "data": insights
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/analyze-topics', methods=['POST'])
def analyze_topics_endpoint():
    """
    Analyze topics in posts using LLM.
    
    Expected JSON payload:
    {
        "posts": [
            {
                "postContent": "...",
                "likeCount": 10,
                "commentCount": 2,
                "repostCount": 1,
                ...
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'posts' not in data:
            return jsonify({
                "error": "Invalid request. Expected JSON with 'posts' array."
            }), 400
        
        posts = data['posts']
        
        if not isinstance(posts, list) or len(posts) == 0:
            return jsonify({
                "error": "Posts must be a non-empty array."
            }), 400
        
        # Analyze topics
        result = analyze_topics_with_llm(posts)
        
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Narrative Insights API Server")
    print("="*60)
    print(f"Gemini API Key: {'✅ Configured' if GEMINI_API_KEY else '❌ Not found'}")
    print("\nEndpoints:")
    print("  • GET  /health            - Health check")
    print("  • POST /generate-insights - Generate narrative insights")
    print("  • POST /analyze-topics    - Analyze post topics with LLM")
    print("\n" + "="*60 + "\n")
    
    app.run(host='127.0.0.1', port=5000, debug=True)


