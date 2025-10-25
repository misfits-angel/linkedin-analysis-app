'use client'

import { useState } from 'react'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import LLMButton from './LLMButton'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { Badge } from '@/components/ui/badge'
import ConditionalCard from './ConditionalCard'
import { usePathname } from 'next/navigation'

export default function PositioningAnalysisCard({ data }) {
  const [positioningAnalysis, setPositioningAnalysis] = useState(data?.llmInsights?.positioningAnalysis || null)
  
  // Individual loading states for each button
  const [isLoadingPositioning, setIsLoadingPositioning] = useState(false)
  const pathname = usePathname()
  
  const { 
    error, 
    analyzePositioning 
  } = useLLMInsights('ai-recommendations')
  
  // Check if we're in report mode (not dashboard)
  const isReportMode = pathname?.startsWith('/report/')

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
    <ConditionalCard cardId="ai-recommendations">
      <Card cardName="Positioning Analysis Card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Positioning Analysis
          </CardTitle>
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
            <div className="space-y-3">
              {!isReportMode && (
                <div className="flex justify-center">
                  <LLMButton
                    onClick={handleAnalyzePositioning}
                    isLoading={isLoadingPositioning}
                    text="Analyze Positioning"
                    loadingText="Analyzing positioning..."
                    icon="🎯"
                    variant="primary"
                    size="sm"
                  />
                </div>
              )}
              <div className="text-sm text-muted-foreground italic">
                {isReportMode 
                  ? "Positioning analysis will be available when this report is generated."
                  : "Get AI-powered analysis of your current personal branding and positioning based on your LinkedIn content."
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
