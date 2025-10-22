'use client'

import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js'
import Card, { CardContent } from '@/components/CardWithName'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import LLMButton from './LLMButton'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale)

/**
 * Props:
 * - monthlyCounts: number[12] (Oct 2024 → Sep 2025 by default) - used for chart visualization only
 * - start: { month: 9, year: 2024 }  // 0-indexed month
 * - insight: string
 * - posts: array of post objects
 * - summaryData: object containing summary metrics (single source of truth for total count)
 */
const LinkedinAnalyticsCard = forwardRef(({
  monthlyCounts = [],
  start = { month: 9, year: 2024 }, // Oct 2024
  insight = '',
  posts = [],
  summaryData = null, // Add summary data as prop for consistency
}, ref) => {
  const [dynamicInsight, setDynamicInsight] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { generateNarrativeInsights } = useLLMInsights()

  const totalPosts = useMemo(() => {
    // Use summary data as single source of truth for consistency across all cards
    return summaryData?.posts_last_12m || 0
  }, [summaryData])

  const handleGenerateBriefSummary = async () => {
    if (!posts || posts.length === 0) {
      setDynamicInsight('No posts available to analyze.')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateNarrativeInsights(posts)
      // Extract brief insights from the result (2-3 key observations)
      const insights = result?.insights || []
      const briefSummary = insights.length > 0
        ? insights.slice(0, 3).join('\n\n')
        : 'Analysis complete - your LinkedIn strategy shows consistent engagement patterns.'
      setDynamicInsight(briefSummary)
    } catch (error) {
      console.error('Error generating brief summary:', error)
      setDynamicInsight('Unable to generate summary at this time.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Expose the generate function to parent components
  useImperativeHandle(ref, () => ({
    handleGenerateBriefSummary
  }))

  // Build left/right labels (e.g., Oct 2024 … Sep 2025)
  const { leftLabel, rightLabel } = useMemo(() => {
    const left = new Date(start.year, start.month, 1)
    const right = new Date(start.year, start.month + 11, 1)
    const fmt = (d) =>
      d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear()
    return { leftLabel: fmt(left), rightLabel: fmt(right) }
  }, [start])

  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(monthlyCounts) || monthlyCounts.length === 0)
      return

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        // We hide ticks, so these are placeholders (length should match data)
        labels: monthlyCounts.map((_, i) => i + 1),
        datasets: [
          {
            data: monthlyCounts,
            borderColor: '#FFFFFF',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: false,
            ticks: { display: false },
            grid: { display: false, drawBorder: false, drawOnChartArea: false },
            border: { display: false }
          },
          y: {
            display: false,
            ticks: { display: false },
            grid: { display: false, drawBorder: false, drawOnChartArea: false },
            border: { display: false }
          }, // No Y-axis per your spec
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: { display: false },
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 0
          }
        }
      },
    })
  }, [monthlyCounts])

  return (
    <Card cardName="LinkedIn Analytics Card" className="w-[320px] rounded-none overflow-hidden shadow-md bg-white border-none">
      <CardContent className="p-0">
        {/* Top (chart) */}
        <div className="bg-[#307254] p-4">
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium tracking-wide">
              Total Posts
            </span>
            <span className="text-white text-5xl font-bold mt-1">{totalPosts}</span>
          </div>

          <div className="relative w-full mt-2">
            {/* Chart area with maximum bottom spacing to separate from footer */}
            <div className="relative h-[90px] w-full overflow-hidden pb-8">
              <canvas
                ref={canvasRef}
                aria-label="Posts trend chart"
                role="img"
                className="border-none"
                style={{ border: 'none', background: 'transparent' }}
              ></canvas>
            </div>

            {/* Horizontal line - clear footer divider */}
            <div className="border-t-2 border-white w-full opacity-70"></div>

            {/* Date labels - right at the border, no padding below */}
            <div className="flex justify-between items-center pt-1 pb-0">
              <span className="text-xs text-white">{leftLabel}</span>
              <span className="text-xs text-white">{rightLabel}</span>
            </div>
          </div>
        </div>

        {/* Insight (LLM observation) */}
        <div className="p-4 text-black text-sm font-normal leading-relaxed whitespace-pre-line">
          {dynamicInsight || insight || (
            <>
              Founder stories outperformed other themes.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

LinkedinAnalyticsCard.displayName = 'LinkedinAnalyticsCard'

export default LinkedinAnalyticsCard
