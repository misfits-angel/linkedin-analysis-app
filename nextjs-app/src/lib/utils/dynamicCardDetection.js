/**
 * Dynamic Card Detection Utility
 * Automatically detects all visible cards and their components for dynamic report generation
 */

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
import WhyUsCard from '@/components/WhyUsCard'
import HowWeWorkCard from '@/components/HowWeWorkCard'
import WhatYouGetCard from '@/components/WhatYouGetCard'
import InvestmentTermsCard from '@/components/InvestmentTermsCard'
import NextStepsCard from '@/components/NextStepsCard'

/**
 * Card Component Registry
 * Maps card IDs to their corresponding React components
 */
export const CARD_COMPONENT_REGISTRY = {
  // Key Metrics Cards
  'posts-count': PostsCountCard,
  'active-months': ActiveMonthsCard,
  'median-engagement': MedianEngagementCard,
  'p90-engagement': P90EngagementCard,
  'avg-posts-per-month': AvgPostsPerMonthCard,
  'longest-gap': LongestGapCard,
  'avg-posting-gap': AvgPostingGapCard,
  'peak-month': PeakMonthCard,
  
  // Analytics Cards
  'linkedin-analytics': LinkedInAnalyticsCardWrapper,
  'post-type-mosaic': PostTypeDistributionCard,
  
  // Chart Cards
  'engagement-trend-chart': EngagementTrendChart,
  'posts-per-month-chart': PostsPerMonthChart,
  'format-mix-chart': FormatMixChart,
  'top-topics-chart': TopTopicsChart,
  
  // Engagement Cards
  'engagement-by-format': EngagementByFormatCard,
  
  // AI Analysis Cards
  'ai-insights-summary': NarrativeInsightsCard,
  'ai-recommendations': PositioningAnalysisCard,
  'ai-content-analysis': PostQualityEvaluation,
  'ai-topic-analysis': TopicAnalysisCard,
  
  // Pattern Cards
  'timing-insights': TimingInsightsCard,
  'day-wise-distribution': DayWiseDistributionCardWrapper,
  'monthly-distribution': MonthlyDistributionCardWrapper,
  
  // Content Analysis Cards
  'top-posts': TopPostsCard,
  'peer-comparison': PeerComparisonCard,
  'value-proposition': ValuePropositionCard,
  
  // Unstoppable Section Cards
  'why-us': WhyUsCard,
  'how-we-work': HowWeWorkCard,
  'what-you-get': WhatYouGetCard,
  'investment-terms': InvestmentTermsCard,
  'next-steps': NextStepsCard
}

/**
 * Get all visible card IDs based on current visibility settings
 */
export function getVisibleCardIds(cardVisibility) {
  return Object.keys(cardVisibility).filter(cardId => cardVisibility[cardId])
}

/**
 * Get all visible card components with their props
 */
export function getVisibleCardComponents(cardVisibility, data) {
  const visibleCardIds = getVisibleCardIds(cardVisibility)
  
  return visibleCardIds.map(cardId => {
    const Component = CARD_COMPONENT_REGISTRY[cardId]
    
    if (!Component) {
      console.warn(`No component found for card ID: ${cardId}`)
      return null
    }
    
    // Determine props based on card type
    let props = { data }
    
    // Special handling for specific cards
    if (cardId === 'ai-content-analysis') {
      props = { postsData: data?.posts || [], llmInsights: data?.llmInsights }
    }
    
    return {
      cardId,
      Component,
      props
    }
  }).filter(Boolean)
}

/**
 * Get card order for consistent layout
 */
export function getCardOrder(cardVisibility) {
  const visibleCardIds = getVisibleCardIds(cardVisibility)
  
  // Define preferred order for different categories
  const categoryOrder = {
    'Key Metrics': [
      'posts-count',
      'active-months',
      'median-engagement',
      'p90-engagement',
      'avg-posts-per-month',
      'longest-gap',
      'avg-posting-gap',
      'peak-month'
    ],
    'Analytics': [
      'linkedin-analytics',
      'post-type-mosaic'
    ],
    'Charts': [
      'engagement-trend-chart',
      'posts-per-month-chart',
      'format-mix-chart',
      'top-topics-chart'
    ],
    'Engagement': [
      'engagement-by-format'
    ],
    'AI Analysis': [
      'ai-insights-summary',
      'ai-recommendations',
      'ai-content-analysis',
      'ai-topic-analysis'
    ],
    'Patterns': [
      'timing-insights',
      'day-wise-distribution',
      'monthly-distribution'
    ],
    'Content': [
      'top-posts'
    ],
    'Comparison': [
      'peer-comparison',
      'value-proposition'
    ],
    'Unstoppable': [
      'why-us',
      'how-we-work',
      'what-you-get',
      'investment-terms',
      'next-steps'
    ]
  }
  
  // Flatten the ordered categories and filter by visible cards
  const orderedCardIds = Object.values(categoryOrder).flat()
  return orderedCardIds.filter(cardId => visibleCardIds.includes(cardId))
}

/**
 * Get all available card IDs (for future extensibility)
 */
export function getAllCardIds() {
  return Object.keys(CARD_COMPONENT_REGISTRY)
}
