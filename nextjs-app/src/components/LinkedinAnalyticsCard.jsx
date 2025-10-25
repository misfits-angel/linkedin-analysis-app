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
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import LLMButton from './LLMButton'
import { Zap, Loader2 } from 'lucide-react'
import { useReportContext } from '@/lib/hooks/useReportContext'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale)

/**
 * Props:
 * - monthlyCounts: number[] - used for chart visualization only
 * - postsPerMonth: object with month keys (e.g., "2024-10", "2024-11") - used to calculate dynamic date range
 * - insight: string
 * - posts: array of post objects
 * - summaryData: object containing summary metrics (single source of truth for total count)
 */
const LinkedinAnalyticsCard = forwardRef(({
  monthlyCounts = [],
  postsPerMonth = {},
  insight = '',
  posts = [],
  summaryData = null, // Add summary data as prop for consistency
}, ref) => {
  const [dynamicInsight, setDynamicInsight] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { generateNarrativeInsights } = useLLMInsights('linkedin-analytics')
  const containerRef = useRef(null)
  const isReportContext = useReportContext()

  // Direct property access - no need for useMemo for simple property lookup
  const totalPosts = summaryData?.posts_last_12m || 0

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

  // Calculate dynamic start and end dates from postsPerMonth data
  const { dynamicStart, dynamicEnd } = useMemo(() => {
    if (!postsPerMonth || Object.keys(postsPerMonth).length === 0) {
      // Fallback to current date minus 12 months
      const now = new Date()
      return { 
        dynamicStart: { month: now.getMonth() - 11, year: now.getFullYear() },
        dynamicEnd: { month: now.getMonth(), year: now.getFullYear() }
      }
    }
    
    // Get all month keys and sort them
    const monthKeys = Object.keys(postsPerMonth).sort()
    if (monthKeys.length === 0) {
      const now = new Date()
      return { 
        dynamicStart: { month: now.getMonth() - 11, year: now.getFullYear() },
        dynamicEnd: { month: now.getMonth(), year: now.getFullYear() }
      }
    }
    
    // Parse the first month key (e.g., "2024-10" -> { year: 2024, month: 9 })
    const firstMonth = monthKeys[0]
    const [startYear, startMonth] = firstMonth.split('-').map(Number)
    
    // Parse the last month key for accurate end date
    const lastMonth = monthKeys[monthKeys.length - 1]
    const [endYear, endMonth] = lastMonth.split('-').map(Number)
    
    return { 
      dynamicStart: { month: startMonth - 1, year: startYear }, // month is 0-indexed in Date constructor
      dynamicEnd: { month: endMonth - 1, year: endYear }
    }
  }, [postsPerMonth])

  // Build left/right labels (e.g., Jan 2024 … Dec 2024) - dynamically calculated from data
  const { leftLabel, rightLabel } = useMemo(() => {
    const left = new Date(dynamicStart.year, dynamicStart.month, 1)
    const right = new Date(dynamicEnd.year, dynamicEnd.month, 1)
    const fmt = (d) =>
      d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear()
    return { leftLabel: fmt(left), rightLabel: fmt(right) }
  }, [dynamicStart, dynamicEnd])

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

  const handleExport = async () => {
    if (!containerRef.current) {
      console.error('No element reference provided for PNG export')
      return
    }

    try {
      const { exportElementAsPNG, getCleanFilename, getTimestamp } = await import('@/lib/visual-export-utils')
      const cleanName = getCleanFilename("LinkedIn Analytics Card")
      const timestamp = getTimestamp()
      const filename = `${cleanName}-${timestamp}`
      
      await exportElementAsPNG(containerRef.current, filename)
    } catch (error) {
      console.error('PNG export failed:', error)
    }
  }

  return (
    <Card cardName="LinkedIn Analytics Card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">📈 LinkedIn Analytics</CardTitle>
        <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

LinkedinAnalyticsCard.displayName = 'LinkedinAnalyticsCard'

export default LinkedinAnalyticsCard
