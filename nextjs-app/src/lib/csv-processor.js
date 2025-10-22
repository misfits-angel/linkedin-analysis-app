// ============= CSV PROCESSING UTILITIES =============

/**
 * Parse date from various formats including relative dates
 */
export function parseCSVDate(dateStr) {
  if (!dateStr) return null
  
  // Handle relative dates (e.g., "1w", "2w", "1mo", "3d")
  const relativeMatch = dateStr.match(/^(\d+)(w|d|mo|h|m|y)$/)
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1])
    const unit = relativeMatch[2]
    const now = new Date()
    
    switch(unit) {
      case 'h': // hours
        return new Date(now.getTime() - value * 60 * 60 * 1000)
      case 'd': // days
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000)
      case 'w': // weeks
        return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000)
      case 'mo': // months (approximate)
        return new Date(now.getFullYear(), now.getMonth() - value, now.getDate())
      case 'm': // minutes
        return new Date(now.getTime() - value * 60 * 1000)
      case 'y': // years
        return new Date(now.getFullYear() - value, now.getMonth(), now.getDate())
    }
  }
  
  // Try ISO format
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) return date
  
  // Try other formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
  ]
  
  for (const regex of formats) {
    const match = dateStr.match(regex)
    if (match) {
      date = new Date(match[0])
      if (!isNaN(date.getTime())) return date
    }
  }
  
  return null
}

/**
 * Get month key in YYYY-MM format
 */
