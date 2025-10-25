'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function PeakMonthCard({ data }) {
  return (
    <ConditionalCard cardId="peak-month">
      <Card cardName="Peak Month Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            Peak Month
          </div>
          <div className="text-lg font-bold text-primary">
            {data?.trends?.posts_per_month ? 
              (() => {
                const peakMonth = Object.entries(data.trends.posts_per_month).reduce((max, [month, count]) => 
                  count > max.count ? { month, count } : max, 
                  { month: '', count: 0 }
                );
                return peakMonth.month ? (
                  <>
                    {new Date(peakMonth.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    <span className="text-xs text-muted-foreground ml-2">
                      {peakMonth.count} {peakMonth.count === 1 ? 'post' : 'posts'}
                    </span>
                  </>
                ) : 'N/A';
              })() : '-'}
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
