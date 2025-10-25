'use client'

import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function EngagementByFormatCard({ data }) {
  if (!data?.mix?.type_stats) {
    return null
  }

  const typeStats = data.mix.type_stats
  const sorted = Object.entries(typeStats)
    .map(([k, v]) => ({ k, ...v }))
    .sort((a, b) => b.count - a.count)

  const generateInsights = () => {
    if (sorted.length < 2) return []

    const insights = []
    const top = sorted[0]
    const second = sorted[1]

    // Performance insights
    if (top.med > second.med * 1.5) {
      insights.push(
        <li key="performance" className="text-xs text-muted-foreground">
          <strong>{top.k.charAt(0).toUpperCase() + top.k.slice(1)}</strong> significantly outperforms other formats (median: {top.med} vs {second.med})
        </li>
      )
    }

    // Volume insights
    if (top.count > sorted.slice(1).reduce((sum, t) => sum + t.count, 0)) {
      insights.push(
        <li key="volume" className="text-xs text-muted-foreground">
          <strong>{top.k.charAt(0).toUpperCase() + top.k.slice(1)}</strong> dominates your content mix ({Math.round(top.share*100)}% of posts)
        </li>
      )
    }

    // Consistency insights
    const lowVariance = sorted.filter(t => t.max - t.min < t.med * 0.5)
    if (lowVariance.length > 0) {
      insights.push(
        <li key="consistency" className="text-xs text-muted-foreground">
          <strong>{lowVariance.map(t => t.k.charAt(0).toUpperCase() + t.k.slice(1)).join(', ')}</strong> show consistent engagement patterns
        </li>
      )
    }

    // Opportunity insights
    const highVariance = sorted.filter(t => t.max - t.min > t.med * 2)
    if (highVariance.length > 0) {
      insights.push(
        <li key="opportunity" className="text-xs text-muted-foreground">
          <strong>{highVariance.map(t => t.k.charAt(0).toUpperCase() + t.k.slice(1)).join(', ')}</strong> have high variance - potential for optimization
        </li>
      )
    }
    
    return insights
  }

  return (
    <ConditionalCard cardId="engagement-by-format">
      <Card cardName="Engagement by Post Type Card">
        <CardHeader>
          <CardTitle>📊 Engagement by post type</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm" role="list">
            {sorted.map(t => {
              const typeLabel = t.k.charAt(0).toUpperCase() + t.k.slice(1)
              const postLabel = t.count === 1 ? 'post' : 'posts'

              return (
                <div key={t.k}>
                  <li className="text-sm">
                    <strong>{typeLabel} {postLabel}:</strong> {t.count} {postLabel} ({Math.round(t.share*100)}%)
                  </li>
                  <div className="ml-6 text-xs text-muted-foreground mb-2">
                    • Median: <strong>{t.med}</strong> | Mean: <strong>{t.mean}</strong> | Peak: <strong>{t.max}</strong><br/>
                    • Bottom 25%: {t.q1} | Top 25%: <strong>{t.q3}</strong>
                  </div>
                </div>
              )
            })}
          </ul>

          {/* Comprehensive insights */}
          {sorted.length > 1 && (
            <div className="mt-4 pt-3 border-t">
              <ul className="space-y-1">
                {generateInsights()}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
