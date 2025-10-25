'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ConditionalCard from './ConditionalCard'

/**
 * CollapsibleGridCard - Standardized card component for independent column layout
 * Cards now flow naturally without collapse functionality since columns are independent
 */
export default function CollapsibleGridCard({ 
  cardId, 
  cardName, 
  title, 
  children, 
  className = "",
  headerActions = null,
  collapsedHeight = "200px", // Keep for backward compatibility but not used
  ...props 
}) {
  return (
    <ConditionalCard cardId={cardId}>
      <Card 
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
      </Card>
    </ConditionalCard>
  )
}

/**
 * CollapsibleGridCardContent - For cards that only need content without headers
 * Cards now flow naturally without collapse functionality since columns are independent
 */
export function CollapsibleGridCardContent({ 
  cardId, 
  cardName, 
  children, 
  className = "",
  collapsedHeight = "200px", // Keep for backward compatibility but not used
  ...props 
}) {
  return (
    <ConditionalCard cardId={cardId}>
      <Card 
        cardName={cardName} 
        className={`h-fit ${className}`}
        {...props}
      >
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}
