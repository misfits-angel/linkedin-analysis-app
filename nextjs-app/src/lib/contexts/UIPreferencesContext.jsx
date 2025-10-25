'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

// Card definitions (moved from CardVisibilityContext)
export const CARD_DEFINITIONS = {
  'posts-count': { name: 'Posts Count', category: 'Key Metrics', defaultVisible: false },
  'active-months': { name: 'Active Months', category: 'Key Metrics', defaultVisible: false },
  'median-engagement': { name: 'Median Engagement', category: 'Key Metrics', defaultVisible: false },
  'p90-engagement': { name: 'P90 Engagement', category: 'Key Metrics', defaultVisible: false },
  'avg-posts-per-month': { name: 'Avg Posts Per Month', category: 'Key Metrics', defaultVisible: false },
  'longest-gap': { name: 'Longest Gap', category: 'Key Metrics', defaultVisible: false },
  'avg-posting-gap': { name: 'Avg Posting Gap', category: 'Key Metrics', defaultVisible: false },
  'peak-month': { name: 'Peak Month', category: 'Key Metrics', defaultVisible: false },
  'linkedin-analytics': { name: 'LinkedIn Analytics', category: 'Analytics', defaultVisible: true },
  'post-type-mosaic': { name: 'Post Type Distribution', category: 'Analytics', defaultVisible: true },
  'engagement-trend-chart': { name: 'Engagement Over Time', category: 'Charts', defaultVisible: true },
  'posts-per-month-chart': { name: 'Posting Cadence', category: 'Charts', defaultVisible: true },
  'format-mix-chart': { name: 'Format Mix', category: 'Charts', defaultVisible: false },
  'top-topics-chart': { name: 'Post vs Reshare', category: 'Charts', defaultVisible: true },
  'engagement-by-format': { name: 'Engagement by Post Type', category: 'Engagement', defaultVisible: false },
  'ai-insights-summary': { name: 'Narrative Insights', category: 'AI Analysis', defaultVisible: false },
  'ai-content-analysis': { name: 'Post Quality Evaluation', category: 'AI Analysis', defaultVisible: true },
  'ai-topic-analysis': { name: 'Topic Analysis', category: 'AI Analysis', defaultVisible: true },
  'ai-recommendations': { name: 'Positioning Analysis', category: 'AI Analysis', defaultVisible: true },
  'timing-insights': { name: 'Timing Insights', category: 'Patterns', defaultVisible: false },
  'day-wise-distribution': { name: 'Day-wise Distribution', category: 'Patterns', defaultVisible: false },
  'monthly-distribution': { name: 'Monthly Distribution', category: 'Patterns', defaultVisible: false },
  'top-posts': { name: 'Top Posts', category: 'Content', defaultVisible: true },
  'peer-comparison': { name: 'Peer Comparison', category: 'Comparison', defaultVisible: false },
  'value-proposition': { name: 'Value Proposition', category: 'Comparison', defaultVisible: false },
  'why-us': { name: 'Why Us?', category: 'Unstoppable', defaultVisible: true },
  'how-we-work': { name: 'How We Work', category: 'Unstoppable', defaultVisible: true },
  'what-you-get': { name: 'What Will You Get?', category: 'Unstoppable', defaultVisible: true },
  'investment-terms': { name: 'Investment Terms', category: 'Unstoppable', defaultVisible: true },
  'next-steps': { name: 'Next Steps', category: 'Unstoppable', defaultVisible: true }
}

const UIPreferencesContext = createContext()

