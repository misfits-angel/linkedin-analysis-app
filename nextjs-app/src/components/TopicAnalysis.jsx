'use client'

import { useState } from 'react'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import LLMButton from './LLMButton'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { usePathname } from 'next/navigation'

export default function TopicAnalysis({ postsData, llmInsights }) {
  const [topicAnalysis, setTopicAnalysis] = useState(llmInsights?.topicAnalysis || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const pathname = usePathname()
  
  const { analyzeTopics } = useLLMInsights('ai-topic-analysis')
  
  // Check if we're in report mode (not dashboard)
  // Check if we're in report mode (not dashboard) - reports are at /{uuid}
  const isReportMode = pathname && pathname !== '/' && !pathname.startsWith('/api') && !pathname.startsWith('/auth')

  const handleAnalyzeTopics = async () => {
    if (!postsData || postsData.length === 0) {
      setError('Please upload your LinkedIn data first.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await analyzeTopics(postsData)
      
      // Transform the result to match legacy format
      const legacyFormat = {
        summary: result.summary || '',
        topic_stats: {}
      }
      
      // Handle both new format (topic_stats) and old format (topics array)
      if (result.topic_stats && typeof result.topic_stats === 'object') {
        // New format: topic_stats object
        legacyFormat.topic_stats = result.topic_stats
      } else if (result.topics && Array.isArray(result.topics)) {
        // Old format: topics array
        result.topics.forEach((topic) => {
          legacyFormat.topic_stats[topic.topic] = {
            count: topic.frequency || 0,
            avg_engagement: Math.round(topic.avg_engagement || 0),
            median_engagement: Math.round(topic.avg_engagement || 0) // Using avg as fallback
          }
        })
      }
      
      console.log('🔍 Transformed topic analysis:', legacyFormat)
      setTopicAnalysis(legacyFormat)
    } catch (err) {
      console.error('Error analyzing topics:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze topics')
    } finally {
      setIsLoading(false)
    }
  }

  const renderTopicAnalysis = () => {
    if (!topicAnalysis) return null

    const summary = topicAnalysis.summary || ''
    const topicStats = topicAnalysis.topic_stats || {}
    
    console.log('🎨 Rendering topic analysis:', { summary, topicStats, keysCount: Object.keys(topicStats).length })
    
    return (
      <div className="space-y-4">
        {/* Summary Header */}
        {summary && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded-lg">
            <div className="text-sm text-purple-700">{summary}</div>
          </div>
        )}
        
        {/* Topic breakdown with horizontal fill bars */}
        {Object.keys(topicStats).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">📊 Topic Breakdown</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(topicStats)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 8)
                .map(([topic, stats]) => {
                  const maxCount = Object.values(topicStats).reduce((max, stat) => Math.max(max, stat.count), 0) || 1
                  const percentage = Math.round((stats.count / maxCount) * 100)
                  const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1)
                  
                  let colorClass = 'bg-purple-200'
                  if (percentage >= 80) colorClass = 'bg-gradient-to-r from-purple-500 to-indigo-600'
                  else if (percentage >= 60) colorClass = 'bg-gradient-to-r from-purple-400 to-indigo-500'
                  else if (percentage >= 40) colorClass = 'bg-gradient-to-r from-purple-300 to-indigo-400'
                  else colorClass = 'bg-gradient-to-r from-purple-200 to-indigo-300'
                  
                  return (
                    <div key={topic} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">{topicLabel}</span>
                        <span className="text-xs font-semibold text-gray-600">{stats.count} posts</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        Avg engagement: {Math.round(stats.avg_engagement)}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
        
        {!summary && Object.keys(topicStats).length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No topic analysis available. Check console for debugging info.
          </div>
        )}
      </div>
    )
  }

  return (
    <Card cardName="Topic Analysis Card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Topic insights
        </CardTitle>
      </CardHeader>
      <CardContent>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
          <div className="text-xs font-medium text-red-800">❌ {error}</div>
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          <div className="text-xs text-purple-800">
            Analyzing topics in {postsData.length} posts... This may take 10-15 seconds.
          </div>
        </div>
      )}
      
      {topicAnalysis && !isLoading && renderTopicAnalysis()}
      
      {/* Show button only in dashboard mode, not in report mode */}
      {!isReportMode && !topicAnalysis && !isLoading && !error && (
        <div className="flex justify-center mb-4">
          <LLMButton
            onClick={handleAnalyzeTopics}
            isLoading={isLoading}
            text="Analyze with AI"
            loadingText="Analyzing topics..."
            icon="🤖"
            variant="primary"
            size="sm"
          />
        </div>
      )}
      
      {!topicAnalysis && !isLoading && !error && (
        <div className="text-sm text-muted-foreground italic">
          {isReportMode 
            ? "Topic analysis will be available when this report is generated."
            : "Click 'Analyze with AI' to discover key topics in your content."
          }
        </div>
      )}
      </CardContent>
    </Card>
  )
}
