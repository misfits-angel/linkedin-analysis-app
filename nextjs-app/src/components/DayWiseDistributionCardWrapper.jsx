'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import DayWiseDistributionCard from './DayWiseDistributionCard'

export default function DayWiseDistributionCardWrapper({ data }) {
  return (
    <ConditionalCard cardId="day-wise-distribution">
      <Card cardName="Day-wise Distribution Card">
        <CardContent>
          <DayWiseDistributionCard data={data} />
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
