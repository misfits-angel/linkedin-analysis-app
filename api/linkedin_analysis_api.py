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
        "service": "linkedin-analysis-api",
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

def evaluate_posts_with_llm(posts_data):
    """
    Evaluate posts based on thought-leadership criteria using LLM.
    Based on the provided evaluation prompt but adapted for overall analysis.
    """
    if not GEMINI_API_KEY:
        return {
            "error": "GEMINI_API_KEY not configured. Please add it to your .env file."
        }
    
    # Prepare condensed data for LLM
    condensed_posts = []
    for idx, post in enumerate(posts_data[:30]):  # Limit to 30 most recent posts
        condensed_posts.append({
            'id': idx,
            'content': post.get('postContent', '')[:800],  # First 800 chars for better analysis
            'engagement': post.get('likeCount', 0) + post.get('commentCount', 0) + post.get('repostCount', 0),
            'likes': post.get('likeCount', 0),
            'comments': post.get('commentCount', 0),
            'reposts': post.get('repostCount', 0),
            'has_image': bool(post.get('imgUrl')),
            'type': post.get('type', 'Text')
        })
    
    # Sort by engagement to help LLM identify patterns
    condensed_posts.sort(key=lambda x: x['engagement'], reverse=True)
    
    prompt = f"""
SYSTEM ROLE
Act as a senior editor and writing evaluator for tech/startup/business content on LinkedIn, grading founder/operator/investor posts for truthfulness, coherence, and usefulness. Be rigorous, precise, and concise. Never invent facts. Output only the specified JSON.

PRIMARY TASK
Given a portfolio of LinkedIn posts, evaluate the overall quality against a quantitative rubric. Focus on the collective strength of the content portfolio rather than individual post evaluation.

INPUTS
- Posts: {len(condensed_posts)} LinkedIn posts with engagement data to evaluate as a portfolio.

DEFINITIONS
- Central claim: the main assertion each post argues (usually the first 2–4 sentences).
- Example: any company, metric, case, or artifact introduced to support claims.
- Comparable examples: examples that use the same value metric (e.g., per-resolution vs per-resolution), or the post explicitly reconciles differences.
- Personal story: a first‑person or direct founder/operator anecdote with concrete details (time/place/decision, stakes, outcome) that ties back to the post's claim.

SCORING RUBRIC (0–100 total)
- depth_originality (0–25): non‑obvious, earned thinking; explains mechanisms, tradeoffs, and edge cases rather than slogans.
- hook_effectiveness (0–10): relevant, specific, and scroll‑stopping without clickbait.
- evidence_examples (0–20): specific metrics, cases, or artifacts; uncertainty labeled; at least one concrete example for high scores.
- actionability (0–15): at least one concrete takeaway (pattern, checklist, or numeric guardrail) a reader can try soon.
- conclusion_strength (0–10): crisp takeaway and/or question that invites discussion.
- personal_story (0–10): presence and quality of a first‑person or founder‑level anecdote with concrete details; must tie back to the claim with an explicit lesson; penalize generic or name‑droppy anecdotes.
- emotional_resonance (0–10): does the content evoke appropriate emotion (curiosity, urgency, relief, pride, fear) via stakes, specificity, tension, or vulnerability without manipulative language; reward sentences that make the reader feel the consequence of the decision.

FORMATTING & STYLE CHECKS
- Prefer short, scannable sentences; flag any paragraph with >2 long sentences and suggest splits.
- If individual posts >1,000 characters, suggest trims.
- Reward explicit numbers or artifacts for scores >70; otherwise cap evidence_examples at 10/20.

PROCESS (what you must do)
1) Identify the central themes and claims across the portfolio.
2) List the examples and their value metrics (e.g., "per‑resolution," "per‑agent/month"), noting any uncertainty labels used.
3) Score each rubric dimension with 1–2 sentence justifications; for personal_story, quote the story lines and state the lesson; for emotional_resonance, name the emotion(s) evoked and cite the triggering phrase(s).
4) Produce 2–3 strengths and 3–5 improvements. Improvements must be actionable (edits, numbers, or rewrites).
5) Provide suggested_edits: three concrete improvements that would raise the overall portfolio score.
6) Return JSON only.

OUTPUT JSON SCHEMA
{{
  "score_100": 0-100,
  "rubric_breakdown": {{
    "depth_originality": 0-25,
    "hook_effectiveness": 0-10,
    "evidence_examples": 0-20,
    "actionability": 0-15,
    "conclusion_strength": 0-10,
    "personal_story": 0-10,
    "emotional_resonance": 0-10
  }},
  "story": {{
    "present": true|false,
    "quotes": ["…","…"],
    "lesson": "…"
  }},
  "strengths": ["…"],
  "improvements": ["…","…","…"],
  "suggested_edits": [
    "Edit 1: Insert a 2–3 sentence personal moment at <location> with decision, stakes, and outcome tied to the claim.",
    "Edit 2: Add numeric guardrail or artifact (e.g., cap, threshold, metric) to support the claim.",
    "Edit 3: Add a reconciliation sentence to align value metrics across examples."
  ],
  "one_line_summary": "…",
  "overall_analysis": "A comprehensive 2-3 sentence analysis of the content portfolio's strengths and growth areas."
}}

GRADING NOTES
- Actionability requires a concrete next step (pattern, checklist, or numeric guardrail).
- When examples differ in value metric, require an explicit reconciliation sentence.
- Keep rationales text‑grounded with short quotes.
- Personal story and emotional resonance reward authentic narrative and reader impact when truthfulness and coherence are satisfied.

You are analyzing {len(condensed_posts)} LinkedIn posts from a thought leader. Here are the posts with their engagement data:

{json.dumps(condensed_posts, indent=2)}
"""
    
    try:
        print("🤖 Evaluating posts with Gemini...")
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
        
        print("✅ Post evaluation complete!")
        return result
        
    except Exception as e:
        print(f"❌ Error evaluating posts: {e}")
        return {
            "error": f"Failed to evaluate posts: {str(e)}",
            "letter_grade": "N/A",
            "score_100": 0,
            "rubric_breakdown": {},
            "strengths": [],
            "improvements": [],
            "one_line_summary": "",
            "overall_analysis": ""
        }

