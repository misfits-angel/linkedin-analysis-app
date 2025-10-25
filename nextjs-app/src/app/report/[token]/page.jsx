'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase-client'
import { ShareableReportUIPreferencesProvider, useCardVisibility } from '@/lib/contexts/ShareableReportUIPreferencesContext'
import { EditableContentProvider } from '@/lib/contexts/EditableContentContext'
import { getVisibleCardComponents, getCardOrder } from '@/lib/utils/dynamicCardDetection'
import ConditionalCard from '@/components/ConditionalCard'

function DynamicReportContent({ data }) {
  const { cardVisibility, isInitialized } = useCardVisibility()
  const [screenWidth, setScreenWidth] = React.useState(0)

  // Add screen width detection
  React.useEffect(() => {
    const updateScreenWidth = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      
      const widthElement = document.getElementById('screen-width')
      if (widthElement) {
        widthElement.textContent = `${width}px`
        console.log('Screen width updated:', width)
      }
    }
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(updateScreenWidth, 100)
    window.addEventListener('resize', updateScreenWidth)
    return () => window.removeEventListener('resize', updateScreenWidth)
  }, [])

  if (!isInitialized) {
    return null
  }

  // Get all visible card components dynamically (with null check for data)
  const visibleCardComponents = data ? getVisibleCardComponents(cardVisibility, data) : []
  const cardOrder = getCardOrder(cardVisibility)
  
  // Sort visible components by the preferred order
  const orderedComponents = cardOrder.map(cardId => 
    visibleCardComponents.find(comp => comp.cardId === cardId)
  ).filter(Boolean)

  // Separate components into Analytics and Unstoppable sections
  const analyticsCards = [
    'posts-count', 'active-months', 'median-engagement', 'p90-engagement', 
    'avg-posts-per-month', 'longest-gap', 'avg-posting-gap', 'peak-month',
    'linkedin-analytics', 'post-type-mosaic', 'engagement-trend-chart', 
    'posts-per-month-chart', 'format-mix-chart', 'top-topics-chart',
    'engagement-by-format', 'ai-insights-summary', 'ai-recommendations', 
    'ai-content-analysis', 'timing-insights', 'day-wise-distribution', 
    'monthly-distribution', 'ai-topic-analysis', 'top-posts', 
    'peer-comparison', 'value-proposition'
  ]

  const unstoppableCards = [
    'why-us', 'how-we-work', 'what-you-get', 'investment-terms', 'next-steps'
  ]

  const analyticsComponents = orderedComponents.filter(comp => 
    analyticsCards.includes(comp.cardId)
  )

  const unstoppableComponents = orderedComponents.filter(comp => 
    unstoppableCards.includes(comp.cardId)
  )

  if (orderedComponents.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, background: 'black', color: 'white', padding: '0.5rem', fontSize: '0.75rem', borderRadius: '0.25rem' }}>
          <div>Screen: {screenWidth < 640 ? 'XS' : screenWidth < 768 ? 'SM' : screenWidth < 1024 ? 'MD' : screenWidth < 1280 ? 'LG' : 'XL+'}</div>
          <div>Analytics: {analyticsComponents.length} cards</div>
          <div>Unstoppable: {unstoppableComponents.length} cards</div>
          <div>Width: {screenWidth}px</div>
          <div>Breakpoint: 1024px</div>
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #444' }}>
            <div style={{ color: screenWidth >= 1024 ? '#4ade80' : '#fbbf24' }}>
              {screenWidth >= 1024 ? '✓ Desktop Mode Active' : '⚠ Mobile Mode Active'}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {analyticsComponents.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Analytics</h2>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                border: '1px solid #d1d5db', 
                color: '#374151',
                backgroundColor: 'transparent'
              }}>
                {data?.summary?.analysis_period_months ? 
                  `Last ${data.summary.analysis_period_months} months` : 
                  'Last 12 months'
                }
              </span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Your LinkedIn performance insights</p>
          </div>

          {/* Analytics Layout - 2 columns on desktop, 1 column on mobile */}
          {screenWidth >= 1024 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {analyticsComponents.filter((_, index) => index % 2 === 0).map(({ cardId, Component, props }) => (
                  <ConditionalCard key={cardId} cardId={cardId}>
                    <Component {...props} />
                  </ConditionalCard>
                ))}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {analyticsComponents.filter((_, index) => index % 2 === 1).map(({ cardId, Component, props }) => (
                  <ConditionalCard key={cardId} cardId={cardId}>
                    <Component {...props} />
                  </ConditionalCard>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsComponents.map(({ cardId, Component, props }) => (
                <ConditionalCard key={cardId} cardId={cardId}>
                  <Component {...props} />
                </ConditionalCard>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Unstoppable Section */}
      {unstoppableComponents.length > 0 && (
        <section>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Unstoppable</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Your path to LinkedIn success starts here</p>
          </div>

          {/* Unstoppable Layout - Always 1 column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            {unstoppableComponents.map(({ cardId, Component, props }) => (
              <ConditionalCard key={cardId} cardId={cardId}>
                <Component {...props} />
              </ConditionalCard>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function StaticReport({ params }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cardVisibilitySettings, setCardVisibilitySettings] = useState({})
  const [editableContent, setEditableContent] = useState({})

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true)
        
        // Find dataset by shareable_url
        const { data: dataset, error: fetchError } = await supabase
          .from('linkedin_datasets')
          .select('*')
          .eq('shareable_url', params.token)
          .single()

        if (fetchError) {
          throw new Error('Report not found')
        }

        if (!dataset) {
          throw new Error('Report not found')
        }

        // Store card visibility settings from the dataset
        if (dataset.card_visibility_settings) {
          console.log('🎛️ Loading card visibility settings from dataset:', dataset.card_visibility_settings)
          setCardVisibilitySettings(dataset.card_visibility_settings)
        }

        // Store editable content from the dataset
        if (dataset.editable_content) {
          console.log('✏️ Loading editable content from dataset:', Object.keys(dataset.editable_content))
          setEditableContent(dataset.editable_content)
        }

        // Always use dynamic rendering for consistent user experience
        setData({
          ...dataset.analysis_data,
          llmInsights: dataset.llm_insights
        })
      } catch (err) {
        console.error('Failed to load report:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.token) {
      loadReportData()
    }
  }, [params.token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Data Available</h1>
          <p className="text-gray-600 text-sm sm:text-base">This report contains no data.</p>
        </div>
      </div>
    )
  }


  return (
    <ShareableReportUIPreferencesProvider initialCardVisibility={cardVisibilitySettings}>
      <EditableContentProvider initialEditableContent={editableContent}>
        <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 px-2">
              {data?.profile?.name || 'LinkedIn Analytics Report'}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 px-2">
              <Badge variant="secondary" className="text-xs">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
        <DynamicReportContent data={data} />
      </div>
    </div>
      </EditableContentProvider>
    </ShareableReportUIPreferencesProvider>
  )
}
