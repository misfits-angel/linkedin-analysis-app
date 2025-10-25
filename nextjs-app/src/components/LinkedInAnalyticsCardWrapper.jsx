'use client'

import { useRef } from 'react'
import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import LinkedinAnalyticsCard from './LinkedinAnalyticsCard'

export default function LinkedInAnalyticsCardWrapper({ data }) {
  const linkedinCardRef = useRef(null)

  if (!data?.trends?.posts_per_month) {
    return null
  }

  return (
    <ConditionalCard cardId="linkedin-analytics">
      <Card cardName="LinkedIn Analytics Card">
        <CardContent>
          <div className="space-y-4">
            <LinkedinAnalyticsCard
              ref={linkedinCardRef}
              monthlyCounts={Object.values(data.trends.posts_per_month)}
              postsPerMonth={data.trends.posts_per_month}
              insight=""
              posts={data.posts || []}
              summaryData={data.summary}
            />
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
