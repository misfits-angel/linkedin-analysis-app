'use client'

import TopicAnalysis from './TopicAnalysis'

interface EngagementAnalysisProps {
  data: any
}

export default function EngagementAnalysis({ data }: EngagementAnalysisProps) {
  const share = data?.mix?.type_share || {}
  const med = data?.mix?.type_median_engagement || {}
  const mean = data?.mix?.type_mean_engagement || {}
  const q1 = data?.mix?.type_q1_engagement || {}
  const q3 = data?.mix?.type_q3_engagement || {}
  const max = data?.mix?.type_max_engagement || {}
  const counts = data?.mix?.type_counts || {}
  const keys = Object.keys({...share, ...med})
  
  if (keys.length === 0) {
    return (
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="section-title-spaced">Engagement by post type</div>
          <div className="text-sm text-gray-600">No post type data available.</div>
        </div>
        
        {/* Topic Analysis on the right */}
        <TopicAnalysis postsData={data.posts} />
      </section>
    )
  }
  
  // Sort by median engagement (highest to lowest)
  const sorted = keys.map(k => ({
    k, 
    med: med[k] || 0, 
    mean: mean[k] || 0,
    q1: q1[k] || 0,
    q3: q3[k] || 0,
    max: max[k] || 0,
    share: share[k] || 0, 
    count: counts[k] || 0
  })).sort((a, b) => b.med - a.med)

  const generateInsights = () => {
    const insights = []
    let smallSampleInsight = null
    
    if (sorted.length > 1) {
      // 1. Performance comparison
      const best = sorted[0]
      const worst = sorted[sorted.length - 1]
      if (best.med > worst.med * 1.5) {
        const bestLabel = best.k.charAt(0).toUpperCase() + best.k.slice(1)
        const worstLabel = worst.k.charAt(0).toUpperCase() + worst.k.slice(1)
        const improvement = Math.round((best.med / worst.med - 1) * 100)
        insights.push(
          <li key="performance-gap" className="text-gray-700 text-xs">
            <strong>💡 Performance Gap:</strong> {bestLabel} posts outperform {worstLabel} posts by {improvement}% on median engagement
          </li>
        )
      }
      
      // 2. Top quartile ceiling (growth potential)
      const bestQ3 = sorted[0]
      if (bestQ3.count >= 3) {
        const bestLabel = bestQ3.k.charAt(0).toUpperCase() + bestQ3.k.slice(1)
        const improvement = Math.round((bestQ3.q3/bestQ3.med - 1) * 100)
        insights.push(
          <li key="high-ceiling" className="text-gray-700 text-xs">
            <strong>🎯 High Ceiling:</strong> {bestLabel} posts' top 25% achieve {bestQ3.q3}+ engagement ({improvement}% above median)
          </li>
        )
      }
      
      // 3. Consistency analysis
      let mostConsistent: { k: string; q1: number; q3: number; count: number } | null = null
      let bestConsistencyScore = Infinity
      sorted.forEach(t => {
        if (t.count >= 5) {
          const spread = t.q3 - t.q1
          const relativeSpread = spread / t.med
          if (relativeSpread < bestConsistencyScore) {
            bestConsistencyScore = relativeSpread
            mostConsistent = t
          }
        }
      })
      
      if (mostConsistent && bestConsistencyScore < 1) {
        const label = (mostConsistent as any).k.charAt(0).toUpperCase() + (mostConsistent as any).k.slice(1)
        insights.push(
          <li key="most-consistent" className="text-gray-700 text-xs">
            <strong>📊 Most Consistent:</strong> {label} posts show reliable performance (Q1: {(mostConsistent as any).q1} → Q3: {(mostConsistent as any).q3})
          </li>
        )
      }
      
      // 4. Outlier detection (mean vs median)
      const skewed = sorted.filter(t => t.count >= 5 && t.mean > t.med * 1.3)
      if (skewed.length > 0) {
        const t = skewed[0]
        const label = t.k.charAt(0).toUpperCase() + t.k.slice(1)
        insights.push(
          <li key="hidden-gems" className="text-gray-700 text-xs">
            <strong>🌟 Hidden Gems:</strong> {label} posts have viral potential (mean: {t.mean} vs median: {t.med}) - some posts greatly outperform the rest
          </li>
        )
      }
      
      // 5. Sample size warning (moved to last)
      const smallSample = sorted.filter(t => t.count < 5 && t.count > 0)
      if (smallSample.length > 0) {
        const types = smallSample.map(t => t.k.charAt(0).toUpperCase() + t.k.slice(1)).join(', ')
        const countLabels = smallSample.map(t => {
          const postLabel = t.count === 1 ? 'post' : 'posts'
          return `${t.count} ${postLabel}`
        }).join(', ')
        smallSampleInsight = (
          <li key="small-sample" className="text-gray-700 text-xs">
            <strong>⚠️ Small Sample:</strong> {types} ({countLabels}) - insights may vary with more data
          </li>
        )
      }
    }
    
    // Add the small sample warning at the end
    if (smallSampleInsight) {
      insights.push(smallSampleInsight)
    }
    
    return insights
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-4">
        <div className="section-title-spaced">Engagement by post type</div>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700" role="list">
          {sorted.map(t => {
            const typeLabel = t.k.charAt(0).toUpperCase() + t.k.slice(1)
            const postLabel = t.count === 1 ? 'post' : 'posts'
            
            return (
              <div key={t.k}>
                <li className="text-sm text-gray-700">
                  <strong>{typeLabel} {postLabel}:</strong> {t.count} {postLabel} ({Math.round(t.share*100)}%)
                </li>
                <div className="ml-6 text-xs text-gray-500 mb-2">
                  • Median: <strong>{t.med}</strong> | Mean: <strong>{t.mean}</strong> | Peak: <strong>{t.max}</strong><br/>
                  • Bottom 25%: {t.q1} | Top 25%: <strong>{t.q3}</strong>
                </div>
              </div>
            )
          })}
        </ul>
        
        {/* Comprehensive insights */}
        {sorted.length > 1 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <ul className="space-y-1">
              {generateInsights()}
            </ul>
          </div>
        )}
      </div>
      
      {/* Topic Analysis on the right */}
      <TopicAnalysis postsData={data.posts} />
    </section>
  )
}
