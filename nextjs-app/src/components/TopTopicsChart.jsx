'use client'

import { useMemo, useRef } from 'react'
import Chart from './Chart'
import { createActionMixChart } from '@/lib/chart-utils'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

// Import chart setup with plugins
import '@/lib/chart-setup'

export default function TopTopicsChart({ data }) {
  // Chart refs for export functionality
  const actionMixRef = useRef(null)

  // Create chart configurations using useMemo for performance
  const actionMixConfig = useMemo(() => {
    if (!data) return null
    return createActionMixChart(data)
  }, [data])

  if (!data) {
    return null
  }

  return (
    <ConditionalCard cardId="top-topics-chart">
      <Card cardName="Post vs Reshare Chart">
        <CardHeader>
          <CardTitle>🔄 Post vs Reshare</CardTitle>
        </CardHeader>
        <CardContent>
          {actionMixConfig && (
            <Chart
              ref={actionMixRef}
              config={actionMixConfig}
              title="Post vs Reshare"
              showHeaderButton={false}
            />
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
