'use client'

import { useState, useMemo, useRef } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import { Zap, Loader2 } from 'lucide-react'
import { useReportContext } from '@/lib/hooks/useReportContext'

export default function PostingActivityStatsCard({ data }) {
  const [dynamicInsight, setDynamicInsight] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { generateNarrativeInsights } = useLLMInsights('posting-activity-stats')
  const containerRef = useRef(null)
  const isReportContext = useReportContext()

  // Calculate statistics from data
  const stats = useMemo(() => {
    if (!data?.posts || data.posts.length === 0) {
      return {
        originalPosts: 0,
        reposts: 0,
        mostActiveMonth: 'N/A',
        longestInactive: 'N/A'
      }
    }

    // Use allPosts (includes reposts) for accurate repost counting
    // If allPosts is not available, fall back to posts (original posts only)
    const allPosts = data.allPosts || data.posts
    const posts = data.posts

    // Count original posts vs reposts from allPosts
    const originalPosts = allPosts.filter(p => !p.action?.toLowerCase().includes('repost')).length
    const reposts = allPosts.filter(p => p.action?.toLowerCase().includes('repost')).length

    // Find most active month
    const monthCounts = {}
    posts.forEach(post => {
      if (post.month) {
        monthCounts[post.month] = (monthCounts[post.month] || 0) + 1
      }
    })

    let mostActiveMonth = 'N/A'
    let maxCount = 0
    Object.entries(monthCounts).forEach(([month, count]) => {
      if (count > maxCount) {
        maxCount = count
        mostActiveMonth = month
      }
    })

    // Format most active month (e.g., "2024-02" -> "Feb 2024")
    if (mostActiveMonth !== 'N/A') {
      const [year, month] = mostActiveMonth.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      mostActiveMonth = `${monthNames[parseInt(month) - 1]} ${year}`
    }

    // Find longest inactive period
    const sortedPosts = [...posts].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date)
      const dateB = b.date instanceof Date ? b.date : new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })

    let longestGap = 0
    let longestGapStart = null
    let longestGapEnd = null

    for (let i = 1; i < sortedPosts.length; i++) {
      const prevDate = sortedPosts[i - 1].date instanceof Date ? sortedPosts[i - 1].date : new Date(sortedPosts[i - 1].date)
      const currDate = sortedPosts[i].date instanceof Date ? sortedPosts[i].date : new Date(sortedPosts[i].date)
      
      const gapDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24))
      
      if (gapDays > longestGap) {
        longestGap = gapDays
        longestGapStart = prevDate
        longestGapEnd = currDate
      }
    }

    let longestInactive = 'N/A'
    if (longestGapStart && longestGapEnd) {
      const formatDate = (date) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      }
      longestInactive = `${formatDate(longestGapStart)} - ${formatDate(longestGapEnd)}`
    }

    return {
      originalPosts,
      reposts,
      mostActiveMonth,
      longestInactive
    }
  }, [data])

  const handleGenerateBriefSummary = async () => {
    if (!data?.posts || data.posts.length === 0) {
      setDynamicInsight('No posts available to analyze.')
      return
    }

    setIsGenerating(true)
    try {
      // Create a context-specific prompt for posting activity
      const contextPrompt = `Based on this posting activity data:
- Original Posts: ${stats.originalPosts}
- Reposts: ${stats.reposts}
- Most Active Month: ${stats.mostActiveMonth}
- Longest Inactive Period: ${stats.longestInactive}

Generate a single line commentary about this posting activity pattern. Focus on consistency, activity levels, and any notable patterns.`

      const result = await generateNarrativeInsights(data.posts, contextPrompt)
      const insights = result?.insights || []
      const oneLineCommentary = insights.length > 0
        ? insights[0]
        : 'Your posting activity shows consistent engagement patterns.'
      setDynamicInsight(oneLineCommentary)
    } catch (error) {
      console.error('Error generating brief summary:', error)
      setDynamicInsight('Unable to generate summary at this time.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async () => {
    if (!containerRef.current) {
      console.error('No element reference provided for PNG export')
      return
    }

    try {
      const { exportElementAsPNG, getCleanFilename, getTimestamp } = await import('@/lib/visual-export-utils')
      const cleanName = getCleanFilename("Posting Activity Stats Card")
      const timestamp = getTimestamp()
      const filename = `${cleanName}-${timestamp}`
      
      await exportElementAsPNG(containerRef.current, filename)
    } catch (error) {
      console.error('PNG export failed:', error)
    }
  }

  return (
    <ConditionalCard cardId="posting-activity-stats">
      <Card cardName="Posting Activity Stats Card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">📊 Posting Activity Stats</CardTitle>
          <div className="flex items-center gap-2">
            {!isReportContext && (
              <button 
                className="chart-export-btn-summary" 
                onClick={handleGenerateBriefSummary}
                disabled={isGenerating}
                title="Generate Brief Summary"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
              </button>
            )}
            {!isReportContext && (
              <button 
                className="chart-export-btn-inline" 
                onClick={handleExport}
                title="Export as High-Resolution PNG"
              >
                📥
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div ref={containerRef}>
            {/* Inner card with reduced width */}
            <div className="flex justify-center">
              <div className="w-3/4">
                {/* Stats Table */}
                <div className="border-2 overflow-hidden" style={{ borderColor: '#2f8f5b' }}>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b-2" style={{ borderColor: '#2f8f5b' }}>
                        <td className="p-3 text-sm text-left border-r-2" style={{ borderColor: '#2f8f5b' }}>
                          Original posts
                        </td>
                        <td className="p-3 text-sm text-left">
                          {stats.originalPosts}
                        </td>
                      </tr>
                      <tr className="border-b-2" style={{ borderColor: '#2f8f5b' }}>
                        <td className="p-3 text-sm text-left border-r-2" style={{ borderColor: '#2f8f5b' }}>
                          Reposts
                        </td>
                        <td className="p-3 text-sm text-left">
                          {stats.reposts}
                        </td>
                      </tr>
                      <tr className="border-b-2" style={{ borderColor: '#2f8f5b' }}>
                        <td className="p-3 text-sm text-left border-r-2" style={{ borderColor: '#2f8f5b' }}>
                          Most active month
                        </td>
                        <td className="p-3 text-sm text-left">
                          {stats.mostActiveMonth}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-sm text-left border-r-2" style={{ borderColor: '#2f8f5b' }}>
                          Longest inactive
                        </td>
                        <td className="p-3 text-sm text-left">
                          {stats.longestInactive}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Insight (LLM observation) */}
                <div className="p-4 text-black text-sm font-normal leading-relaxed">
                  {dynamicInsight || (
                    <>
                      Click the ⚡ button to generate insights about your posting activity.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}