export function UIPreferencesProvider({ children }) {
  // Card Name State
  const [showCardNames, setShowCardNames] = useState(false)
  
  // Card Visibility State
  const [cardVisibility, setCardVisibility] = useState({})
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize preferences from localStorage
  useEffect(() => {
    const initializePreferences = () => {
      // Initialize card visibility
      const defaultVisibility = {}
      Object.keys(CARD_DEFINITIONS).forEach(cardId => {
        defaultVisibility[cardId] = CARD_DEFINITIONS[cardId].defaultVisible
      })
      
      const savedVisibility = localStorage.getItem('cardVisibility')
      if (savedVisibility) {
        try {
          const parsed = JSON.parse(savedVisibility)
          const merged = { ...defaultVisibility, ...parsed }
          setCardVisibility(merged)
        } catch (error) {
          console.error('Failed to parse saved card visibility:', error)
          setCardVisibility(defaultVisibility)
        }
      } else {
        setCardVisibility(defaultVisibility)
      }

      // Initialize card names
      const savedShowCardNames = localStorage.getItem('showCardNames')
      if (savedShowCardNames !== null) {
        setShowCardNames(savedShowCardNames === 'true')
      }
      
      setIsInitialized(true)
    }

    initializePreferences()
  }, [])

  // Persist card visibility to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cardVisibility', JSON.stringify(cardVisibility))
    }
  }, [cardVisibility, isInitialized])

  // Persist card names preference to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('showCardNames', String(showCardNames))
    }
  }, [showCardNames, isInitialized])

  // Card Name Actions (memoized)
  const toggleCardNames = useCallback(() => {
    setShowCardNames(prev => !prev)
  }, [])

  // Card Visibility Actions (memoized)
  const toggleCard = useCallback((cardId) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }, [])

  const setCardVisibilityState = useCallback((cardId, visible) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: visible
    }))
  }, [])

  const toggleCategory = useCallback((category) => {
    const categoryCards = Object.keys(CARD_DEFINITIONS).filter(
      cardId => CARD_DEFINITIONS[cardId].category === category
    )
    
    setCardVisibility(prev => {
      const allVisible = categoryCards.every(cardId => prev[cardId])
      const newVisibility = { ...prev }
      categoryCards.forEach(cardId => {
        newVisibility[cardId] = !allVisible
      })
      return newVisibility
    })
  }, [])

  const toggleAllCards = useCallback((visible) => {
    setCardVisibility(prev => {
      const newVisibility = {}
      Object.keys(CARD_DEFINITIONS).forEach(cardId => {
        newVisibility[cardId] = visible
      })
      return newVisibility
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    const defaultVisibility = {}
    Object.keys(CARD_DEFINITIONS).forEach(cardId => {
      defaultVisibility[cardId] = CARD_DEFINITIONS[cardId].defaultVisible
    })
    setCardVisibility(defaultVisibility)
  }, [])

  const getVisibleCards = useCallback(() => {
    return Object.keys(cardVisibility).filter(cardId => cardVisibility[cardId])
  }, [cardVisibility])

  const getCardsByCategory = useCallback(() => {
    const categories = {}
    Object.keys(CARD_DEFINITIONS).forEach(cardId => {
      const category = CARD_DEFINITIONS[cardId].category
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push({
        id: cardId,
        name: CARD_DEFINITIONS[cardId].name,
        visible: cardVisibility[cardId] || false
      })
    })
    return categories
  }, [cardVisibility])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Card Names
    showCardNames,
    toggleCardNames,
    
    // Card Visibility
    cardVisibility,
    isInitialized,
    toggleCard,
    setCardVisibility: setCardVisibilityState,
    toggleCategory,
    toggleAllCards,
    resetToDefaults,
    getVisibleCards,
    getCardsByCategory,
    CARD_DEFINITIONS // Constant, doesn't need to be in deps
  }), [
    showCardNames,
    toggleCardNames,
    cardVisibility,
    isInitialized,
    toggleCard,
    setCardVisibilityState,
    toggleCategory,
    toggleAllCards,
    resetToDefaults,
    getVisibleCards,
    getCardsByCategory
    // Note: CARD_DEFINITIONS is a constant and excluded from dependencies
  ])

  return (
    <UIPreferencesContext.Provider value={value}>
      {children}
    </UIPreferencesContext.Provider>
  )
}

// Custom hooks for specific slices (prevents unnecessary re-renders)
export function useCardNames() {
  const context = useContext(UIPreferencesContext)
  if (context === undefined) {
    throw new Error('useCardNames must be used within UIPreferencesProvider')
  }
  return {
    showCardNames: context.showCardNames,
    toggleCardNames: context.toggleCardNames
  }
}

export function useCardVisibility() {
  const context = useContext(UIPreferencesContext)
  if (context === undefined) {
    throw new Error('useCardVisibility must be used within UIPreferencesProvider')
  }
  return {
    cardVisibility: context.cardVisibility,
    isInitialized: context.isInitialized,
    toggleCard: context.toggleCard,
    setCardVisibility: context.setCardVisibility,
    toggleCategory: context.toggleCategory,
    toggleAllCards: context.toggleAllCards,
    resetToDefaults: context.resetToDefaults,
    getVisibleCards: context.getVisibleCards,
    getCardsByCategory: context.getCardsByCategory,
    CARD_DEFINITIONS: context.CARD_DEFINITIONS
  }
}

// Full context access (use sparingly)
export function useUIPreferences() {
  const context = useContext(UIPreferencesContext)
  if (context === undefined) {
    throw new Error('useUIPreferences must be used within UIPreferencesProvider')
  }
  return context
}

