// ============= CSV PROCESSING =============
// Main CSV analysis orchestrator - delegates to specialized utilities

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

  // Filter out reshares - only count original posts for main metrics
  const originalPosts = posts.filter(p => !p.action.toLowerCase().includes('reposted'))
  const postsForAnalysis = originalPosts.length > 0 ? originalPosts : posts

  // Get author name (most common author)
  const authorCounts = {}
  postsForAnalysis.forEach(p => {
    authorCounts[p.author] = (authorCounts[p.author] || 0) + 1
  })
  const authorName = Object.keys(authorCounts).reduce((a, b) => authorCounts[a] > authorCounts[b] ? a : b)

  // Summary metrics
  const engagementScores = postsForAnalysis.map(p => p.eng)
  const summary = {
    posts_last_12m: postsForAnalysis.length, // Keep for backward compatibility
    posts_in_period: postsForAnalysis.length,
    analysis_period_months: analysisPeriodMonths,
    active_months: new Set(postsForAnalysis.map(p => p.month).filter(Boolean)).size,
    median_engagement: median(engagementScores),
    p90_engagement: percentile(engagementScores, 90)
  }

  // Trends: Posts per month
  const postsPerMonth = {}
  const monthMedian = {}
  const monthTotal = {}
  const analysisMonths = generateMonthsArray(analysisPeriodMonths)
  
  analysisMonths.forEach(month => {
    postsPerMonth[month] = 0
    monthMedian[month] = 0
    monthTotal[month] = 0
  })

  postsForAnalysis.forEach(p => {
    if (p.month && postsPerMonth.hasOwnProperty(p.month)) {
      postsPerMonth[p.month]++
    }
  })

  // Calculate median and total engagement per month
  const monthEngagements = {}
  postsForAnalysis.forEach(p => {
    if (p.month && postsPerMonth[p.month] > 0) {
      if (!monthEngagements[p.month]) monthEngagements[p.month] = []
      monthEngagements[p.month].push(p.eng)
      monthTotal[p.month] += p.eng
    }
  })

  Object.keys(monthEngagements).forEach(month => {
    monthMedian[month] = median(monthEngagements[month])
  })

  // Mix: Type distribution
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

  // Mix: Action distribution (Post vs Reshare)
  const actionCounts = {}
  const actionEngagements = {}
  
  postsForAnalysis.forEach(p => {
    actionCounts[p.action] = (actionCounts[p.action] || 0) + 1
    if (!actionEngagements[p.action]) actionEngagements[p.action] = []
    actionEngagements[p.action].push(p.eng)
  })
  
  const action_share = {}
  const action_median_engagement = {}
  
  Object.keys(actionCounts).forEach(action => {
    action_share[action] = actionCounts[action] / postsForAnalysis.length
    action_median_engagement[action] = median(actionEngagements[action])
  })

  // Calculate action distribution from FULL posts (including reshares) for the pie chart
  const fullActionCounts = {}
  posts.forEach(p => {
    const actionType = p.action.toLowerCase().includes('reposted') ? 'Reshare' : 'Post'
    fullActionCounts[actionType] = (fullActionCounts[actionType] || 0) + 1
  })
  
  const action_share_full_data = {}
  Object.keys(fullActionCounts).forEach(action => {
    action_share_full_data[action] = fullActionCounts[action] / posts.length
  })

  // Topics - No manual analysis, LLM only
  const tag_share = {}
  const tag_median_engagement = {}
  const tag_counts = {}

  // Use helper functions for rhythm and timing
  const rhythm = calculatePostingRhythm(postsForAnalysis)
  const timingInsights = calculateTimingInsights(postsForAnalysis)
  const distribution = calculatePostDistribution(postsForAnalysis, analysisPeriodMonths)

  // Prepare posts array for JSON
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
      action_counts: actionCounts,
      action_share_full_data: action_share_full_data,
      action_counts_full_data: fullActionCounts
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
    // Include metadata for database storage
    fileName: metadata.fileName || null,
    rawCsvData: metadata.rawCsvData || null,
    storagePath: metadata.storagePath || null,
    linkedinProfileUrl: metadata.linkedinProfileUrl || null
  }
}
