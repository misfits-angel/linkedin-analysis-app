'use client'

import React from 'react'
import { useCardVisibility } from '@/lib/contexts/UIPreferencesContext'

/**
 * IndependentColumnLayout - Creates two truly independent columns where cards flow naturally
 * Each column operates independently - cards stack vertically based on where the previous card ends
 * No common starting point - cards flow naturally in their respective columns
 * Card size variations won't affect the other column
 */
export default function IndependentColumnLayout({ 
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

  // Helper function to check if a child is valid (not null/undefined/false/empty string)
  const isValidChild = (child) => {
    return child !== null && child !== undefined && child !== false && child !== ''
  }

  // Flatten all children (including React Fragments) into a single array
  const flattenChildren = (items) => {
    const result = []
    React.Children.forEach(items, (child) => {
      if (!isValidChild(child)) return
      
      if (child && typeof child === 'object' && child.type === React.Fragment) {
        // Recursively flatten React Fragment children
        result.push(...flattenChildren(child.props.children))
      } else {
        result.push(child)
      }
    })
    return result
  }

  // Flatten all children including nested fragments
  const allFlattenedChildren = flattenChildren(children)

  // If no visible children, return fallback
  if (allFlattenedChildren.length === 0) {
    return fallback
  }

  // Distribute children between two columns
  // Even indices go to left column, odd indices go to right column
  const leftColumnChildren = []
  const rightColumnChildren = []

  allFlattenedChildren.forEach((child, index) => {
    if (index % 2 === 0) {
      leftColumnChildren.push(child)
    } else {
      rightColumnChildren.push(child)
    }
  })

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Left Column - Independent flow */}
      <div className="flex-1 flex flex-col gap-6">
        {leftColumnChildren}
      </div>

      {/* Right Column - Independent flow */}
      <div className="flex-1 flex flex-col gap-6">
        {rightColumnChildren}
      </div>
    </div>
  )
}

/**
 * Alternative distribution method - by content type
 * This could be used if you want to group certain types of cards together
 */
export function IndependentColumnLayoutByType({ 
  children, 
  cardIds = [], 
  className = "",
  fallback = null 
}) {
  const { cardVisibility, isInitialized } = useCardVisibility()

  if (!isInitialized) {
    return fallback
  }

  const visibleChildren = children.filter((child, index) => {
    const cardId = cardIds[index]
    return !cardId || cardVisibility[cardId]
  })

  if (visibleChildren.length === 0) {
    return fallback
  }

  // Distribute by alternating, but you could customize this logic
  const leftColumnChildren = []
  const rightColumnChildren = []

  visibleChildren.forEach((child, index) => {
    if (index % 2 === 0) {
      leftColumnChildren.push(child)
    } else {
      rightColumnChildren.push(child)
    }
  })

  return (
    <div className={`flex flex-col lg:flex-row gap-8 ${className}`}>
      <div className="flex-1 space-y-8">
        {leftColumnChildren.map((child, index) => (
          <div key={`left-${index}`} className="w-full">
            {child}
          </div>
        ))}
      </div>
      <div className="flex-1 space-y-8">
        {rightColumnChildren.map((child, index) => (
          <div key={`right-${index}`} className="w-full">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
