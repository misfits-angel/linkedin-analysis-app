import { GoogleGenerativeAI } from '@google/generative-ai'

// Configure Gemini
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Check if Gemini API key is configured
 */
function checkAPIKey() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    throw new Error('GEMINI_API_KEY not configured. Please set your Gemini API key in .env.local file. See setup-env.md for instructions.')
  }
}

/**
 * Parse JSON from LLM response with robust error handling
 */
function parseLLMResponse(text) {
  // Remove markdown code blocks if present
  let cleanText = text.trim()
  
  // Remove ```json and ``` markers
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7)
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3)
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3)
  }
  
  cleanText = cleanText.trim()
  
  // Try to find JSON object
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`No JSON found in response. LLM returned: ${text.substring(0, 200)}...`)
  }
  
  try {
    return JSON.parse(jsonMatch[0])
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError)
    console.error('❌ Attempted to parse:', jsonMatch[0].substring(0, 300))
    throw new Error(`Invalid JSON format in LLM response: ${parseError}`)
  }
}

// PostData interface removed - using JavaScript without TypeScript

// NarrativeInsightsResult interface removed - using JavaScript without TypeScript

// TopicAnalysisResult interface removed - using JavaScript without TypeScript

// PostEvaluationResult interface removed - using JavaScript without TypeScript

// PositioningAnalysisResult interface removed - using JavaScript without TypeScript

/**
 * Prepare condensed posts data for LLM processing
 */
function prepareCondensedPosts(postsData, limit = 50) {
  const condensedPosts = []
  
  for (let idx = 0; idx < Math.min(postsData.length, limit); idx++) {
    const post = postsData[idx]
    
    // Handle both CSV formats: legacy (postContent, likeCount) and new (content, likes)
    const content = post.postContent || post.content || ''
    const likes = parseInt(post.likeCount || post.likes || '0')
    const comments = parseInt(post.commentCount || post.comments || '0')
    const reposts = parseInt(post.repostCount || post.reposts || '0')
    const engagement = likes + comments + reposts
    
    condensedPosts.push({
      id: idx,
      content: content.substring(0, 600),
      likes,
      comments,
      reposts,
      engagement,
      has_image: Boolean(post.imgUrl || post.has_image),
      type: post.type || 'Text',
      date: post.postTimestamp || post.postDate || post.date || ''
    })
  }
  
  // Sort by engagement to help LLM identify patterns
  return condensedPosts.sort((a, b) => b.engagement - a.engagement)
}

/**
 * Generate narrative insights from posts data
 */
export async function generateNarrativeInsights(postsData) {
  checkAPIKey()

  const condensedPosts = prepareCondensedPosts(postsData, 50)
  
  const prompt = `
You are a LinkedIn analytics expert providing personalized, data-driven insights.

CRITICAL RULES:
• Maximum 6-8 words per insight
• Be SPECIFIC to THIS person's actual posting patterns
• No generic statements - analyze their unique content themes
• Direct and actionable observations

Analyze these ${condensedPosts.length} LinkedIn posts. Look at:
- What specific topics/themes appear repeatedly?
- What content types get more engagement?
- What's unique about their posting style?

POSTS DATA:
${JSON.stringify(condensedPosts, null, 2)}

Return 2-3 insights that are PERSONALIZED to this specific user's content. Examples of good personalized insights:
- "Technical deep-dives resonate with your audience."
- "Team culture posts spark more conversations."
- "Product launch updates drive peak engagement."

BAD (too generic): "Authentic posts perform well"
GOOD (specific): "Behind-the-scenes content drives comments"

Return JSON:
{
  "insights": [
    "[Specific insight about their actual content themes]",
    "[Specific insight about their posting patterns]"
  ]
}
`

  try {
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('🔍 Raw LLM response:', text.substring(0, 500) + '...')
    
    const parsedJson = parseLLMResponse(text)
    console.log('✅ Successfully parsed JSON response')
    return parsedJson
  } catch (error) {
    console.error('Error generating narrative insights:', error)
    throw new Error(`Failed to generate narrative insights: ${error}`)
  }
}

/**
 * Analyze topics from posts data - Enhanced to match legacy design
 */
export async function analyzeTopicsWithLLM(postsData) {
  checkAPIKey()

  console.log('📊 Raw posts data sample:', JSON.stringify(postsData.slice(0, 2), null, 2))
  const condensedPosts = prepareCondensedPosts(postsData, 50)
  console.log('🔄 Condensed posts sample:', JSON.stringify(condensedPosts.slice(0, 2), null, 2))
  
  // Create prompt matching legacy format
  const prompt = `
You are analyzing ${condensedPosts.length} LinkedIn posts to identify topics and performance patterns.

Here are the posts with their engagement metrics:

${JSON.stringify(condensedPosts, null, 2)}

Please analyze these posts and provide:

1. **TOPIC_DISTRIBUTION**: For each post, assign 1-3 relevant topics from this list (or add new ones if needed):
   - hiring, ai, product, startup, tech, growth, leadership, fintech, engineering, team, culture, milestone, announcement, personal

2. **SUMMARY**: Write 2-3 sentences describing what topics this person writes about and which topics tend to perform better based on engagement metrics.

Respond ONLY with valid JSON in this exact format:
{
  "posts": [
    {
      "id": 0,
      "topics": ["startup", "tech"]
    },
    ...
  ],
  "summary": "You primarily write about...",
  "topic_stats": {
    "startup": {"count": 5, "avg_engagement": 120, "median_engagement": 110},
    "tech": {"count": 8, "avg_engagement": 90, "median_engagement": 85}
  }
}

Focus on accuracy. A post about "hiring engineers" should be tagged as both "hiring" AND "tech/engineering".
`

  try {
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('🔍 Raw LLM response:', text.substring(0, 500) + '...')
    
    const parsedJson = parseLLMResponse(text)
    console.log('✅ Successfully parsed JSON response')
    return parsedJson
  } catch (error) {
    console.error('Error analyzing topics:', error)
    throw new Error(`Failed to analyze topics: ${error}`)
  }
}

