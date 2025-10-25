'use client'

import { useMemo, useRef, useState } from 'react'
import { labelMonth } from '@/lib/utils/dateUtils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { exportElementAsPNG, getCleanFilename, getTimestamp } from '@/lib/visual-export-utils'

export default function MonthlyDistributionCard({ data }) {
  const containerRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const monthlyData = useMemo(() => {
    if (!data?.distribution) return null

    const { monthly_daily } = data.distribution
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Get month order (last 12 months)
    const months = Object.keys(monthly_daily).sort()

    // Calculate monthly totals
    const monthlyTotals = months.map(month => {
      let totalPosts = 0
      let totalEngagement = 0
      let engagementCount = 0

      dayOrder.forEach(day => {
        const cell = monthly_daily[month][day]
        if (cell.count > 0) {
          totalPosts += cell.count
          totalEngagement += cell.avg_engagement
          engagementCount++
        }
      })

      const avgEngagement = engagementCount > 0 ? totalEngagement / engagementCount : 0

      return {
        month,
        totalPosts,
        avgEngagement
      }
    })

    return {
      months,
      monthlyTotals
    }
  }, [data])

  const handleExport = async () => {
    if (!containerRef.current) {
      console.error('No element reference provided for PNG export')
      return
    }

    try {
      const cleanName = getCleanFilename('Monthly Distribution Card')
      const timestamp = getTimestamp()
      const filename = `${cleanName}-${timestamp}`
      
      await exportElementAsPNG(containerRef.current, filename)
    } catch (error) {
      console.error('PNG export failed:', error)
    }
  }

  if (!monthlyData) {
    return (
      <div className="text-sm text-muted-foreground">Distribution data not available.</div>
    )
  }

  const { months, monthlyTotals } = monthlyData
  
  // Determine how many rows to show initially (12 rows + total row)
  const initialRowsToShow = 12
  const hasMoreRows = monthlyTotals.length > initialRowsToShow
  const visibleRows = isExpanded ? monthlyTotals : monthlyTotals.slice(0, initialRowsToShow)

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {data?.summary?.analysis_period_months ? 
            `Last ${data.summary.analysis_period_months} months: ${labelMonth(months[0])} - ${labelMonth(months[months.length - 1])}` :
            `Last 12 months: ${labelMonth(months[0])} - ${labelMonth(months[months.length - 1])}`
          }
        </div>
        <button 
          className="chart-export-btn" 
          onClick={handleExport}
          title="Export as High-Resolution PNG"
        >
          📥
        </button>
      </div>
      <div ref={containerRef}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#D6E3DD' }}>
                <TableHead className="w-[120px]">Month</TableHead>
                <TableHead className="w-[80px] text-center">Posts</TableHead>
                <TableHead className="w-[80px] text-center">Avg Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Data Rows - Monthly */}
              {visibleRows.map(({ month, totalPosts, avgEngagement }) => (
                <TableRow key={month} className="bg-muted/50">
                  <TableCell className="font-medium">{labelMonth(month)}</TableCell>
                  <TableCell className="text-center">{totalPosts > 0 ? totalPosts : ''}</TableCell>
                  <TableCell className="text-center">{avgEngagement > 0 ? Math.round(avgEngagement) : ''}</TableCell>
                </TableRow>
              ))}
              
              {/* Total Row */}
              <TableRow className="bg-muted font-semibold">
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-center font-semibold">
                  {(data?.summary?.posts_in_period ?? data?.summary?.posts_last_12m) || 0}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {Math.round(monthlyTotals.reduce((sum, month) => sum + month.avgEngagement, 0) / monthlyTotals.length)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* See More/Less Toggle Button */}
        {hasMoreRows && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50"
            >
              {isExpanded ? (
                <>
                  <span>See Less</span>
                  <span className="text-gray-400">↑</span>
                </>
              ) : (
                <>
                  <span>See More ({monthlyTotals.length - initialRowsToShow} more)</span>
                  <span className="text-gray-400">↓</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
