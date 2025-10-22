'use client'

import { useMemo } from 'react'
import { labelMonth } from '@/lib/csv-processor'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function PostDistributionHeatmap({ data }) {
  const heatmapData = useMemo(() => {
    if (!data?.distribution) return null

    const { monthly_daily, insights } = data.distribution
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayAbbr = { 
      Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', 
      Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' 
    }

    // Get all engagement values to calculate percentiles
    const allEngagements = []
    Object.values(monthly_daily).forEach(monthData => {
      Object.values(monthData).forEach(cell => {
        if (cell.count > 0) {
          allEngagements.push(cell.avg_engagement)
        }
      })
    })

    const sortedEngagements = [...allEngagements].sort((a, b) => a - b)
    const q25 = sortedEngagements[Math.floor(sortedEngagements.length * 0.25)] || 0
    const q75 = sortedEngagements[Math.floor(sortedEngagements.length * 0.75)] || 0

    // Get month order (last 12 months)
    const months = Object.keys(monthly_daily).sort()

    return {
      months,
      dayOrder,
      dayAbbr,
      monthly_daily,
      insights,
      q25,
      q75,
      maxEngagement: Math.max(...allEngagements, 1)
    }
  }, [data])

  if (!heatmapData) {
    return (
      <Card cardName="Post Distribution Heatmap Card">
        <CardHeader>
          <CardTitle>📅 Post Distribution Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Distribution data not available.</div>
        </CardContent>
      </Card>
    )
  }

  const { months, dayOrder, dayAbbr, monthly_daily, insights, q25, q75, maxEngagement } = heatmapData

  const getEngagementColor = (engagement, count) => {
    if (count === 0) return 'bg-gray-50 border-gray-200'
    
    const intensity = engagement / maxEngagement
    if (intensity >= 0.75) return 'bg-green-600 text-white border-green-700'
    if (intensity >= 0.5) return 'bg-green-500 text-white border-green-600'
    if (intensity >= 0.25) return 'bg-green-400 text-white border-green-500'
    return 'bg-green-300 text-gray-800 border-green-400'
  }

  const getEngagementIntensity = (engagement) => {
    if (engagement === 0) return 0
    if (engagement >= q75) return 4 // High
    if (engagement >= q25) return 3 // Medium-High
    if (engagement > 0) return 2 // Medium
    return 1 // Low
  }

  return (
    <Card cardName="Post Distribution Heatmap Card">
      <CardHeader>
        <CardTitle>📅 Post Distribution</CardTitle>
        <div className="text-xs text-muted-foreground">Last 12 months: {labelMonth(months[0])} - {labelMonth(months[months.length - 1])}</div>
      </CardHeader>
      <CardContent>
      
      {/* Two Column Layout for Tables */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Day wise Distribution Table */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-3">Day wise Distribution</div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-[120px]">Day</TableHead>
                  <TableHead className="w-[80px] text-center">Posts</TableHead>
                  <TableHead className="w-[80px] text-center">Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>

              {/* Data Rows */}
              {dayOrder.map((day) => {
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

                return (
                  <TableRow key={day} className="bg-muted/50">
                    <TableCell className="font-medium">{dayAbbr[day]}</TableCell>
                    <TableCell className="text-center">{totalPosts > 0 ? totalPosts : ''}</TableCell>
                    <TableCell className="text-center">{avgEngagement > 0 ? Math.round(avgEngagement) : ''}</TableCell>
                  </TableRow>
                )
              })}
              
              {/* Total Row */}
              <TableRow className="bg-muted font-semibold">
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-center font-semibold">
                  {data?.summary?.posts_last_12m || 0}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {Math.round(Object.values(monthly_daily).reduce((sum, monthData) => {
                    const monthEngagements = Object.values(monthData).filter(cell => cell.count > 0).map(cell => cell.avg_engagement)
                    return sum + (monthEngagements.length > 0 ? monthEngagements.reduce((a, b) => a + b, 0) / monthEngagements.length : 0)
                  }, 0) / months.length)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Monthly Distribution Table */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-3">Monthly Distribution</div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-[120px]">Month</TableHead>
                  <TableHead className="w-[80px] text-center">Posts</TableHead>
                  <TableHead className="w-[80px] text-center">Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>

              {/* Data Rows - Monthly */}
              {months.map((month) => {
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

                return (
                  <TableRow key={month} className="bg-muted/50">
                    <TableCell className="font-medium">{labelMonth(month)}</TableCell>
                    <TableCell className="text-center">{totalPosts > 0 ? totalPosts : ''}</TableCell>
                    <TableCell className="text-center">{avgEngagement > 0 ? Math.round(avgEngagement) : ''}</TableCell>
                  </TableRow>
                )
              })}
              
              {/* Total Row */}
              <TableRow className="bg-muted font-semibold">
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-center font-semibold">
                  {data?.summary?.posts_last_12m || 0}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {Math.round(Object.values(monthly_daily).reduce((sum, monthData) => {
                    const monthEngagements = Object.values(monthData).filter(cell => cell.count > 0).map(cell => cell.avg_engagement)
                    return sum + (monthEngagements.length > 0 ? monthEngagements.reduce((a, b) => a + b, 0) / monthEngagements.length : 0)
                  }, 0) / months.length)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm font-semibold text-blue-800 mb-3">💡 Key Insights</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📊</span>
            <span className="text-blue-700">
              Most active day: <strong>{insights.most_active_day}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🎯</span>
            <span className="text-blue-700">
              Best engagement: <strong>{insights.best_engagement_day}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📈</span>
            <span className="text-blue-700">
              Peak month: <strong>{labelMonth(insights.peak_month)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🔄</span>
            <span className="text-blue-700">
              Consistency: <strong>{insights.consistency_score}%</strong> active months
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  )
}
