'use client'

import { useCardVisibility as useMainCardVisibility } from '@/lib/contexts/UIPreferencesContext'
import { useCardVisibility as useShareableCardVisibility } from '@/lib/contexts/ShareableReportUIPreferencesContext'

/**
 * Hook to check if a specific card is visible
 * Works with both main dashboard and shareable report contexts
 */
export function useCardVisibilityCheck(cardId) {
  let cardVisibility = {}
  let isInitialized = false

  try {
    // First try the main context (for dashboard)
    const mainContext = useMainCardVisibility()
    cardVisibility = mainContext.cardVisibility
    isInitialized = mainContext.isInitialized
  } catch (error) {
    try {
      // Fall back to shareable report context
      const shareableContext = useShareableCardVisibility()
      cardVisibility = shareableContext.cardVisibility
      isInitialized = shareableContext.isInitialized
    } catch (shareableError) {
      // If neither context is available, assume card is visible (for backward compatibility)
      console.warn('useCardVisibilityCheck: No card visibility context available, assuming card is visible')
      return true
    }
  }

  // Return true if initialized and card is visible, false otherwise
  const isVisible = isInitialized && cardVisibility[cardId] === true
  
  // Debug logging for shareable reports
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Card visibility check for ${cardId}:`, {
      isInitialized,
      cardVisibility: cardVisibility[cardId],
      isVisible
    })
  }
  
  return isVisible
}
