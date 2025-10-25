'use client'

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardWithName from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'

/**
 * GridCard - Standardized card component for two-column grid layout
 * This ensures all cards have consistent sizing and fit properly in the grid
 */
export default function GridCard({ 
  cardId, 
  cardName, 
  title, 
  children, 
  className = "",
  headerActions = null,
  ...props 
}) {
  return (
    <ConditionalCard cardId={cardId}>
      <CardWithName 
        cardName={cardName} 
        className={`h-fit ${className}`}
        {...props}
      >
        {(title || headerActions) && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              {title && (
                <CardTitle className="text-base font-semibold leading-tight">
                  {title}
                </CardTitle>
              )}
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </CardWithName>
    </ConditionalCard>
  )
}

/**
 * GridCardWithName - Alternative version that uses CardWithName for compatibility
 */
export function GridCardWithName({ 
  cardId, 
  cardName, 
  title, 
  children, 
  className = "",
  headerActions = null,
  ...props 
}) {
  return (
    <ConditionalCard cardId={cardId}>
      <CardWithName 
        cardName={cardName} 
        className={`h-fit ${className}`}
        {...props}
      >
        {(title || headerActions) && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              {title && (
                <CardTitle className="text-base font-semibold leading-tight">
                  {title}
                </CardTitle>
              )}
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </CardWithName>
    </ConditionalCard>
  )
}

/**
 * GridCardContent - For cards that only need content without headers
 */
export function GridCardContent({ 
  cardId, 
  cardName, 
  children, 
  className = "",
  ...props 
}) {
  return (
    <ConditionalCard cardId={cardId}>
      <CardWithName 
        cardName={cardName} 
        className={`h-fit ${className}`}
        {...props}
      >
        <CardContent className="p-4">
          {children}
        </CardContent>
      </CardWithName>
    </ConditionalCard>
  )
}
