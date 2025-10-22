'use client'

import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'

export default function PostingRhythm({ data }) {
  const rhythm = data?.rhythm || {}
  
  if (!rhythm.avg_posting_gap) {
    return (
      <Card cardName="Posting Rhythm Card">
        <CardHeader>
          <CardTitle>📈 Posting Rhythm & Continuity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Rhythm data not available.</div>
        </CardContent>
      </Card>
    )
  }

  // Calculate additional metrics
  const postsPerMonthAvg = data?.summary?.posts_last_12m ? 
    Math.round((data.summary.posts_last_12m / 12) * 10) / 10 : 0
  
  const peakMonth = data?.trends?.posts_per_month ? 
    Object.entries(data.trends.posts_per_month).reduce((max, [month, count]) => 
      count > max.count ? { month, count } : max, 
      { month: '', count: 0 }
    ) : null

  return (
    <Card cardName="Posting Rhythm Card">
      <CardHeader>
        <CardTitle>📈 Posting Rhythm & Continuity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {/* Avg Posts/Month */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <div className="text-xs text-muted-foreground mb-1">Avg Posts/Month</div>
            <div className="text-2xl font-bold">{postsPerMonthAvg}</div>
          </div>

          {/* Longest Gap */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
            <div className="text-xs text-muted-foreground mb-1">Longest Gap</div>
            <div className="text-2xl font-bold">
              {rhythm.longest_gap || 0} <span className="text-sm">days</span>
            </div>
            {rhythm.longest_gap_start && rhythm.longest_gap_end && (
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(rhythm.longest_gap_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(rhythm.longest_gap_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>

          {/* Average Gap */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
            <div className="text-xs text-muted-foreground mb-1">Avg Posting Gap</div>
            <div className="text-2xl font-bold">
              {rhythm.avg_posting_gap || 0} <span className="text-sm">days</span>
            </div>
          </div>

          {/* Peak Month */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="text-xs text-muted-foreground mb-1">Peak Month</div>
            <div className="text-lg font-bold">
              {peakMonth && peakMonth.month ? new Date(peakMonth.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {peakMonth && peakMonth.month ? `${peakMonth.count} ${peakMonth.count === 1 ? 'post' : 'posts'}` : ''}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
