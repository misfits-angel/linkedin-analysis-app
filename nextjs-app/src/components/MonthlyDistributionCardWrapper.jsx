'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import MonthlyDistributionCard from './MonthlyDistributionCard'

export default function MonthlyDistributionCardWrapper({ data }) {
  return (
    <ConditionalCard cardId="monthly-distribution">
      <Card cardName="Monthly Distribution Card">
        <CardContent>
          <MonthlyDistributionCard data={data} />
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
