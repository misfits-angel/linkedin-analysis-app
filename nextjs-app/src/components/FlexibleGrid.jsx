'use client'

import { useCardVisibility } from '@/lib/contexts/UIPreferencesContext'

/**
 * FlexibleGrid component that creates a responsive two-column layout that adapts to visible cards
 * Uses CSS Grid with auto-fit to handle dynamic card visibility
 */
export default function FlexibleGrid({ 
  children, 
  cardIds = [], 
  className = "",
  gap = "1.5rem",
  fallback = null 
}) {
  const { cardVisibility, isInitialized } = useCardVisibility()

  // Don't render anything if not initialized
  if (!isInitialized) {
    return fallback
  }

  // Filter children based on card visibility
  const visibleChildren = children.filter((child, index) => {
    const cardId = cardIds[index]
    return !cardId || cardVisibility[cardId]
  })

  // If no visible children, return fallback
  if (visibleChildren.length === 0) {
    return fallback
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {visibleChildren}
    </div>
  )
}

/**
 * FlexibleRow component for two-column layouts that adapt to visibility
 */
export function FlexibleRow({ 
  children, 
  cardIds = [], 
  className = "",
  fallback = null 
}) {
  const { cardVisibility, isInitialized } = useCardVisibility()

  // Don't render anything if not initialized
  if (!isInitialized) {
    return fallback
  }

  // Filter children based on card visibility
  const visibleChildren = children.filter((child, index) => {
    const cardId = cardIds[index]
    return !cardId || cardVisibility[cardId]
  })

  // If no visible children, return fallback
  if (visibleChildren.length === 0) {
    return fallback
  }

  // Use responsive layout - single column on mobile, two columns on large screens
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {visibleChildren}
    </div>
  )
}