export function getMonthKey(date) {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get day of week name
 */
export function getDayOfWeek(date) {
  if (!date) return null
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

/**
 * Calculate median of array
 */
export function median(arr) {
  if (!arr || arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

/**
 * Calculate percentile of array
 */
export function percentile(arr, p) {
  if (!arr || arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

/**
 * Calculate mean of array
 */
export function mean(arr) {
  if (!arr || arr.length === 0) return 0
  const sum = arr.reduce((a, b) => a + b, 0)
  return Math.round(sum / arr.length)
}

/**
 * Detect post type from row data
 */
export function detectPostType(row) {
  if (row.type && row.type.trim() !== '') {
    const typeValue = row.type.toLowerCase().trim()
    const match = typeValue.match(/^([a-z]+)/)
    if (match) return match[1]
  }
  
  if (row.videoUrl) return 'video'
  if (row.imgUrl) return 'image'
  return 'text'
}

/**
 * Generate last 12 months array
 */
export function generateLast12Months() {
  const months = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }
  
  return months
}

/**
 * Format month label for display
 */
export function labelMonth(m) {
  if (!m) return ''
  if (/^\d{4}-\d{2}$/.test(m)) {
    const [y, mm] = m.split('-')
    const d = new Date(Number(y), Number(mm) - 1, 1)
    return d.toLocaleString('en-US', { month: 'short' }) + " '" + String(y).slice(-2)
  }
  if (/^\d{2}$/.test(m)) {
    const d = new Date(2000, Number(m) - 1, 1)
    return d.toLocaleString('en-US', { month: 'short' })
  }
  return m
}

/**
 * Convert share object to donut chart format
 */
export function toDonut(shareObj = {}) {
  return Object.entries(shareObj).map(([name, frac]) => ({
    name, 
    value: Math.round((frac || 0) * 100)
  }))
}

/**
 * Ensure value is an array
 */
export function ensureArray(a) {
  return Array.isArray(a) ? a : []
}

/**
 * Clip string to specified length
 */
export function clip(s, n = 120) {
  if (!s) return ''
  s = String(s)
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

/**
 * Calculate post distribution across months and days
 */
export function calculatePostDistribution(posts) {
  const last12Months = generateLast12Months()
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Initialize the distribution structure
  const monthly_daily = {}
  
  last12Months.forEach(month => {
    monthly_daily[month] = {}
    dayOrder.forEach(day => {
      monthly_daily[month][day] = { count: 0, avg_engagement: 0 }
    })
  })
  
  // Process posts and populate distribution
  const dayEngagements = {}
  const monthCounts = {}
  
  posts.forEach(post => {
    if (post.month && post.dayOfWeek && monthly_daily[post.month]) {
      monthly_daily[post.month][post.dayOfWeek].count++
      monthly_daily[post.month][post.dayOfWeek].avg_engagement += post.eng
      
      if (!dayEngagements[post.dayOfWeek]) dayEngagements[post.dayOfWeek] = []
      dayEngagements[post.dayOfWeek].push(post.eng)
      
      monthCounts[post.month] = (monthCounts[post.month] || 0) + 1
    }
  })
  
  // Calculate average engagement for each cell
  Object.keys(monthly_daily).forEach(month => {
    dayOrder.forEach(day => {
      const cell = monthly_daily[month][day]
      if (cell.count > 0) {
        cell.avg_engagement = Math.round(cell.avg_engagement / cell.count)
      }
    })
  })
  
  // Calculate insights
  const dayStats = {}
  dayOrder.forEach(day => {
    const engagements = dayEngagements[day] || []
    dayStats[day] = {
      count: engagements.length,
      avg_engagement: engagements.length > 0 ? Math.round(mean(engagements)) : 0
    }
  })
  
  const most_active_day = dayOrder.reduce((a, b) => 
    dayStats[a].count > dayStats[b].count ? a : b, dayOrder[0]
  )
  
  const best_engagement_day = dayOrder.reduce((a, b) => 
    dayStats[a].avg_engagement > dayStats[b].avg_engagement ? a : b, dayOrder[0]
  )
  
  const peak_month = last12Months.reduce((a, b) => 
    (monthCounts[a] || 0) > (monthCounts[b] || 0) ? a : b, last12Months[0]
  )
  
  const activeMonths = last12Months.filter(month => (monthCounts[month] || 0) > 0).length
  const consistency_score = Math.round((activeMonths / 12) * 100)
  
  return {
    monthly_daily,
    insights: {
      most_active_day,
      best_engagement_day,
      consistency_score,
      peak_month
    }
  }
}

/**
 * Main CSV analysis function
 */
export function analyzeCsvData(rows) {
  const validRows = rows.filter(row => 
    row.postContent && 
    row.postContent.trim() !== '' &&
    !row.postContent.includes('Export limit reached')
  )

  if (validRows.length === 0) {
    throw new Error('No valid posts found in CSV. Please check the file format.')
  }

  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate())
  twelveMonthsAgo.setHours(0, 0, 0, 0)

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

  // Filter posts from last 12 months for summary
  const posts = allPosts.filter(p => p.date && p.date >= twelveMonthsAgo)
  
  if (posts.length === 0) {
    throw new Error('No posts found within the last 12 months. Your CSV might contain older data or have date format issues.')
  }

  posts.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Filter out reshares - only count original posts for main metrics
  // Reshares are identified by action containing "reposted"
  const originalPosts = posts.filter(p => !p.action.toLowerCase().includes('reposted'))

  // If all posts are reshares, use all posts as fallback
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
    posts_last_12m: postsForAnalysis.length,
    active_months: new Set(postsForAnalysis.map(p => p.month).filter(Boolean)).size,
    median_engagement: median(engagementScores),
    p90_engagement: percentile(engagementScores, 90)
  }

  // Trends: Posts per month
  const postsPerMonth = {}
  const monthMedian = {}
  const last12Months = generateLast12Months()
  
  last12Months.forEach(month => {
    postsPerMonth[month] = 0
    monthMedian[month] = 0
  })

  postsForAnalysis.forEach(p => {
    if (p.month && postsPerMonth.hasOwnProperty(p.month)) {
      postsPerMonth[p.month]++
    }
  })

  // Calculate median engagement per month
  const monthEngagements = {}
  postsForAnalysis.forEach(p => {
    if (p.month && postsPerMonth[p.month] > 0) {
      if (!monthEngagements[p.month]) monthEngagements[p.month] = []
      monthEngagements[p.month].push(p.eng)
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

  // Posting Rhythm & Continuity
  const sortedPosts = [...postsForAnalysis].sort((a, b) => a.date.getTime() - b.date.getTime())
  const postGaps = []
  let longestGapInfo = { days: 0, startDate: null, endDate: null }
  
  for (let i = 1; i < sortedPosts.length; i++) {
    const gapDays = Math.floor((sortedPosts[i].date.getTime() - sortedPosts[i-1].date.getTime()) / (1000 * 60 * 60 * 24))
    postGaps.push(gapDays)
    
    if (gapDays > longestGapInfo.days) {
      longestGapInfo = {
        days: gapDays,
        startDate: sortedPosts[i-1].date,
        endDate: sortedPosts[i].date
      }
    }
  }
  
  const avgPostingGap = postGaps.length > 0 ? Math.round(mean(postGaps)) : 0
  const consistencyScore = Math.max(0, 100 - (avgPostingGap * 2)) // Simple consistency score

  const rhythm = {
    avg_posting_gap: avgPostingGap,
    longest_gap: longestGapInfo.days,
    longest_gap_start: longestGapInfo.startDate,
    longest_gap_end: longestGapInfo.endDate,
    consistency_score: Math.min(100, consistencyScore)
  }

  // Timing Insights
  const dayOfWeekStats = {}
  const dayEngagements = {}
  
  postsForAnalysis.forEach(p => {
    if (p.dayOfWeek) {
      dayOfWeekStats[p.dayOfWeek] = { count: 0, avg_engagement: 0 }
      dayEngagements[p.dayOfWeek] = []
    }
  })
  
  postsForAnalysis.forEach(p => {
    if (p.dayOfWeek) {
      dayOfWeekStats[p.dayOfWeek].count++
      dayEngagements[p.dayOfWeek].push(p.eng)
    }
  })
  
  Object.keys(dayOfWeekStats).forEach(day => {
    dayOfWeekStats[day].avg_engagement = Math.round(mean(dayEngagements[day]))
  })
  
  const bestDay = Object.keys(dayOfWeekStats).reduce((a, b) => 
    dayOfWeekStats[a].avg_engagement > dayOfWeekStats[b].avg_engagement ? a : b, 
    Object.keys(dayOfWeekStats)[0] || 'Monday'
  )

  const timingInsights = {
    day_of_week: dayOfWeekStats,
    best_day: bestDay
  }

  // Calculate post distribution
  const distribution = calculatePostDistribution(postsForAnalysis)

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
      month_median: monthMedian
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
    posts: postsForJson
  }
}
