'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import TopicAnalysis from './TopicAnalysis'

export default function TopicAnalysisCard({ data }) {
  return (
    <ConditionalCard cardId="ai-topic-analysis">
      <Card cardName="Topic Analysis Card">
        <CardContent>
          <TopicAnalysis postsData={data?.posts || []} llmInsights={data?.llmInsights} />
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
