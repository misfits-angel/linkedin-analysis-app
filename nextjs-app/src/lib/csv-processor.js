// ============= CSV PROCESSING =============
// Main CSV analysis orchestrator - delegates to specialized utilities
//
// ============================================================================
// DATA FILTERING RULE - READ THIS FIRST
// ============================================================================
// 
// CRITICAL RULE FOR POST DATA FILTERING:
//
// 1. Post vs Reshare Chart: Uses ALL posts (including reshares)
//    - This chart specifically shows the split between original and reshared content
//    - Calculated in action_share and action_counts
//
// 2. ALL OTHER ANALYSIS: Uses ONLY original posts (excluding reshares)
//    - Summary metrics (post count, engagement, etc.)
//    - Trends (posts per month, engagement over time)
//    - Type distribution (text, video, image, etc.)
//    - Timing insights and posting rhythm
//    - Distribution analysis
//    - LLM analysis (narrative insights, topic analysis, etc.)
//
// This ensures accurate analysis while still showing the full picture of
// posting behavior in the Post vs Reshare Chart.
// ============================================================================

import {
  parseCSVDate,
  getMonthKey,
  getDayOfWeek,
  generateMonthsArray,
  generateLast12Months,
  labelMonth
} from './utils/dateUtils'

import {
  median,
  percentile,
  mean,
  ensureArray,
  clip,
  toDonut
} from './utils/statisticsUtils'

import {
  ANALYSIS_CONFIG,
  detectPostType,
  calculatePostDistribution,
  calculatePostingRhythm,
  calculateTimingInsights,
  detectAnalysisPeriod
} from './utils/postAnalyzer'

// Re-export commonly used utilities for backward compatibility
export {
  parseCSVDate,
  getMonthKey,
  getDayOfWeek,
  generateMonthsArray,
  generateLast12Months,
  labelMonth,
  median,
  percentile,
  mean,
  ensureArray,
  clip,
  toDonut,
  detectPostType,
  calculatePostDistribution
}

/**
 * Main CSV analysis function
 * @param {Array} rows - CSV data rows
 * @param {Object} metadata - Analysis metadata
 * @param {Object} options - Analysis options
 * @param {number} options.analysisPeriodMonths - Number of months to analyze (default: auto-detect)
 */
