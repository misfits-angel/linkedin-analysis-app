'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import PeerComparison from './PeerComparison'

export default function PeerComparisonCard({ data }) {
  return (
    <ConditionalCard cardId="peer-comparison">
      <Card cardName="Peer Comparison Card">
        <CardContent>
          <PeerComparison data={data} />
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
