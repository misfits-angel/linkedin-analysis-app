'use client'

import { useState } from 'react'

export interface NarrativeInsights {
  insights: string[]
  patterns: {
    best_posting_day: string
    optimal_content_length: string
    top_performing_format: string
  }
  recommendations: string[]
}

export interface TopicAnalysis {
  posts?: Array<{
    id: number
    topics: string[]
  }>
  summary: string
  topic_stats: {
    [topic: string]: {
      count: number
      avg_engagement: number
      median_engagement: number
    }
  }
  // Legacy format support
  topics?: Array<{
    topic: string
    frequency: number
    avg_engagement: number
    posts: string[]
  }>
  insights?: string[]
}

export interface PostEvaluation {
  score_100: number
  rubric_breakdown: {
    depth_originality: number
    hook_effectiveness: number
    evidence_examples: number
    actionability: number
    conclusion_strength: number
    personal_story: number
    emotional_resonance: number
  }
  story: {
    present: boolean
    quotes: string[]
    lesson: string
  }
  strengths: string[]
  improvements: string[]
  suggested_edits: string[]
  one_line_summary: string
  overall_analysis: string
}

export interface PositioningAnalysis {
  current_branding: {
    positioning_summary: string
    key_themes: string[]
    expertise_areas: string[]
    communication_style: string
    target_audience: string
    strengths: string[]
    weaknesses: string[]
  }
  future_branding: {
    recommended_positioning: string
    strategic_themes: string[]
    target_expertise: string[]
    ideal_communication_style: string
    target_audience: string
    differentiation_strategy: string
    content_recommendations: string[]
    positioning_gaps: string[]
  }
  action_plan: {
    immediate_actions: string[]
    content_strategy: string
    timeline: string
  }
}

export function useLLMInsights() {
  const [error, setError] = useState<string | null>(null)

  const callLLMAPI = async <T>(endpoint: string, data: any): Promise<T> => {
    setError(null)

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`LLM API error (${endpoint}):`, err)
      throw err
    }
  }

  const generateNarrativeInsights = async (posts: any[]): Promise<NarrativeInsights> => {
    return callLLMAPI<NarrativeInsights>('generate-insights', { posts })
  }

  const analyzeTopics = async (posts: any[]): Promise<TopicAnalysis> => {
    return callLLMAPI<TopicAnalysis>('analyze-topics', { posts })
  }

  const evaluatePosts = async (posts: any[]): Promise<PostEvaluation> => {
    return callLLMAPI<PostEvaluation>('evaluate-posts', { posts })
  }

  const analyzePositioning = async (posts: any[]): Promise<PositioningAnalysis> => {
    return callLLMAPI<PositioningAnalysis>('analyze-positioning', { posts })
  }

  const clearError = () => {
    setError(null)
  }

  return {
    error,
    generateNarrativeInsights,
    analyzeTopics,
    evaluatePosts,
    analyzePositioning,
    clearError,
  }
}
