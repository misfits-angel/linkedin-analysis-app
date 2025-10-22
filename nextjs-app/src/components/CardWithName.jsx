'use client'

import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCardNames } from '@/lib/contexts/CardNameContext'

export default function Card({ 
  children, 
  cardName, 
  className = '',
  ...props 
}) {
  const { showCardNames } = useCardNames()

  return (
    <div className={`relative ${showCardNames ? 'pt-8' : ''} ${className}`}>
      {/* Card Name - positioned outside the card */}
      {showCardNames && cardName && (
        <div className="absolute top-0 left-0 text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border z-10 max-w-full truncate">
          {cardName}
        </div>
      )}
      
      {/* Actual Card */}
      <UICard {...props}>
        {children}
      </UICard>
    </div>
  )
}

// Re-export the sub-components for convenience
export { CardContent, CardHeader, CardTitle }
