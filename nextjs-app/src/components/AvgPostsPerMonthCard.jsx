'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function AvgPostsPerMonthCard({ data }) {
  return (
    <ConditionalCard cardId="avg-posts-per-month">
      <Card cardName="Avg Posts Per Month Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            Avg Posts/Month
          </div>
          <div className="text-2xl font-bold text-primary">
            {data?.summary?.posts_in_period ?? data?.summary?.posts_last_12m ? 
              Math.round(((data.summary.posts_in_period ?? data.summary.posts_last_12m) / (data.summary.analysis_period_months || 12)) * 10) / 10 : '-'}
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
