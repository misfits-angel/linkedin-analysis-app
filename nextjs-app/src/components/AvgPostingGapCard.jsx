'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function AvgPostingGapCard({ data }) {
  return (
    <ConditionalCard cardId="avg-posting-gap">
      <Card cardName="Avg Posting Gap Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            Avg Posting Gap
          </div>
          <div className="text-2xl font-bold text-primary">
            {data?.rhythm?.avg_posting_gap ?? '-'} <span className="text-sm">days</span>
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
