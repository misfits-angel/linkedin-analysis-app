'use client'

import React from 'react'
import { useCardVisibility } from '@/lib/contexts/UIPreferencesContext'
import { getVisibleCardComponents, getCardOrder } from '@/lib/utils/dynamicCardDetection'
import ConditionalCard from '@/components/ConditionalCard'

/**
 * DynamicReportLayout - Automatically includes all visible cards in the report
 * This ensures that any new cards added to the system are automatically included
 * when they are visible, making the report generation truly dynamic
 */
function DynamicReportLayoutContent({ data, className, fallback, cardVisibility, isInitialized }) {
  const [screenWidth, setScreenWidth] = React.useState(0)

  // Add screen width detection
  React.useEffect(() => {
    const updateScreenWidth = () => {
      const width = window.innerWidth
      setScreenWidth(width)
    }
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(updateScreenWidth, 100)
    window.addEventListener('resize', updateScreenWidth)
    return () => window.removeEventListener('resize', updateScreenWidth)
  }, [])

  // Don't render anything if not initialized
  if (!isInitialized) {
    return fallback
  }

  // Get all visible card components dynamically
  const visibleCardComponents = getVisibleCardComponents(cardVisibility, data)
  const cardOrder = getCardOrder(cardVisibility)
  
  // Sort visible components by the preferred order
  const orderedComponents = cardOrder.map(cardId => 
    visibleCardComponents.find(comp => comp.cardId === cardId)
  ).filter(Boolean)

  // If no visible components, return fallback
  if (orderedComponents.length === 0) {
    return fallback
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Layout for screens >= 1024px */}
      {screenWidth >= 1024 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orderedComponents.filter((_, index) => index % 2 === 0).map(({ cardId, Component, props }) => (
              <ConditionalCard key={cardId} cardId={cardId}>
                <Component {...props} />
              </ConditionalCard>
            ))}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orderedComponents.filter((_, index) => index % 2 === 1).map(({ cardId, Component, props }) => (
              <ConditionalCard key={cardId} cardId={cardId}>
                <Component {...props} />
              </ConditionalCard>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Layout for screens < 1024px */}
      {screenWidth > 0 && screenWidth < 1024 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orderedComponents.map(({ cardId, Component, props }) => (
            <ConditionalCard key={cardId} cardId={cardId}>
              <Component {...props} />
            </ConditionalCard>
          ))}
        </div>
      )}

      {/* Fallback while loading */}
      {screenWidth === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orderedComponents.map(({ cardId, Component, props }) => (
            <ConditionalCard key={cardId} cardId={cardId}>
              <Component {...props} />
            </ConditionalCard>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DynamicReportLayout({ 
  data, 
  className = "",
  fallback = null 
}) {
  // Use the hook safely - if it fails, we catch it in the error boundary
  const { cardVisibility, isInitialized } = useCardVisibility()

  return (
    <DynamicReportLayoutContent 
      data={data}
      className={className}
      fallback={fallback}
      cardVisibility={cardVisibility}
      isInitialized={isInitialized}
    />
  )
}
