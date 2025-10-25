'use client'

import { useMemo, useRef } from 'react'
import Chart from './Chart'
import { createFormatMixChart } from '@/lib/chart-utils'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

// Import chart setup with plugins
import '@/lib/chart-setup'

export default function FormatMixChart({ data }) {
  // Chart refs for export functionality
  const formatMixRef = useRef(null)

  // Create chart configurations using useMemo for performance
  const formatMixConfig = useMemo(() => {
    if (!data) return null
    return createFormatMixChart(data)
  }, [data])

  if (!data) {
    return null
  }

  return (
    <ConditionalCard cardId="format-mix-chart">
      <Card cardName="Format Mix Chart">
        <CardHeader>
          <CardTitle>📊 Format mix</CardTitle>
        </CardHeader>
        <CardContent>
          {formatMixConfig && (
            <Chart
              ref={formatMixRef}
              config={formatMixConfig}
              title="Format Mix"
              showHeaderButton={false}
            />
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