def analyze_positioning_with_llm(posts_data):
    """
    Analyze current branding/positioning and suggest future positioning using LLM.
    This helps users understand how they're currently perceived and how to improve their positioning.
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
            'content': post.get('postContent', '')[:600],  # First 600 chars for positioning analysis
            'engagement': post.get('likeCount', 0) + post.get('commentCount', 0) + post.get('repostCount', 0),
            'likes': post.get('likeCount', 0),
            'comments': post.get('commentCount', 0),
            'reposts': post.get('repostCount', 0),
            'has_image': bool(post.get('imgUrl')),
            'type': post.get('type', 'Text'),
            'date': post.get('postTimestamp', post.get('postDate', ''))
        })
    
    # Sort by engagement to help LLM identify patterns
    condensed_posts.sort(key=lambda x: x['engagement'], reverse=True)
    
    prompt = f"""
You are a personal branding expert analyzing {len(condensed_posts)} LinkedIn posts to understand current positioning and suggest future positioning improvements.

Here are the posts with their engagement data:

{json.dumps(condensed_posts, indent=2)}

Analyze this content to understand:

1. **CURRENT BRANDING/POSITIONING**: How is this person currently positioned? What do their posts communicate about their expertise, values, and professional identity?

2. **FUTURE BRANDING/POSITIONING**: What should they be positioned as to appear better and more strategically? What positioning would help them achieve their professional goals?

Consider these aspects:
- Expertise areas and thought leadership topics
- Professional persona and communication style
- Target audience and value proposition
- Industry positioning and competitive differentiation
- Content themes and messaging consistency
- Engagement patterns and audience response

Respond ONLY with valid JSON in this exact format:
{{
  "current_branding": {{
    "positioning_summary": "A 2-3 sentence summary of how they're currently positioned",
    "key_themes": ["theme1", "theme2", "theme3"],
    "expertise_areas": ["area1", "area2", "area3"],
    "communication_style": "Description of their current communication approach",
    "target_audience": "Who they currently appeal to",
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"]
  }},
  "future_branding": {{
    "recommended_positioning": "A 2-3 sentence summary of how they should be positioned",
    "strategic_themes": ["theme1", "theme2", "theme3"],
    "target_expertise": ["area1", "area2", "area3"],
    "ideal_communication_style": "How they should communicate going forward",
    "target_audience": "Who they should target",
    "differentiation_strategy": "How to stand out from competitors",
    "content_recommendations": ["recommendation1", "recommendation2", "recommendation3"],
    "positioning_gaps": ["gap1", "gap2", "gap3"]
  }},
  "action_plan": {{
    "immediate_actions": ["action1", "action2", "action3"],
    "content_strategy": "Specific content strategy recommendations",
    "timeline": "Suggested timeline for positioning improvements"
  }}
}}

Be specific, actionable, and strategic. Focus on positioning that would genuinely help their professional growth and thought leadership.
"""
    
    try:
        print("🤖 Analyzing positioning with Gemini...")
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
        
        print("✅ Positioning analysis complete!")
        return result
        
    except Exception as e:
        print(f"❌ Error analyzing positioning: {e}")
        return {
            "error": f"Failed to analyze positioning: {str(e)}",
            "current_branding": {
                "positioning_summary": "",
                "key_themes": [],
                "expertise_areas": [],
                "communication_style": "",
                "target_audience": "",
                "strengths": [],
                "weaknesses": []
            },
            "future_branding": {
                "recommended_positioning": "",
                "strategic_themes": [],
                "target_expertise": [],
                "ideal_communication_style": "",
                "target_audience": "",
                "differentiation_strategy": "",
                "content_recommendations": [],
                "positioning_gaps": []
            },
            "action_plan": {
                "immediate_actions": [],
                "content_strategy": "",
                "timeline": ""
            }
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

@app.route('/evaluate-posts', methods=['POST'])
def evaluate_posts_endpoint():
    """
    Evaluate posts based on thought-leadership criteria using LLM.
    
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
        
        # Evaluate posts
        result = evaluate_posts_with_llm(posts)
        
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

@app.route('/analyze-positioning', methods=['POST'])
def analyze_positioning_endpoint():
    """
    Analyze current branding/positioning and suggest future positioning using LLM.
    
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
        
        # Analyze positioning
        result = analyze_positioning_with_llm(posts)
        
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
    print("🚀 LinkedIn Analysis API Server")
    print("="*60)
    print(f"Gemini API Key: {'✅ Configured' if GEMINI_API_KEY else '❌ Not found'}")
    print("\nEndpoints:")
    print("  • GET  /health            - Health check")
    print("  • POST /generate-insights - Generate narrative insights")
    print("  • POST /analyze-topics    - Analyze post topics with LLM")
    print("  • POST /evaluate-posts    - Evaluate post quality with rubric")
    print("  • POST /analyze-positioning - Analyze current and future positioning")
    print("\n" + "="*60 + "\n")
    
    app.run(host='127.0.0.1', port=5000, debug=True)