export function analyzeCsvData(rows, metadata = {}, options = {}) {
  const validRows = rows.filter(row => 
    row.postContent && 
    row.postContent.trim() !== '' &&
    !row.postContent.includes('Export limit reached')
  )

  if (validRows.length === 0) {
    throw new Error('No valid posts found in CSV. Please check the file format.')
  }

  const now = new Date()
  
  // Auto-detect analysis period based on data range, or use provided option
  let analysisPeriodMonths = options.analysisPeriodMonths
  
  if (!analysisPeriodMonths) {
    analysisPeriodMonths = detectAnalysisPeriod(validRows)
  }
  
  const analysisStartDate = new Date(now.getFullYear(), now.getMonth() - analysisPeriodMonths, now.getDate())
  analysisStartDate.setHours(0, 0, 0, 0)

  const rowsWithoutTimestamp = validRows.filter(row => !row.postTimestamp || row.postTimestamp.trim() === '')
  if (rowsWithoutTimestamp.length > 0) {
    console.warn(`Warning: ${rowsWithoutTimestamp.length} posts are missing dates (postTimestamp column) and were excluded from analysis.`)
  }

  // Process all posts
  const allPosts = validRows.map(row => {
    const date = parseCSVDate(row.postTimestamp)
    const likes = parseInt(row.likeCount || '0')
    const comments = parseInt(row.commentCount || '0')
    const reposts = parseInt(row.repostCount || '0')
    const views = parseInt(row.viewCount || '0')
    const engagement = likes + comments + reposts
    
    return {
      content: row.postContent,
      date: date,
      month: date ? getMonthKey(date) : null,
      dayOfWeek: date ? getDayOfWeek(date) : null,
      type: detectPostType(row),
      action: row.action || 'Post',
      likes: likes,
      comments: comments,
      reposts: reposts,
      views: views,
      eng: engagement,
      topics: [], // Topics will be analyzed by LLM only
      url: row.postUrl,
      author: row.author || 'Unknown'
    }
  }).filter(p => p.date) // Only filter out posts without dates

  // Filter posts from the analysis period
  const posts = allPosts.filter(p => p.date && p.date >= analysisStartDate)
  
  if (posts.length === 0) {
    throw new Error(`No posts found within the last ${analysisPeriodMonths} months. Your CSV might contain older data or have date format issues.`)
  }

  posts.sort((a, b) => a.date.getTime() - b.date.getTime())

  // ============================================================================
  // DATA FILTERING STRATEGY - CRITICAL RULE
  // ============================================================================
  // 
  // RULE: Post vs Reshare Chart uses ALL posts (including reshares)
  //       ALL OTHER analysis uses ONLY original posts (excluding reshares)
  //
  // This is because:
  // 1. Post vs Reshare Chart specifically shows the split between original and reshared content
  // 2. All other metrics (engagement, trends, etc.) should only analyze original content
  // ============================================================================
  
  // Filter out reshares - ONLY use original posts for MOST analysis
  const originalPosts = posts.filter(p => !p.action.toLowerCase().includes('reposted'))
  
  // Allow users with only reshares to upload their data
  // This is needed for the "Unstoppable" section to work for all users
  // If no original posts, use all posts (including reshares) for analysis
  const postsForAnalysis = originalPosts.length > 0 ? originalPosts : posts

  // Get author name (most common author)
  const authorCounts = {}
  postsForAnalysis.forEach(p => {
    authorCounts[p.author] = (authorCounts[p.author] || 0) + 1
  })
  const authorName = Object.keys(authorCounts).reduce((a, b) => authorCounts[a] > authorCounts[b] ? a : b)

  // Summary metrics - USES ORIGINAL POSTS ONLY
  const engagementScores = postsForAnalysis.map(p => p.eng)
  const summary = {
    posts_last_12m: postsForAnalysis.length, // Keep for backward compatibility
    posts_in_period: postsForAnalysis.length,
    analysis_period_months: analysisPeriodMonths,
    active_months: new Set(postsForAnalysis.map(p => p.month).filter(Boolean)).size,
    median_engagement: median(engagementScores),
    p90_engagement: percentile(engagementScores, 90)
  }

  // Trends: Posts per month - USES ORIGINAL POSTS ONLY
  const postsPerMonth = {}
  const monthMedian = {}
  const monthTotal = {}
  const monthEngagements = {}

  // Process all posts and collect data by month
  postsForAnalysis.forEach(p => {
    if (p.month) {
      // Initialize month if not exists
      if (!postsPerMonth[p.month]) {
        postsPerMonth[p.month] = 0
        monthMedian[p.month] = 0
        monthTotal[p.month] = 0
        monthEngagements[p.month] = []
      }
      
      // Increment count and collect engagement data
      postsPerMonth[p.month]++
      monthEngagements[p.month].push(p.eng)
      monthTotal[p.month] += p.eng
    }
  })

  // Calculate median engagement for each month
  Object.keys(monthEngagements).forEach(month => {
    monthMedian[month] = median(monthEngagements[month])
  })

  // Mix: Type distribution - USES ORIGINAL POSTS ONLY
  const typeCounts = {}
  const typeEngagements = {}
  
  postsForAnalysis.forEach(p => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1
    if (!typeEngagements[p.type]) typeEngagements[p.type] = []
    typeEngagements[p.type].push(p.eng)
  })
  
  const type_share = {}
  const type_median_engagement = {}
  const type_mean_engagement = {}
  const type_q1_engagement = {}
  const type_q3_engagement = {}
  const type_max_engagement = {}
  
  Object.keys(typeCounts).forEach(type => {
    type_share[type] = typeCounts[type] / postsForAnalysis.length
    type_median_engagement[type] = median(typeEngagements[type])
    type_mean_engagement[type] = mean(typeEngagements[type])
    type_q1_engagement[type] = percentile(typeEngagements[type], 25)
    type_q3_engagement[type] = percentile(typeEngagements[type], 75)
    type_max_engagement[type] = Math.max(...typeEngagements[type])
  })

  // ============================================================================
  // Mix: Action distribution (Post vs Reshare) - USES ALL POSTS (INCLUDING RESHARES)
  // ============================================================================
  // EXCEPTION TO THE RULE: This is the ONLY metric that uses ALL posts including reshares
  // This is because the Post vs Reshare Chart specifically needs to show the split
  // between original posts and reshared content
  // ============================================================================
  const actionCounts = {}
  const actionEngagements = {}
  
  // Use ALL posts (including reshares) for action distribution
  posts.forEach(p => {
    actionCounts[p.action] = (actionCounts[p.action] || 0) + 1
    if (!actionEngagements[p.action]) actionEngagements[p.action] = []
    actionEngagements[p.action].push(p.eng)
  })
  
  const action_share = {}
  const action_median_engagement = {}
  
  Object.keys(actionCounts).forEach(action => {
    action_share[action] = actionCounts[action] / posts.length  // Divide by ALL posts, not just original
    action_median_engagement[action] = median(actionEngagements[action])
  })

  // Topics - No manual analysis, LLM only - USES ORIGINAL POSTS ONLY
  const tag_share = {}
  const tag_median_engagement = {}
  const tag_counts = {}

  // Use helper functions for rhythm and timing - USES ORIGINAL POSTS ONLY
  const rhythm = calculatePostingRhythm(postsForAnalysis)
  const timingInsights = calculateTimingInsights(postsForAnalysis)
  const distribution = calculatePostDistribution(postsForAnalysis, analysisPeriodMonths)

  // Prepare posts array for JSON - USES ORIGINAL POSTS ONLY
  const postsForJson = postsForAnalysis.map(p => ({
    content: p.content,
    date: p.date,
    month: p.month,
    dayOfWeek: p.dayOfWeek,
    type: p.type,
    action: p.action,
    likes: p.likes,
    comments: p.comments,
    reposts: p.reposts,
    views: p.views,
    eng: p.eng,
    topics: p.topics,
    url: p.url,
    author: p.author
  }))

  // Prepare ALL posts array (including reposts) for components that need it
  const allPostsForJson = posts.map(p => ({
    content: p.content,
    date: p.date,
    month: p.month,
    dayOfWeek: p.dayOfWeek,
    type: p.type,
    action: p.action,
    likes: p.likes,
    comments: p.comments,
    reposts: p.reposts,
    views: p.views,
    eng: p.eng,
    topics: p.topics,
    url: p.url,
    author: p.author
  }))

  return {
    profile: { name: authorName },
    summary,
    trends: {
      posts_per_month: postsPerMonth,
      month_median: monthMedian,
      month_total: monthTotal
    },
    mix: {
      type_share,
      type_median_engagement,
      type_mean_engagement,
      type_q1_engagement,
      type_q3_engagement,
      type_max_engagement,
      type_counts: typeCounts,
      action_share,
      action_median_engagement,
      action_counts: actionCounts
    },
    topics: {
      tag_share,
      tag_median_engagement,
      tag_counts
    },
    rhythm,
    timingInsights,
    distribution,
    posts: postsForJson,
    allPosts: allPostsForJson, // ALL posts including reposts for Post vs Reshare calculations
    // Include metadata for database storage
    fileName: metadata.fileName || null,
    rawCsvData: metadata.rawCsvData || null,
    storagePath: metadata.storagePath || null,
    linkedinProfileUrl: metadata.linkedinProfileUrl || null
  }
}
