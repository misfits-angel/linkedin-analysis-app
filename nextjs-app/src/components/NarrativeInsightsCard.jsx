'use client'

import { useState } from 'react'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import LLMButton from './LLMButton'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import { usePathname } from 'next/navigation'

export default function NarrativeInsightsCard({ data }) {
  // Initialize with pre-generated LLM insights if available
  const [narrativeInsights, setNarrativeInsights] = useState(data?.llmInsights?.narrativeInsights || null)
  
  // Individual loading states for each button
  const [isLoadingNarrative, setIsLoadingNarrative] = useState(false)
  const pathname = usePathname()
  
  const { 
    error, 
    generateNarrativeInsights
  } = useLLMInsights('ai-insights-summary')
  
  // Check if we're in report mode (not dashboard) - reports are at /{uuid}
  const isReportMode = pathname && pathname !== '/' && !pathname.startsWith('/api') && !pathname.startsWith('/auth')

  const handleGenerateInsights = async () => {
    setIsLoadingNarrative(true)
    try {
      if (!data?.posts) {
        throw new Error('No posts data available to generate insights.')
      }
      const result = await generateNarrativeInsights(data.posts)
      setNarrativeInsights(result)
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsLoadingNarrative(false)
    }
  }

  return (
    <ConditionalCard cardId="ai-insights-summary">
      <Card cardName="Narrative Insights Card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Narrative Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {narrativeInsights ? (
            <div className="space-y-4">
              {narrativeInsights.insights && (
                <div>
                  <div className="text-sm font-medium mb-2">Key Insights:</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {narrativeInsights.insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {!isReportMode && (
                <div className="flex justify-center">
                  <LLMButton
                    onClick={handleGenerateInsights}
                    isLoading={isLoadingNarrative}
                    text="Generate Insights"
                    loadingText="Generating insights..."
                    icon="💬"
                    variant="primary"
                    size="sm"
                  />
                </div>
              )}
              <div className="text-sm text-muted-foreground italic">
                {isReportMode 
                  ? "Narrative insights will be available when this report is generated."
                  : "Click 'Generate Insights' to get AI-powered observations about your posting patterns and engagement triggers."
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
