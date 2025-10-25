'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import ValueProposition from './ValueProposition'

export default function ValuePropositionCard({ data }) {
  return (
    <ConditionalCard cardId="value-proposition">
      <Card cardName="Value Proposition Card">
        <CardContent>
          <ValueProposition data={data} />
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
