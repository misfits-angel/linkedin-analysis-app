'use client'

import { useState } from 'react'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import InsightChart from './InsightChart'
import PostQualityEvaluation from './PostQualityEvaluation'
import LLMButton from './LLMButton'

interface InsightsPanelProps {
  data: any
}

export default function InsightsPanel({ data }: InsightsPanelProps) {
  const [narrativeInsights, setNarrativeInsights] = useState<any>(null)
  const [positioningAnalysis, setPositioningAnalysis] = useState<any>(null)
  
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
      <section className="card p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="section-title-spaced">💬 Narrative Insights</div>
          <LLMButton
            onClick={handleGenerateInsights}
            isLoading={isLoadingNarrative}
            icon="✨"
            text="Generate"
            loadingText="Generating..."
            variant="primary"
            size="sm"
          />
        </div>
        
        {narrativeInsights ? (
          <div className="space-y-4">
            {narrativeInsights.insights && (
              <div>
                <div className="text-sm font-medium mb-2">Key Insights:</div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {narrativeInsights.insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Click "Generate Insights" to get AI-powered observations about your posting patterns and engagement triggers.
          </div>
        )}
      </section>

      {/* Post Quality Evaluation Section */}
      <PostQualityEvaluation postsData={data?.posts || []} />

      {/* Positioning Analysis Section */}
      <section className="card p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="section-title-spaced">🎯 Positioning Analysis</div>
          <LLMButton
            onClick={handleAnalyzePositioning}
            isLoading={isLoadingPositioning}
            icon="🚀"
            text="Analyze"
            loadingText="Analyzing..."
            variant="primary"
            size="sm"
          />
        </div>
        
        {positioningAnalysis ? (
          <div className="space-y-4">
            {/* Current Branding Section - Following legacy approach */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <div className="text-lg font-semibold text-gray-800">Current Branding</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                {positioningAnalysis.current_branding?.positioning_summary && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-700">{positioningAnalysis.current_branding.positioning_summary}</div>
                  </div>
                )}
                
                {/* Key Themes */}
                {positioningAnalysis.current_branding?.key_themes && positioningAnalysis.current_branding.key_themes.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-600 mb-1">Key Themes</div>
                    <div className="flex flex-wrap gap-1">
                      {positioningAnalysis.current_branding.key_themes.slice(0, 5).map((theme: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Expertise Areas */}
                {positioningAnalysis.current_branding?.expertise_areas && positioningAnalysis.current_branding.expertise_areas.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-600 mb-1">Expertise</div>
                    <div className="flex flex-wrap gap-1">
                      {positioningAnalysis.current_branding.expertise_areas.slice(0, 4).map((area: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Get AI-powered analysis of your current personal branding and positioning based on your LinkedIn content.
          </div>
        )}
      </section>
    </>
  )
}
