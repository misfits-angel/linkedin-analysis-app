'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CARD_DEFINITIONS } from './UIPreferencesContext'

const ShareableReportUIPreferencesContext = createContext()

export function ShareableReportUIPreferencesProvider({ children, initialCardVisibility = {} }) {
  const [cardVisibility, setCardVisibility] = useState(initialCardVisibility)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize with the card visibility settings passed from the dataset
    setCardVisibility(initialCardVisibility)
    setIsInitialized(true)
  }, [initialCardVisibility])

  const toggleCard = (cardId) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const toggleCategory = (category) => {
    // This is not needed for shareable reports, but kept for compatibility
    console.log('Category toggle not available in shareable reports')
  }

  const toggleAllCards = (visible) => {
    // This is not needed for shareable reports, but kept for compatibility
    console.log('Toggle all cards not available in shareable reports')
  }

  const resetToDefaults = () => {
    // This is not needed for shareable reports, but kept for compatibility
    console.log('Reset to defaults not available in shareable reports')
  }

  const getCardsByCategory = () => {
    // Return empty object for shareable reports
    return {}
  }

  // Use the same card definitions as the main context

  const value = {
    cardVisibility,
    isInitialized,
    toggleCard,
    toggleCategory,
    toggleAllCards,
    resetToDefaults,
    getCardsByCategory,
    CARD_DEFINITIONS
  }

  return (
    <ShareableReportUIPreferencesContext.Provider value={value}>
      {children}
    </ShareableReportUIPreferencesContext.Provider>
  )
}

export function useCardVisibility() {
  const context = useContext(ShareableReportUIPreferencesContext)
  if (context === undefined) {
    throw new Error('useCardVisibility must be used within a ShareableReportUIPreferencesProvider')
  }
  return context
}

export function useCardNames() {
  // For shareable reports, we don't show card names
  return {
    showCardNames: false,
    toggleCardNames: () => {}
  }
}