/**
 * Evaluate posts with LLM using scoring rubric
 */
export async function evaluatePostsWithLLM(postsData) {
  checkAPIKey()

  const condensedPosts = prepareCondensedPosts(postsData, 50)
  
  const prompt = `
SYSTEM ROLE
Act as a senior editor and writing evaluator for tech/startup/business content on LinkedIn, grading founder/operator/investor posts for truthfulness, coherence, and usefulness. Be rigorous, precise, and concise. Never invent facts. Output only the specified JSON.

PRIMARY TASK
Given a portfolio of LinkedIn posts, evaluate the overall quality against a quantitative rubric. Focus on the collective strength of the content portfolio rather than individual post evaluation.

INPUTS
- Posts: ${condensedPosts.length} LinkedIn posts with engagement data to evaluate as a portfolio.

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

PROCESS (what you must do)
1) Identify the central themes and claims across the portfolio.
2) List the examples and their value metrics (e.g., "per‑resolution," "per‑agent/month"), noting any uncertainty labels used.
3) Score each rubric dimension with 1–2 sentence justifications; for personal_story, quote the story lines and state the lesson; for emotional_resonance, name the emotion(s) evoked and cite the triggering phrase(s).
4) Produce 2–3 strengths and 3–5 improvements. Improvements must be actionable (edits, numbers, or rewrites).
5) Provide suggested_edits: three concrete improvements that would raise the overall portfolio score.
6) Return JSON only.

OUTPUT JSON SCHEMA
{
  "score_100": 0-100,
  "rubric_breakdown": {
    "depth_originality": 0-25,
    "hook_effectiveness": 0-10,
    "evidence_examples": 0-20,
    "actionability": 0-15,
    "conclusion_strength": 0-10,
    "personal_story": 0-10,
    "emotional_resonance": 0-10
  },
  "story": {
    "present": true|false,
    "quotes": ["…","…"],
    "lesson": "…"
  },
  "strengths": ["…"],
  "improvements": ["…","…","…"],
  "suggested_edits": [
    "Edit 1: Insert a 2–3 sentence personal moment at <location> with decision, stakes, and outcome tied to the claim.",
    "Edit 2: Add numeric guardrail or artifact (e.g., cap, threshold, metric) to support the claim.",
    "Edit 3: Add a reconciliation sentence to align value metrics across examples."
  ],
  "one_line_summary": "…",
  "overall_analysis": "A comprehensive 2-3 sentence analysis of the content portfolio's strengths and growth areas."
}

You are analyzing ${condensedPosts.length} LinkedIn posts from a thought leader. Here are the posts with their engagement data:

${JSON.stringify(condensedPosts, null, 2)}
`

  try {
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('🔍 Raw LLM response:', text.substring(0, 500) + '...')
    
    const parsedJson = parseLLMResponse(text)
    console.log('✅ Successfully parsed JSON response')
    return parsedJson
  } catch (error) {
    console.error('Error evaluating posts:', error)
    throw new Error(`Failed to evaluate posts: ${error}`)
  }
}

/**
 * Analyze positioning with LLM
 */
export async function analyzePositioningWithLLM(postsData) {
  checkAPIKey()

  const condensedPosts = prepareCondensedPosts(postsData, 50)
  
  const prompt = `
You are a personal branding expert analyzing LinkedIn content to provide strategic positioning insights.

Analyze these ${condensedPosts.length} LinkedIn posts to understand:
1. Current personal branding and positioning
2. Key themes and expertise areas
3. Communication style and target audience
4. Strategic recommendations for future positioning

Focus on professional growth and thought leadership positioning.

POSTS DATA:
${JSON.stringify(condensedPosts, null, 2)}

Return a JSON response with this exact structure:
{
  "current_branding": {
    "positioning_summary": "Current positioning description",
    "key_themes": ["theme1", "theme2", "theme3"],
    "expertise_areas": ["area1", "area2", "area3"],
    "communication_style": "Style description",
    "target_audience": "Audience description",
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"]
  },
  "future_branding": {
    "recommended_positioning": "Recommended positioning",
    "strategic_themes": ["theme1", "theme2", "theme3"],
    "target_expertise": ["expertise1", "expertise2", "expertise3"],
    "ideal_communication_style": "Ideal style description",
    "target_audience": "Target audience description",
    "differentiation_strategy": "Differentiation strategy",
    "content_recommendations": ["recommendation1", "recommendation2", "recommendation3"],
    "positioning_gaps": ["gap1", "gap2", "gap3"]
  },
  "action_plan": {
    "immediate_actions": ["action1", "action2", "action3"],
    "content_strategy": "Content strategy description",
    "timeline": "Implementation timeline"
  }
}
`

  try {
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('🔍 Raw LLM response:', text.substring(0, 500) + '...')
    
    const parsedJson = parseLLMResponse(text)
    console.log('✅ Successfully parsed JSON response')
    return parsedJson
  } catch (error) {
    console.error('Error analyzing positioning:', error)
    throw new Error(`Failed to analyze positioning: ${error}`)
  }
}
