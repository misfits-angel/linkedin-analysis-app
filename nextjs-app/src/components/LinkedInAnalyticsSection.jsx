import IndependentColumnLayout from '@/components/IndependentColumnLayout'
import { Badge } from '@/components/ui/badge'
import PostsCountCard from '@/components/PostsCountCard'
import ActiveMonthsCard from '@/components/ActiveMonthsCard'
import MedianEngagementCard from '@/components/MedianEngagementCard'
import P90EngagementCard from '@/components/P90EngagementCard'
import AvgPostsPerMonthCard from '@/components/AvgPostsPerMonthCard'
import LongestGapCard from '@/components/LongestGapCard'
import AvgPostingGapCard from '@/components/AvgPostingGapCard'
import PeakMonthCard from '@/components/PeakMonthCard'
import LinkedInAnalyticsCardWrapper from '@/components/LinkedInAnalyticsCardWrapper'
import PostTypeDistributionCard from '@/components/PostTypeDistributionCard'
import EngagementTrendChart from '@/components/EngagementTrendChart'
import PostsPerMonthChart from '@/components/PostsPerMonthChart'
import FormatMixChart from '@/components/FormatMixChart'
import TopTopicsChart from '@/components/TopTopicsChart'
import EngagementByFormatCard from '@/components/EngagementByFormatCard'
import NarrativeInsightsCard from '@/components/NarrativeInsightsCard'
import PositioningAnalysisCard from '@/components/PositioningAnalysisCard'
import PostQualityEvaluation from '@/components/PostQualityEvaluation'
import TimingInsightsCard from '@/components/TimingInsightsCard'
import DayWiseDistributionCardWrapper from '@/components/DayWiseDistributionCardWrapper'
import MonthlyDistributionCardWrapper from '@/components/MonthlyDistributionCardWrapper'
import TopicAnalysisCard from '@/components/TopicAnalysisCard'
import TopPostsCard from '@/components/TopPostsCard'
import PeerComparisonCard from '@/components/PeerComparisonCard'
import ValuePropositionCard from '@/components/ValuePropositionCard'
import ConditionalCard from '@/components/ConditionalCard'

export default function LinkedInAnalyticsSection({ data }) {
  return (
    <section className="space-y-6">
      {/* Section Header with Profile Info */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          {data?.profile?.name || 'LinkedIn Analytics'}
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {data?.summary?.analysis_period_months ? 
              `Last ${data.summary.analysis_period_months} months` : 
              'Last 12 months'
            }
          </Badge>
        </div>
        <p className="text-muted-foreground">Comprehensive insights into your LinkedIn performance</p>
      </div>

      {/* Two-Column Analytics Layout */}
      <IndependentColumnLayout
        cardIds={[
          'posts-count',
          'active-months', 
          'median-engagement',
          'p90-engagement',
          'avg-posts-per-month',
          'longest-gap',
          'avg-posting-gap',
          'peak-month',
          'linkedin-analytics',
          'post-type-mosaic',
          'engagement-trend-chart',
          'posts-per-month-chart',
          'format-mix-chart',
          'top-topics-chart',
          'engagement-by-format',
          'ai-insights-summary',
          'ai-recommendations',
          'ai-content-analysis',
          'timing-insights',
          'day-wise-distribution',
          'monthly-distribution',
          'ai-topic-analysis',
          'top-posts',
          'peer-comparison',
          'value-proposition'
        ]}
      >
        {/* Key Metrics Cards */}
        <PostsCountCard data={data} />
        <ActiveMonthsCard data={data} />
        <MedianEngagementCard data={data} />
        <P90EngagementCard data={data} />
        <AvgPostsPerMonthCard data={data} />
        <LongestGapCard data={data} />
        <AvgPostingGapCard data={data} />
        <PeakMonthCard data={data} />

        {/* Analytics Cards */}
        <LinkedInAnalyticsCardWrapper data={data} />
        <PostTypeDistributionCard data={data} />

        {/* Individual Chart Cards */}
        <EngagementTrendChart data={data} />
        <PostsPerMonthChart data={data} />
        <FormatMixChart data={data} />
        <TopTopicsChart data={data} />

        {/* Individual Engagement Card */}
        <EngagementByFormatCard data={data} />

        {/* Individual AI Cards */}
        <NarrativeInsightsCard data={data} />
        <PositioningAnalysisCard data={data} />

        {/* Post Quality Evaluation */}
        <ConditionalCard cardId="ai-content-analysis">
          <PostQualityEvaluation postsData={data?.posts || []} llmInsights={data?.llmInsights} />
        </ConditionalCard>

        {/* Pattern Cards */}
        <TimingInsightsCard data={data} />
        <DayWiseDistributionCardWrapper data={data} />
        <MonthlyDistributionCardWrapper data={data} />

        {/* Content Analysis Cards */}
        <TopicAnalysisCard data={data} />
        <TopPostsCard data={data} />
        <PeerComparisonCard data={data} />
        <ValuePropositionCard data={data} />

      </IndependentColumnLayout>
    </section>
  )
}
