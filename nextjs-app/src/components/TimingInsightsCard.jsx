'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import TimingInsights from './TimingInsights'

export default function TimingInsightsCard({ data }) {
  return (
    <ConditionalCard cardId="timing-insights">
      <Card cardName="Timing Insights Card">
        <CardContent>
          <TimingInsights data={data} />
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
