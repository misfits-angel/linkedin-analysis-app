import { GoogleGenerativeAI } from '@google/generative-ai'

// ============================================================================
// LLM ANALYSIS - DATA FILTERING
// ============================================================================
// All LLM functions in this file analyze ONLY original posts (excluding reshares).
// The post data passed to these functions has already been filtered by csv-processor.js
// to exclude reshared content, ensuring accurate content analysis.
// ============================================================================

// Configure Gemini
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Get the Gemini model based on environment
 * Production: gemini-2.5-pro (best quality)
 * Development: gemini-2.5-flash (fast & efficient)
 */
function getGeminiModel() {
  // Always use Gemini Flash 2.5 as requested
  return 'gemini-2.5-flash'
}

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
      date: post.postTimestamp || post.date || ''
    })
  }
  
  // Sort by engagement to help LLM identify patterns
  return condensedPosts.sort((a, b) => b.engagement - a.engagement)
}

// ============================================================================
// DASHBOARD ANALYTICS FUNCTIONS
// ============================================================================
// The following functions are used by dashboard analytics cards (on-demand)
// They are NOT called during report generation to keep it fast
// ============================================================================

/**
 * Generate narrative insights from posts data
 * Used by: Dashboard analytics cards (on-demand only, not during report generation)
 */
