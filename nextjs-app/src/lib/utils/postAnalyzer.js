// ============= POST ANALYSIS UTILITIES =============

import { parseCSVDate, getMonthKey, getDayOfWeek, generateMonthsArray } from './dateUtils'
import { median, mean, percentile } from './statisticsUtils'

// Analysis period configuration
export const ANALYSIS_CONFIG = {
  DEFAULT_MONTHS: 12,
  MIN_MONTHS: 12,
  MAX_MONTHS: 60,
  MAX_AGE_DAYS: 7
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
 * Calculate post distribution across months and days
 * Uses all posts provided without filtering by pre-generated month arrays
 */
export function calculatePostDistribution(posts, analysisPeriodMonths = 12) {
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Initialize the distribution structure dynamically based on actual posts
  const monthly_daily = {}
  const dayEngagements = {}
  const monthCounts = {}
  
  // First pass: collect all unique months from posts and initialize structure
  posts.forEach(post => {
    if (post.month && !monthly_daily[post.month]) {
      monthly_daily[post.month] = {}
      dayOrder.forEach(day => {
        monthly_daily[post.month][day] = { count: 0, avg_engagement: 0 }
      })
    }
  })
  
  // Second pass: populate distribution with actual post data
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
  
  // Get all months sorted
  const allMonths = Object.keys(monthly_daily).sort()
  
  const most_active_day = dayOrder.reduce((a, b) => 
    dayStats[a].count > dayStats[b].count ? a : b, dayOrder[0]
  )
  
  const best_engagement_day = dayOrder.reduce((a, b) => 
    dayStats[a].avg_engagement > dayStats[b].avg_engagement ? a : b, dayOrder[0]
  )
  
  const peak_month = allMonths.length > 0 
    ? allMonths.reduce((a, b) => (monthCounts[a] || 0) > (monthCounts[b] || 0) ? a : b, allMonths[0])
    : null
  
  const activeMonths = allMonths.length
  const consistency_score = analysisPeriodMonths > 0 
    ? Math.round((activeMonths / analysisPeriodMonths) * 100)
    : 100
  
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
 * Calculate posting rhythm metrics
 */
export function calculatePostingRhythm(posts) {
  const sortedPosts = [...posts].sort((a, b) => a.date.getTime() - b.date.getTime())
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

  return {
    avg_posting_gap: avgPostingGap,
    longest_gap: longestGapInfo.days,
    longest_gap_start: longestGapInfo.startDate,
    longest_gap_end: longestGapInfo.endDate,
    consistency_score: Math.min(100, consistencyScore)
  }
}

/**
 * Calculate timing insights (day of week statistics)
 */
export function calculateTimingInsights(posts) {
  const dayOfWeekStats = {}
  const dayEngagements = {}
  
  posts.forEach(p => {
    if (p.dayOfWeek) {
      if (!dayOfWeekStats[p.dayOfWeek]) {
        dayOfWeekStats[p.dayOfWeek] = { count: 0, avg_engagement: 0 }
        dayEngagements[p.dayOfWeek] = []
      }
    }
  })
  
  posts.forEach(p => {
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

  return {
    day_of_week: dayOfWeekStats,
    best_day: bestDay
  }
}

/**
 * Auto-detect analysis period based on data range
 */
export function detectAnalysisPeriod(rows) {
  const dates = rows
    .map(row => parseCSVDate(row.postTimestamp))
    .filter(date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime())
  
  if (dates.length === 0) {
    return ANALYSIS_CONFIG.DEFAULT_MONTHS
  }
  
  const oldestDate = dates[0]
  const newestDate = dates[dates.length - 1]
  const monthsDiff = (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 + 
                    (newestDate.getMonth() - oldestDate.getMonth()) + 1
  
  // Use the actual data range, but cap at reasonable limits
  return Math.min(
    Math.max(monthsDiff, ANALYSIS_CONFIG.MIN_MONTHS), 
    ANALYSIS_CONFIG.MAX_MONTHS
  )
}

