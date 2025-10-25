'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Settings, Check, X } from 'lucide-react'
import { useCardVisibility } from '@/lib/contexts/UIPreferencesContext'

export default function CardToggleSettings() {
  const {
    cardVisibility,
    isInitialized,
    toggleCard,
    toggleCategory,
    toggleAllCards,
    resetToDefaults,
    getCardsByCategory,
    CARD_DEFINITIONS
  } = useCardVisibility()

  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  if (!isInitialized) {
    return null
  }

  const cardsByCategory = getCardsByCategory()
  const totalCards = Object.keys(CARD_DEFINITIONS).length
  const visibleCards = Object.values(cardVisibility).filter(Boolean).length

  const toggleCategoryExpansion = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleSelectAll = () => {
    toggleAllCards(true)
  }

  const handleSelectNone = () => {
    toggleAllCards(false)
  }

  const handleCategoryToggle = (category) => {
    toggleCategory(category)
  }

  return (
    <Card className="w-full">
      <div 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Card Visibility Settings</span>
              <Badge variant="secondary" className="text-xs">
                {visibleCards}/{totalCards} visible
              </Badge>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
      </div>
      
      {isOpen && (
        <CardContent className="space-y-4">
          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Select None
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs"
            >
              Reset to Defaults
            </Button>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-w-0 w-full" style={{display: 'grid'}}>
            {Object.entries(cardsByCategory).map(([category, cards]) => {
              const categoryVisible = cards.filter(card => card.visible).length
              const categoryTotal = cards.length
              const isExpanded = expandedCategories[category] ?? true

              return (
                <div key={category} className="space-y-2 border rounded-lg p-3 bg-muted/30 min-w-0 flex-shrink-0">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors flex-1"
                      onClick={() => toggleCategoryExpansion(category)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <span className="font-medium text-sm">{category}</span>
                      <Badge variant="outline" className="text-xs">
                        {categoryVisible}/{categoryTotal}
                      </Badge>
                    </div>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryVisible === categoryTotal}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-3 h-3 text-primary bg-background border-2 border-primary rounded focus:ring-primary focus:ring-1"
                      />
                    </label>
                  </div>

                  {/* Category Cards */}
                  {isExpanded && (
                    <div className="space-y-1">
                      {cards.map(card => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between py-1 px-1 rounded hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-xs text-muted-foreground flex-1 truncate">
                            {card.name}
                          </span>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={card.visible}
                              onChange={() => toggleCard(card.id)}
                              className="w-3 h-3 text-primary bg-background border-2 border-primary rounded focus:ring-primary focus:ring-1"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Total cards:</span>
              <span>{totalCards}</span>
            </div>
            <div className="flex justify-between">
              <span>Visible cards:</span>
              <span className="font-medium text-primary">{visibleCards}</span>
            </div>
            <div className="flex justify-between">
              <span>Hidden cards:</span>
              <span className="font-medium text-muted-foreground">{totalCards - visibleCards}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
