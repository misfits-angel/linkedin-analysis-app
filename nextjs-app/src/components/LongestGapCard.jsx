'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function LongestGapCard({ data }) {
  return (
    <ConditionalCard cardId="longest-gap">
      <Card cardName="Longest Gap Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            Longest Gap
          </div>
          <div className="text-2xl font-bold text-primary">
            {data?.rhythm?.longest_gap ?? '-'} <span className="text-sm">days</span>
            {data?.rhythm?.longest_gap_start && data?.rhythm?.longest_gap_end && (
              <span className="text-xs text-muted-foreground ml-2">
                {new Date(data.rhythm.longest_gap_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(data.rhythm.longest_gap_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
