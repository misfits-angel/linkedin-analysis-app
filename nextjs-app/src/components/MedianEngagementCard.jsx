'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function MedianEngagementCard({ data }) {
  return (
    <ConditionalCard cardId="median-engagement">
      <Card cardName="Median Engagement Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            Median engagement
          </div>
          <div className="text-2xl font-bold text-primary">
            {data?.summary?.median_engagement ?? '-'}
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
