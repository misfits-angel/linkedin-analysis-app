'use client'

import { useState } from 'react'
import { useCardVisibilityCheck } from './useCardVisibilityCheck'

export function useLLMInsights(cardId = null) {
  const [error, setError] = useState(null)
  const isCardVisible = useCardVisibilityCheck(cardId)

  const callLLMAPI = async (endpoint, data) => {
    // Check if card is visible before making LLM call
    if (cardId && !isCardVisible) {
      console.log(`🚫 Skipping LLM call for ${endpoint} - card ${cardId} is not visible`)
      throw new Error(`Card ${cardId} is not visible, skipping LLM call`)
    }

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

  const generateNarrativeInsights = async (posts) => {
    return callLLMAPI('generate-insights', { posts })
  }

  const analyzeTopics = async (posts) => {
    return callLLMAPI('analyze-topics', { posts })
  }

  const evaluatePosts = async (posts) => {
    return callLLMAPI('evaluate-posts', { posts })
  }

  const analyzePositioning = async (posts) => {
    return callLLMAPI('analyze-positioning', { posts })
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
    isCardVisible,
  }
}
