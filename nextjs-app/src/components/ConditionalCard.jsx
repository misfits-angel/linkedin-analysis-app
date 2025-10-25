'use client'

import { useCardVisibility as useMainCardVisibility } from '@/lib/contexts/UIPreferencesContext'
import { useCardVisibility as useShareableCardVisibility } from '@/lib/contexts/ShareableReportUIPreferencesContext'

export default function ConditionalCard({ cardId, children, fallback = null }) {
  // Try to use the appropriate context based on what's available
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
      // If neither context is available, render children (for backward compatibility)
      console.warn('ConditionalCard: No card visibility context available, rendering children')
      return children
    }
  }

  // Don't render anything if not initialized or card is not visible
  if (!isInitialized || !cardVisibility[cardId]) {
    return fallback
  }

  return children
}
