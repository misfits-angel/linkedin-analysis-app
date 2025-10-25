'use client'

import { useMemo, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { exportElementAsPNG, getCleanFilename, getTimestamp } from '@/lib/visual-export-utils'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { useReportContext } from '@/lib/hooks/useReportContext'

export default function DayWiseDistributionCard({ data }) {
  const containerRef = useRef(null)
  const isReportContext = useReportContext()
  
  const dayWiseData = useMemo(() => {
    if (!data?.distribution) return null

    const { monthly_daily } = data.distribution
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayAbbr = { 
      Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', 
      Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' 
    }

    // Get all months from actual data (sorted chronologically)
    const months = Object.keys(monthly_daily).sort()

    // Get actual first and last post dates from the posts data
    let startDate = null
    let endDate = null
    
    if (data?.posts && data.posts.length > 0) {
      const sortedPosts = [...data.posts].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date)
        const dateB = b.date instanceof Date ? b.date : new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })
      startDate = sortedPosts[0].date instanceof Date ? sortedPosts[0].date : new Date(sortedPosts[0].date)
      endDate = sortedPosts[sortedPosts.length - 1].date instanceof Date ? sortedPosts[sortedPosts.length - 1].date : new Date(sortedPosts[sortedPosts.length - 1].date)
    }

    // Calculate day-wise totals
    const dayWiseTotals = dayOrder.map(day => {
      let totalPosts = 0
      let totalEngagement = 0
      let engagementCount = 0

      months.forEach(month => {
        const cell = monthly_daily[month][day]
        if (cell.count > 0) {
          totalPosts += cell.count
          totalEngagement += cell.avg_engagement
          engagementCount++
        }
      })

      const avgEngagement = engagementCount > 0 ? totalEngagement / engagementCount : 0

      return {
        day,
        totalPosts,
        avgEngagement
      }
    })

    return {
      dayOrder,
      dayAbbr,
      dayWiseTotals,
      months,
      startDate,
      endDate
    }
  }, [data])

  const handleExport = async () => {
    if (!containerRef.current) {
      console.error('No element reference provided for PNG export')
      return
    }

    try {
      const cleanName = getCleanFilename('Day-wise Distribution Card')
      const timestamp = getTimestamp()
      const filename = `${cleanName}-${timestamp}`
      
      await exportElementAsPNG(containerRef.current, filename)
    } catch (error) {
      console.error('PNG export failed:', error)
    }
  }

  if (!dayWiseData) {
    return (
      <div className="text-sm text-muted-foreground">Distribution data not available.</div>
    )
  }

  const { dayOrder, dayAbbr, dayWiseTotals, months, startDate, endDate } = dayWiseData

  return (
    <Card cardName="Day-wise Distribution Card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">📅 Day-wise Distribution</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {startDate && endDate
              ? `${startDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getFullYear()} - ${endDate.getDate()} ${endDate.toLocaleDateString('en-US', { month: 'short' })} ${endDate.getFullYear()}`
              : 'No data available'
            }
          </div>
          {!isReportContext && (
            <button 
              className="chart-export-btn" 
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#D6E3DD' }}>
                  <TableHead className="w-[120px]">Day</TableHead>
                  <TableHead className="w-[80px] text-center">Posts</TableHead>
                  <TableHead className="w-[80px] text-center">Avg Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Data Rows */}
                {dayWiseTotals.map(({ day, totalPosts, avgEngagement }) => (
                  <TableRow key={day} className="bg-muted/50">
                    <TableCell className="font-medium">{dayAbbr[day]}</TableCell>
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
                    {Math.round(dayWiseTotals.reduce((sum, day) => sum + day.avgEngagement, 0) / dayWiseTotals.length)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
