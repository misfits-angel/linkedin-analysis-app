'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function P90EngagementCard({ data }) {
  return (
    <ConditionalCard cardId="p90-engagement">
      <Card cardName="P90 Engagement Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            P90 engagement
          </div>
          <div className="text-2xl font-bold text-primary">
            {data?.summary?.p90_engagement ?? '-'}
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
