'use client'

import { useMemo } from 'react'
import Chart from './Chart'
import {
  createPostsPerMonthChart,
  createEngagementOverTimeChart,
  createFormatMixChart,
  createActionMixChart,
} from '@/lib/chart-utils'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'

// Import chart setup with plugins
import '@/lib/chart-setup'

export default function ChartSection({ data }) {
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
        <Card cardName="Posting Cadence Chart">
          <CardHeader>
            <CardTitle>📅 Posting cadence</CardTitle>
          </CardHeader>
          <CardContent>
            {postsPerMonthConfig && (
              <Chart
                config={postsPerMonthConfig}
                title="Posting Cadence"
              />
            )}
          </CardContent>
        </Card>

        <Card cardName="Engagement Over Time Chart">
          <CardHeader>
            <CardTitle>📈 Engagement over time</CardTitle>
          </CardHeader>
          <CardContent>
            {engagementOverTimeConfig && (
              <Chart
                config={engagementOverTimeConfig}
                title="Engagement Over Time"
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card cardName="Format Mix Chart">
          <CardHeader>
            <CardTitle>📊 Format mix</CardTitle>
          </CardHeader>
          <CardContent>
            {formatMixConfig && (
              <Chart
                config={formatMixConfig}
                title="Format Mix"
              />
            )}
          </CardContent>
        </Card>

        <Card cardName="Post vs Reshare Chart">
          <CardHeader>
            <CardTitle>🔄 Post vs Reshare</CardTitle>
          </CardHeader>
          <CardContent>
            {actionMixConfig && (
              <Chart
                config={actionMixConfig}
                title="Post vs Reshare"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