export async function generateNarrativeInsights(postsData) {
  checkAPIKey()

  const condensedPosts = prepareCondensedPosts(postsData, 50)
  
  const prompt = `
You are a LinkedIn analytics expert providing personalized, data-driven insights.

CRITICAL RULES:
• Generate ONE single line commentary only (maximum 10-12 words)
• Be SPECIFIC to THIS person's actual posting patterns
• No generic statements - analyze their unique content themes
• Direct and actionable observation

Analyze these ${condensedPosts.length} LinkedIn posts. Look at:
- What specific topics/themes appear repeatedly?
- What content types get more engagement?
- What's unique about their posting style?

POSTS DATA:
${JSON.stringify(condensedPosts, null, 2)}

Return ONE line of commentary that is PERSONALIZED to this specific user's content. Examples of good one-line insights:
- "Technical deep-dives resonate most with your audience."
- "Team culture posts spark more conversations consistently."
- "Product launch updates drive your peak engagement."
- "Visual content performs 2x better than text posts."
- "Weekday posts generate 3x more engagement."

BAD (too generic): "Authentic posts perform well"
GOOD (specific): "Behind-the-scenes content drives 2x more comments"
GOOD (specific): "AI and tech topics dominate your top posts"

Return JSON with ONE single line commentary:
{
  "insights": [
    "[One specific line about their actual content patterns - max 12 words]"
  ]
}
`

  try {
    const model = genai.getGenerativeModel({ model: getGeminiModel() })
    console.log(`🤖 Using model: ${getGeminiModel()} for narrative insights`)
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
 * Analyze topics from posts data
 * Used by: Dashboard analytics cards (on-demand only, not during report generation)
 */
export async function analyzeTopicsWithLLM(postsData) {
  checkAPIKey()

  console.log('📊 Raw posts data sample:', JSON.stringify(postsData.slice(0, 2), null, 2))
  const condensedPosts = prepareCondensedPosts(postsData, 50)
  console.log('🔄 Condensed posts sample:', JSON.stringify(condensedPosts.slice(0, 2), null, 2))
  
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
    const model = genai.getGenerativeModel({ model: getGeminiModel() })
    console.log(`🤖 Using model: ${getGeminiModel()} for topic analysis`)
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
 * Used by: Dashboard analytics cards (on-demand only, not during report generation)
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
    const model = genai.getGenerativeModel({ model: getGeminiModel() })
    console.log(`🤖 Using model: ${getGeminiModel()} for post evaluation`)
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
 * Used by: Dashboard analytics cards (on-demand only, not during report generation)
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
    const model = genai.getGenerativeModel({ model: getGeminiModel() })
    console.log(`🤖 Using model: ${getGeminiModel()} for positioning analysis`)
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

// ============================================================================
// PROPOSAL REPORT FUNCTIONS
// ============================================================================
// The following functions are used specifically for proposal report generation
// ============================================================================

/**
 * Generate card summaries for specific cards
 */
export async function generateCardSummaries(postsData, stats = {}) {
  checkAPIKey()

  const condensedPosts = prepareCondensedPosts(postsData, 30)
  const cardSummaries = {}
  
  // 1. Snapshots Summary
  if (stats.originalPosts !== undefined) {
    try {
      const prompt = `Based on these LinkedIn posting statistics:
- Original Posts: ${stats.originalPosts}
- Reposts: ${stats.reposts || 0}
- Most Active Month: ${stats.mostActiveMonth || 'N/A'}
- Longest Inactive Period: ${stats.longestInactive || 'N/A'}

Generate a single sentence (10-15 words) summarizing the posting activity pattern. Be specific and actionable.

Return only the summary text, no JSON, no quotes.`
      
      const model = genai.getGenerativeModel({ model: getGeminiModel() })
      const result = await model.generateContent(prompt)
      const response = await result.response
      cardSummaries.snapshotsSummary = response.text().trim().replace(/^["']|["']$/g, '')
      console.log('✅ Snapshots summary generated:', cardSummaries.snapshotsSummary)
    } catch (error) {
      console.error('❌ Failed to generate snapshots summary:', error.message)
      console.error('❌ Error details:', error)
    }
  }
  
  // 2. Posting Activity Summary
  console.log('🔄 Generating posting activity summary...')
  try {
    const prompt = `Based on this posting activity data from ${condensedPosts.length} LinkedIn posts:
${JSON.stringify(condensedPosts.slice(0, 10), null, 2)}

Generate a single sentence (10-15 words) about posting consistency and activity patterns. Be specific.

Return only the summary text, no JSON, no quotes.`
    
    const model = genai.getGenerativeModel({ model: getGeminiModel() })
    const result = await model.generateContent(prompt)
    const response = await result.response
    cardSummaries.postingActivitySummary = response.text().trim().replace(/^["']|["']$/g, '')
    console.log('✅ Posting activity summary generated:', cardSummaries.postingActivitySummary)
  } catch (error) {
    console.error('❌ Failed to generate posting activity summary:', error.message)
    console.error('❌ Error details:', error)
  }
  
  // 3. Analytics Card Summary
  console.log('🔄 Generating analytics card summary...')
  try {
    const prompt = `Based on these LinkedIn posts with engagement metrics:
${JSON.stringify(condensedPosts.slice(0, 10), null, 2)}

Generate a single sentence (10-15 words) about engagement patterns and what content performs well. Be specific.

Return only the summary text, no JSON, no quotes.`
    
    const model = genai.getGenerativeModel({ model: getGeminiModel() })
    const result = await model.generateContent(prompt)
    const response = await result.response
    cardSummaries.analyticsCardSummary = response.text().trim().replace(/^["']|["']$/g, '')
    console.log('✅ Analytics card summary generated:', cardSummaries.analyticsCardSummary)
  } catch (error) {
    console.error('❌ Failed to generate analytics card summary:', error.message)
    console.error('❌ Error details:', error)
  }
  
  // 4. Cadence Chart Summary
  console.log('🔄 Generating cadence chart summary...')
  try {
    const prompt = `Based on posting cadence patterns from these LinkedIn posts:
${JSON.stringify(condensedPosts.map(p => ({ date: p.date })).slice(0, 20), null, 2)}

Generate a single sentence (10-15 words) about posting frequency and timing patterns. Be specific.

Return only the summary text, no JSON, no quotes.`
    
    const model = genai.getGenerativeModel({ model: getGeminiModel() })
    const result = await model.generateContent(prompt)
    const response = await result.response
    cardSummaries.cadenceChartSummary = response.text().trim().replace(/^["']|["']$/g, '')
    console.log('✅ Cadence chart summary generated:', cardSummaries.cadenceChartSummary)
  } catch (error) {
    console.error('❌ Failed to generate cadence chart summary:', error.message)
    console.error('❌ Error details:', error)
  }
  
  console.log('🎉 All card summaries generation complete!')
  console.log('📦 Final cardSummaries object:', JSON.stringify(cardSummaries, null, 2))
  console.log('📊 Summary keys:', Object.keys(cardSummaries))
  
  return cardSummaries
}

