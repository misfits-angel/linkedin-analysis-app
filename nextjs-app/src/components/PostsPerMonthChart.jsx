'use client'

import { useMemo, useRef } from 'react'
import Chart from './Chart'
import { createPostsPerMonthChart } from '@/lib/chart-utils'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

// Import chart setup with plugins
import '@/lib/chart-setup'

export default function PostsPerMonthChart({ data }) {
  // Chart refs for export functionality
  const postsPerMonthRef = useRef(null)

  // Create chart configurations using useMemo for performance
  const postsPerMonthConfig = useMemo(() => {
    if (!data) return null
    return createPostsPerMonthChart(data)
  }, [data])

  if (!data) {
    return null
  }

  return (
    <ConditionalCard cardId="posts-per-month-chart">
      <Card cardName="Posting Cadence Chart">
        <CardHeader>
          <CardTitle>📅 Posting cadence</CardTitle>
        </CardHeader>
        <CardContent>
          {postsPerMonthConfig && (
            <Chart
              ref={postsPerMonthRef}
              config={postsPerMonthConfig}
              title="Posting Cadence"
              showHeaderButton={false}
            />
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
