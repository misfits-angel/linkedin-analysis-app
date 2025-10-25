'use client'

import { useMemo, useRef } from 'react'
import Chart from './Chart'
import { createEngagementOverTimeChart } from '@/lib/chart-utils'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

// Import chart setup with plugins
import '@/lib/chart-setup'

export default function EngagementTrendChart({ data }) {
  // Chart refs for export functionality
  const engagementOverTimeRef = useRef(null)

  // Create chart configurations using useMemo for performance
  const engagementOverTimeConfig = useMemo(() => {
    if (!data) return null
    return createEngagementOverTimeChart(data)
  }, [data])

  if (!data) {
    return null
  }

  return (
    <ConditionalCard cardId="engagement-trend-chart">
      <Card cardName="Engagement Over Time Chart">
        <CardHeader>
          <CardTitle>📈 Engagement over time</CardTitle>
        </CardHeader>
        <CardContent>
          {engagementOverTimeConfig && (
            <Chart
              ref={engagementOverTimeRef}
              config={engagementOverTimeConfig}
              title="Engagement Over Time"
              showHeaderButton={false}
            />
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
