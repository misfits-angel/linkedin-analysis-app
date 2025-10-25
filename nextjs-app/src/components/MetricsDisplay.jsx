'use client'

import Card, { CardContent } from '@/components/CardWithName'

export default function MetricsDisplay({ data }) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card cardName="Posts Count Card">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            Posts <span className="text-xs">(excl. reshares)</span>
          </div>
          <div className="text-2xl font-bold text-primary" role="status" aria-live="polite">
            {(data?.summary?.posts_in_period ?? data?.summary?.posts_last_12m) || '-'}
          </div>
        </CardContent>
      </Card>

      <Card cardName="Active Months Card">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Active months</div>
          <div className="text-2xl font-bold text-primary" role="status" aria-live="polite">
            {data?.summary?.active_months || '-'}
          </div>
        </CardContent>
      </Card>

      <Card cardName="Median Engagement Card">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Median engagement</div>
          <div className="text-2xl font-bold text-primary" role="status" aria-live="polite">
            {data?.summary?.median_engagement || '-'}
          </div>
        </CardContent>
      </Card>

      <Card cardName="P90 Engagement Card">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-1">P90 engagement</div>
          <div className="text-2xl font-bold text-primary" role="status" aria-live="polite">
            {data?.summary?.p90_engagement || '-'}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
