'use client'

import { useState } from 'react'
import { useLLMInsights } from '@/lib/hooks/useLLMInsights'
import LLMButton from './LLMButton'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'

export default function PostQualityEvaluation({ postsData, llmInsights }) {
  const [evaluation, setEvaluation] = useState(llmInsights?.postEvaluation || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { evaluatePosts } = useLLMInsights()

  const handleEvaluatePosts = async () => {
    if (!postsData || postsData.length === 0) {
      setError('Please upload your LinkedIn data first.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await evaluatePosts(postsData)
      setEvaluation(result)
    } catch (err) {
      console.error('Error evaluating posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to evaluate posts')
    } finally {
      setIsLoading(false)
    }
  }

  const renderEvaluation = () => {
    if (!evaluation) return null

    const { score_100, one_line_summary, overall_analysis, rubric_breakdown, strengths, improvements } = evaluation
    
    const rubricLabels = {
      depth_originality: 'Depth & Originality',
      hook_effectiveness: 'Hook Effectiveness',
      evidence_examples: 'Evidence & Examples',
      actionability: 'Actionability',
      conclusion_strength: 'Conclusion Strength',
      personal_story: 'Personal Story',
      emotional_resonance: 'Emotional Resonance'
    }
    
    const parameterDescriptions = {
      depth_originality: 'Non-obvious, earned thinking that explains mechanisms, tradeoffs, and edge cases rather than slogans',
      hook_effectiveness: 'Relevant, specific, and scroll-stopping content without clickbait',
      evidence_examples: 'Specific metrics, cases, or artifacts with uncertainty labeled and concrete examples',
      actionability: 'Concrete takeaways, patterns, checklists, or numeric guardrails readers can try soon',
      conclusion_strength: 'Crisp takeaway and/or question that invites discussion',
      personal_story: 'First-person or founder-level anecdote with concrete details tied back to the claim',
      emotional_resonance: 'Content that evokes appropriate emotion through stakes, specificity, tension, or vulnerability'
    }
    
    const maxScores = {
      depth_originality: 25,
      hook_effectiveness: 10,
      evidence_examples: 20,
      actionability: 15,
      conclusion_strength: 10,
      personal_story: 10,
      emotional_resonance: 10
    }

    return (
      <div className="space-y-4">
        {/* Summary Header */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
          <div className="text-sm text-green-700">{one_line_summary}</div>
        </div>
        
        {/* Rubric Breakdown with horizontal fill bars */}
        {Object.keys(rubric_breakdown).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">📋 Evaluation Rubric</div>
            
            {/* Scoring Scale Note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-800">
                <strong>Note:</strong> Different parameters have different weightage and are scored on different scales. 
                Some parameters are scored on 10-point scales, others on 15, 20, or 25-point scales based on their importance in the evaluation rubric.
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(rubric_breakdown).map(([key, score]) => {
                const maxScore = maxScores[key] || 10
                const percentage = (score / maxScore) * 100
                const label = rubricLabels[key] || key.replace('_', ' ')
                const description = parameterDescriptions[key] || ''
                
                let colorClass = 'bg-teal-200'
                if (percentage >= 80) colorClass = 'bg-gradient-to-r from-emerald-400 to-teal-500'
                else if (percentage >= 60) colorClass = 'bg-gradient-to-r from-blue-400 to-teal-400'
                else if (percentage >= 40) colorClass = 'bg-gradient-to-r from-cyan-400 to-blue-400'
                else colorClass = 'bg-gradient-to-r from-teal-400 to-cyan-400'
                
                return (
                  <div key={key} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">{label}</span>
                      <span className="text-xs font-semibold text-gray-600">{score}/{maxScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">{description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Overall Analysis */}
        {overall_analysis && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-xl">📊</div>
              <div className="flex-1">
                <div className="font-semibold text-blue-800 mb-1">Overall Analysis</div>
                <div className="text-sm text-blue-700">{overall_analysis}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">✅ Strengths</div>
            <div className="space-y-2">
              {strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2">
                  <div className="text-green-600 text-sm">✓</div>
                  <div className="text-sm text-gray-700">{strength}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Areas for Improvement */}
        {improvements.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">🔧 Areas for Improvement</div>
            <div className="space-y-2">
              {improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2">
                  <div className="text-blue-600 text-sm">→</div>
                  <div className="text-sm text-gray-700">{improvement}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card cardName="Post Quality Evaluation Card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
          Post Quality Evaluation
            {evaluation && ` • ${evaluation.score_100}/100`}
          </CardTitle>
          <LLMButton
          onClick={handleEvaluatePosts}
          isLoading={isLoading}
          icon="🎯"
          text="Evaluate"
          loadingText="Evaluating..."
          variant="primary"
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
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
          <div className="text-xs text-green-800">
            Evaluating {postsData.length} posts with AI... This may take 10-15 seconds.
          </div>
        </div>
      )}
      
      {evaluation && !isLoading && renderEvaluation()}
      
        {!evaluation && !isLoading && !error && (
          <div className="text-sm text-muted-foreground italic">
            Click "Evaluate" to get AI-powered quality assessment of your content.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
