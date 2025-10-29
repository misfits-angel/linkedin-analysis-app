'use client'

import { useMemo, useRef, useState } from 'react'
import Chart from './Chart'
import { createPostsPerMonthChart } from '@/lib/chart-utils'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import { Zap, Loader2 } from 'lucide-react'
import { useReportContext } from '@/lib/hooks/useReportContext'

// Import chart setup with plugins
import '@/lib/chart-setup'

export default function PostsPerMonthChart({ data, isReportView = false }) {
  // Chart refs for export functionality
  const postsPerMonthRef = useRef(null)
  const [commentary, setCommentary] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { generateNarrativeInsights } = useLLMInsights('posts-per-month-chart')
  const isReportContext = useReportContext()

  // Create chart configurations using useMemo for performance
  const postsPerMonthConfig = useMemo(() => {
    if (!data) return null
    return createPostsPerMonthChart(data)
  }, [data])

  const handleGenerateCommentary = async () => {
    if (!data?.posts || data.posts.length === 0) {
      setCommentary('No posts available to analyze.')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateNarrativeInsights(data.posts)
      // Extract just one line commentary from the result
      const insights = result?.insights || []
      const oneLineCommentary = insights.length > 0
        ? insights[0]
        : 'Your posting cadence shows consistent activity patterns.'
      setCommentary(oneLineCommentary)
    } catch (error) {
      console.error('Error generating commentary:', error)
      setCommentary('Unable to generate commentary at this time.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!data) {
    return null
  }

  // Report view rendering without card wrapper
  if (isReportView) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-[#2f8f5b] mb-4">Posting cadence</h3>
        <div>
          {postsPerMonthConfig && (
            <Chart
              ref={postsPerMonthRef}
              config={postsPerMonthConfig}
              title="Posting Cadence"
              showHeaderButton={false}
              noBorder={true}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <ConditionalCard cardId="posts-per-month-chart">
      <Card cardName="Posting Cadence Chart">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>📅 Posting cadence</CardTitle>
          {!isReportContext && (
            <button 
              className="chart-export-btn-summary" 
              onClick={handleGenerateCommentary}
              disabled={isGenerating}
              title="Generate Commentary"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </button>
          )}
        </CardHeader>
        <CardContent>
          {postsPerMonthConfig && (
            <Chart
              ref={postsPerMonthRef}
              config={postsPerMonthConfig}
              title="Posting Cadence"
              showHeaderButton={false}
            />
          )}
          {commentary && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              {commentary}
            </div>
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
