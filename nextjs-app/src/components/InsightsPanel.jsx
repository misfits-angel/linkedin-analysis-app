'use client'

import { useState } from 'react'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import InsightChart from './InsightChart'
import PostQualityEvaluation from './PostQualityEvaluation'
import LLMButton from './LLMButton'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { Badge } from '@/components/ui/badge'

export default function InsightsPanel({ data }) {
  const [narrativeInsights, setNarrativeInsights] = useState(null)
  const [positioningAnalysis, setPositioningAnalysis] = useState(null)
  
  // Individual loading states for each button
  const [isLoadingNarrative, setIsLoadingNarrative] = useState(false)
  const [isLoadingPositioning, setIsLoadingPositioning] = useState(false)
  
  const { 
    error, 
    generateNarrativeInsights, 
    analyzePositioning 
  } = useLLMInsights()

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

  const handleAnalyzePositioning = async () => {
    setIsLoadingPositioning(true)
    try {
      if (!data?.posts) {
        throw new Error('No posts data available to analyze positioning.')
      }
      const result = await analyzePositioning(data.posts)
      setPositioningAnalysis(result)
    } catch (error) {
      console.error('Error analyzing positioning:', error)
    } finally {
      setIsLoadingPositioning(false)
    }
  }

  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Narrative Insights Section */}
      <Card cardName="Narrative Insights Card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              💬 Narrative Insights
            </CardTitle>
            <LLMButton
              onClick={handleGenerateInsights}
              isLoading={isLoadingNarrative}
              icon="✨"
              text="Generate"
              loadingText="Generating..."
              variant="primary"
              size="sm"
              disabled={!data?.posts}
            />
          </div>
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
            <div className="text-sm text-muted-foreground italic">
              Click "Generate Insights" to get AI-powered observations about your posting patterns and engagement triggers.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Quality Evaluation Section */}
      <PostQualityEvaluation postsData={data?.posts || []} />

      {/* Positioning Analysis Section */}
      <Card cardName="Positioning Analysis Card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              🎯 Positioning Analysis
            </CardTitle>
            <LLMButton
              onClick={handleAnalyzePositioning}
              isLoading={isLoadingPositioning}
              icon="🚀"
              text="Analyze"
              loadingText="Analyzing..."
              variant="primary"
              size="sm"
              disabled={!data?.posts}
            />
          </div>
        </CardHeader>
        <CardContent>
          {positioningAnalysis ? (
            <div className="space-y-4">
              {/* Current Branding Section - Following legacy approach */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <div className="text-lg font-semibold">Current Branding</div>
                </div>
                <div className="border border-border rounded-lg p-4 bg-muted/50">
                  {positioningAnalysis.current_branding?.positioning_summary && (
                    <div className="mb-3">
                      <div className="text-sm">{positioningAnalysis.current_branding.positioning_summary}</div>
                    </div>
                  )}

                  {/* Key Themes */}
                  {positioningAnalysis.current_branding?.key_themes && positioningAnalysis.current_branding.key_themes.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-semibold mb-1">Key Themes</div>
                      <div className="flex flex-wrap gap-1">
                        {positioningAnalysis.current_branding.key_themes.slice(0, 5).map((theme, index) => (
                          <Badge key={index} variant="secondary">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expertise Areas */}
                  {positioningAnalysis.current_branding?.expertise_areas && positioningAnalysis.current_branding.expertise_areas.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-semibold mb-1">Expertise</div>
                      <div className="flex flex-wrap gap-1">
                        {positioningAnalysis.current_branding.expertise_areas.slice(0, 4).map((area, index) => (
                          <Badge key={index} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              Get AI-powered analysis of your current personal branding and positioning based on your LinkedIn content.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
