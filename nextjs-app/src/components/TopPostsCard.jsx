'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import TopPosts from './TopPosts'

export default function TopPostsCard({ data }) {
  return (
    <ConditionalCard cardId="top-posts">
      <Card cardName="Top Posts Card">
        <CardContent>
          <TopPosts data={data} />
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
