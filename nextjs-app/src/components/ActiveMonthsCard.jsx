'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function ActiveMonthsCard({ data }) {
  return (
    <ConditionalCard cardId="active-months">
      <Card cardName="Active Months Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            Active months
          </div>
          <div className="text-2xl font-bold text-primary">
            {data?.summary?.active_months ?? '-'}
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
