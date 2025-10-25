'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

export default function PostsCountCard({ data }) {
  return (
    <ConditionalCard cardId="posts-count">
      <Card cardName="Posts Count Card">
        <CardContent>
          <div className="text-sm text-muted-foreground mb-1">
            Posts <span className="text-xs">(excl. reshares)</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {data?.summary?.posts_in_period ?? data?.summary?.posts_last_12m ?? '-'}
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
