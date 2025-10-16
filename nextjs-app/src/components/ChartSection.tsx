'use client'

import { useMemo } from 'react'
import Chart from './Chart'
import {
  createPostsPerMonthChart,
  createEngagementOverTimeChart,
  createFormatMixChart,
  createActionMixChart,
  AnalysisData,
} from '@/lib/chart-utils'

// Import chart setup with plugins
import '@/lib/chart-setup'

interface ChartSectionProps {
  data: AnalysisData
}

export default function ChartSection({ data }: ChartSectionProps) {
  // Create chart configurations using useMemo for performance
  const postsPerMonthConfig = useMemo(() => {
    if (!data) return null
    return createPostsPerMonthChart(data)
  }, [data])

  const engagementOverTimeConfig = useMemo(() => {
    if (!data) return null
    return createEngagementOverTimeChart(data)
  }, [data])

  const formatMixConfig = useMemo(() => {
    if (!data) return null
    return createFormatMixChart(data)
  }, [data])

  const actionMixConfig = useMemo(() => {
    if (!data) return null
    return createActionMixChart(data)
  }, [data])

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="section-title-spaced">Posting cadence</div>
          {postsPerMonthConfig && (
            <Chart
              config={postsPerMonthConfig}
              title="Posting Cadence"
            />
          )}
        </div>
        
        <div className="card p-4">
          <div className="section-title-spaced">Engagement over time (baseline quality vs reach)</div>
          {engagementOverTimeConfig && (
            <Chart
              config={engagementOverTimeConfig}
              title="Engagement Over Time"
            />
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="section-title-spaced">Format mix</div>
          {formatMixConfig && (
            <Chart
              config={formatMixConfig}
              title="Format Mix"
            />
          )}
        </div>
        
        <div className="card p-4">
          <div className="section-title-spaced">Post vs Reshare</div>
          {actionMixConfig && (
            <Chart
              config={actionMixConfig}
              title="Post vs Reshare"
            />
          )}
        </div>
      </section>
    </div>
  )
}
