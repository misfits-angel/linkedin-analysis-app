'use client'

import { useState } from 'react'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import LLMButton from './LLMButton'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'

export default function TopicAnalysis({ postsData, llmInsights }) {
  const [topicAnalysis, setTopicAnalysis] = useState(llmInsights?.topicAnalysis || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { analyzeTopics } = useLLMInsights()

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
      <div className="space-y-3">
        {/* Summary */}
        {summary && (
          <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded-lg">
            <div className="text-xs font-semibold text-purple-900 mb-1">🤖 AI Analysis</div>
            <div className="text-xs text-purple-800">{summary}</div>
          </div>
        )}
        
        {/* Topic breakdown with bars */}
        {Object.keys(topicStats).length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 mb-2">📊 Topic Breakdown</div>
            {Object.entries(topicStats)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 10)
              .map(([topic, stats]) => {
                const maxCount = Object.values(topicStats).reduce((max, stat) => Math.max(max, stat.count), 0) || 1
                const percentage = Math.round((stats.count / maxCount) * 100)
                const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1)
                
                return (
                  <div key={topic} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-medium text-gray-700">{topicLabel}</span>
                      <span className="text-gray-500">{stats.count} posts • avg: {Math.round(stats.avg_engagement)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
        
        {!summary && Object.keys(topicStats).length === 0 && (
          <div className="text-xs text-gray-500 italic">
            No topic analysis available. Check console for debugging info.
          </div>
        )}
      </div>
    )
  }

  return (
    <Card cardName="Topic Analysis Card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            🔍 Topic insights
          </CardTitle>
        <LLMButton
          onClick={handleAnalyzeTopics}
          isLoading={isLoading}
          icon="🎯"
          text="Analyze"
          loadingText="Analyzing..."
          variant="secondary"
          size="sm"
        />
        </div>
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
      
        {!topicAnalysis && !isLoading && !error && (
          <div className="text-sm text-muted-foreground italic">
            Click "Analyze with AI" to discover key topics in your content.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
