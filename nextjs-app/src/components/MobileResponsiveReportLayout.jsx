'use client'

import React from 'react'
import { useCardVisibility } from '@/lib/contexts/UIPreferencesContext'

/**
 * MobileResponsiveReportLayout - Optimized layout for shareable reports
 * - Mobile: Single column layout with optimized spacing
 * - Tablet: Single column with larger spacing
 * - Desktop: Two column layout
 */
export default function MobileResponsiveReportLayout({ 
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

  // For mobile and tablet, use single column
  // For desktop (lg and above), use two columns
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile and Tablet: Single Column Layout */}
      <div className="block lg:hidden">
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
          {allFlattenedChildren}
        </div>
      </div>

      {/* Desktop: Two Column Layout */}
      <div className="hidden lg:block">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6">
            {allFlattenedChildren.filter((_, index) => index % 2 === 0)}
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-6">
            {allFlattenedChildren.filter((_, index) => index % 2 === 1)}
          </div>
        </div>
      </div>
    </div>
  )
}
