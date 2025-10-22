'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import FileUpload from '@/components/FileUpload'
import MetricsDisplay from '@/components/MetricsDisplay'
import ChartSection from '@/components/ChartSection'
import InsightsPanel from '@/components/InsightsPanel'
import EngagementAnalysis from '@/components/EngagementAnalysis'
import PostingRhythm from '@/components/PostingRhythm'
import TimingInsights from '@/components/TimingInsights'
import PostDistributionHeatmap from '@/components/PostDistributionHeatmap'
import TopPosts from '@/components/TopPosts'
import PeerComparison from '@/components/PeerComparison'
import ValueProposition from '@/components/ValueProposition'
import LinkedinAnalyticsCard from '@/components/LinkedinAnalyticsCard'
import PostTypeMosaic from '@/components/PostTypeMosaic'
import PostTypeDistributionCard from '@/components/PostTypeDistributionCard'
import LLMButton from '@/components/LLMButton'
import MenuDropdown from '@/components/MenuDropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardWithName from '@/components/CardWithName'
import { Badge } from '@/components/ui/badge'
import { useDataAnalysis } from '@/lib/hooks/useDataAnalysis'
import { useDataPersistence } from '@/lib/hooks/useDataPersistence'
import { generatePDF, printPage } from '@/lib/pdf-utils'
import { CardNameProvider, useCardNames } from '@/lib/contexts/CardNameContext'

function HomeContent() {
  const [error, setError] = useState(null)
  const [savedData, setSavedData] = useState(null)
  const linkedinCardRef = useRef(null)
  const { data, isLoading, error: dataError, analyzeCsvData, clearData: clearAnalysisData } = useDataAnalysis(savedData)
  const { saveData, loadData, clearData, hasStoredData } = useDataPersistence()
  const { showCardNames, toggleCardNames } = useCardNames()

  // Load saved data on mount
  useEffect(() => {
    const loadedData = loadData()
    if (loadedData && !savedData) {
      setSavedData(loadedData)
      console.log('Loaded saved data from localStorage')
    }
  }, [loadData, savedData])

  // Menu dropdown click outside functionality only
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuContainer = document.querySelector('.menu-container')
      const menuDropdown = document.querySelector('.menu-dropdown')

      if (menuContainer && menuDropdown && !menuContainer.contains(event.target)) {
        menuDropdown.classList.remove('active')
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handlePrint = useCallback(() => {
    try {
      printPage()
    } catch (error) {
      console.error('Print failed:', error)
      setError('Failed to open print dialog')
    }
  }, [])

  const handleDownloadPDF = useCallback(async () => {
    try {
      await generatePDF('main-content', {
        filename: `linkedin-analysis-${new Date().toISOString().split('T')[0]}.pdf`
      })
    } catch (error) {
      console.error('PDF generation failed:', error)
      setError('Failed to generate PDF')
    }
  }, [])

  const handleClearData = useCallback(() => {
    clearData()
    clearAnalysisData()
    setSavedData(null)
    setError(null)
    console.log('Data cleared and state reset')
  }, [clearData, clearAnalysisData])


  const handleFileUpload = async (csvData) => {
    setError(null)
    
    try {
      console.log('Processing CSV file with', csvData.length, 'rows')
      const result = await analyzeCsvData(csvData)
      console.log('CSV analysis completed successfully')
      
      // Save data to localStorage
      if (result) {
        saveData(result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process CSV file'
      setError(errorMessage)
      console.error('File upload error:', err)
    }
  }

  const handleFileUploadFromMenu = async (file) => {
    setError(null)
    
    try {
      const text = await file.text()
      const Papa = (await import('papaparse')).default
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            handleFileUpload(results.data)
          }
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process CSV file'
      setError(errorMessage)
      console.error('File upload error:', err)
    }
  }

  const displayError = error || dataError

  return (
    <div className="flex flex-1 flex-col gap-4 py-8 px-8 md:py-12 md:px-20 lg:px-32 xl:px-40 2xl:px-48 w-full max-w-[1600px] mx-auto">
      {/* Page Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {data?.profile?.name || 'LinkedIn Yearly Wrap'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Badge>
            <Badge variant="outline" className="text-xs">Last 12 months</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCardNames}
            className="text-xs"
          >
            {showCardNames ? '🙈 Hide Names' : '🏷️ Show Names'}
          </Button>
          <MenuDropdown
            onFileUpload={handleFileUploadFromMenu}
            onPrint={handlePrint}
            onDownloadPDF={handleDownloadPDF}
          />
        </div>
      </div>

          {/* Error Display */}
          {displayError && (
            <CardWithName cardName="Error Display Card" className="border-destructive">
              <CardContent className="p-4">
                <div className="text-destructive text-sm">
                  {displayError}
                </div>
              </CardContent>
            </CardWithName>
          )}

          {/* Loading State */}
          {isLoading && (
            <CardWithName cardName="Loading State Card" className="p-8 text-center">
              <CardContent>
                <div className="loading-skeleton mb-4" style={{ height: '3rem', borderRadius: '0.5rem' }}></div>
                <p className="text-muted-foreground">
                  📊 Processing your CSV file and analyzing LinkedIn posts...
                </p>
              </CardContent>
            </CardWithName>
          )}

          {/* File Upload - Show when no data */}
          {!isLoading && !data && !savedData && (
            <CardWithName cardName="File Upload Card" className="p-8 text-center border-dashed border-2 border-gray-300">
              <CardContent>
                <div className="mb-4">
                  <div className="text-4xl mb-4">📊</div>
                  <h2 className="text-xl font-semibold mb-2">Upload Your LinkedIn Data</h2>
                  <p className="text-muted-foreground mb-6">
                    Upload your LinkedIn posts CSV file to generate your yearly analytics report
                  </p>
                </div>
                <FileUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </CardWithName>
          )}

          {/* Main Content - Always Show */}
          {!isLoading && (data || savedData) && (
            <div id="main-content" className="space-y-6">
              {/* Dashboard Section */}
              <section id="dashboard" className="scroll-mt-20">
              {/* Key Numbers Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CardWithName cardName="Posts Count Card">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Posts <span className="text-xs">(excl. reshares)</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {data?.summary?.posts_last_12m ?? '-'}
                    </div>
                  </CardContent>
                </CardWithName>
                <CardWithName cardName="Active Months Card">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Active months
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {data?.summary?.active_months ?? '-'}
                    </div>
                  </CardContent>
                </CardWithName>
                <CardWithName cardName="Median Engagement Card">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Median engagement
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {data?.summary?.median_engagement ?? '-'}
                    </div>
                  </CardContent>
                </CardWithName>
                <CardWithName cardName="P90 Engagement Card">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      P90 engagement
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {data?.summary?.p90_engagement ?? '-'}
                    </div>
                  </CardContent>
                </CardWithName>
              </div>

              {/* Analytics Cards Row */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* LinkedIn Analytics Card */}
                <div className="space-y-4">
                  {/* Generate Brief Summary Button - Outside card area */}
                  <div className="flex justify-start">
                    <LLMButton
                      onClick={() => {
                        if (linkedinCardRef.current && linkedinCardRef.current.handleGenerateBriefSummary) {
                          linkedinCardRef.current.handleGenerateBriefSummary()
                        }
                      }}
                      isLoading={false}
                      text="Generate Brief Summary"
                      loadingText="Analyzing posts..."
                      variant="outline"
                      size="sm"
                    />
                  </div>

                  {data?.trends?.posts_per_month && (
                    <LinkedinAnalyticsCard
                      ref={linkedinCardRef}
                      monthlyCounts={Object.values(data.trends.posts_per_month)}
                      start={{ month: 9, year: 2024 }}
                      insight=""
                      posts={data.posts || []}
                      summaryData={data.summary}
                    />
                  )}
                </div>

                {/* Post Type Distribution Cards - Side by Side Comparison */}
                {data?.mix?.type_share && (
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Original PostTypeMosaic - Single Column Stack */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-600 text-center">Single Column Stack</h3>
                      <div className="flex justify-center">
                        <div className="w-[280px]">
                          <PostTypeMosaic
                            data={(() => {
                              const entries = Object.entries(data.mix.type_share);
                              
                              // Use the same simple rounding logic as Format Mix Chart
                              return entries.map(([type, share]) => ({
                                type: type.charAt(0).toUpperCase() + type.slice(1),
                                value: Math.round((share || 0) * 100),
                                color: undefined // Let component generate green shades
                              }));
                            })()}
                            options={{
                              columns: 1, // Force single column
                              preferOneColumnForThree: false,
                              minH: 80,
                              maxH: 250,
                              unit: 2.5
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* New PostTypeDistributionCard - Two Column Weighted */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-600 text-center">Two Column Weighted</h3>
                      <div className="flex justify-center">
                        <div className="w-[280px] h-[400px]">
                          <PostTypeDistributionCard
                            data={(() => {
                              const entries = Object.entries(data.mix.type_share);
                              
                              // Use the same simple rounding logic as Format Mix Chart
                              return entries.map(([type, share]) => ({
                                type: type.charAt(0).toUpperCase() + type.slice(1),
                                desc: type === 'text' ? 'Pure text updates' :
                                      type === 'image' ? 'Posts with static visuals' :
                                      type === 'video' ? 'Clips or video snippets' : `${type} content`,
                                value: Math.round((share || 0) * 100),
                                color: undefined // Let component generate green shades
                              }));
                            })()}
                            options={{
                              columns: 2, // Force two column layout
                              preferOneColumnForThree: false,
                              minH: 0, // No minimum height threshold
                              maxH: 400, // Increased maximum height
                              unit: 4 // Increased unit for taller rectangles
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </section>

            <section id="analytics" className="scroll-mt-20">
              <ChartSection data={data} />
            </section>

            <section id="engagement" className="scroll-mt-20">
              <EngagementAnalysis data={data} />
            </section>

            <section id="ai-insights" className="scroll-mt-20">
              <InsightsPanel data={data} />
            </section>

            {/* Timing Insights */}
            <section id="timing" className="scroll-mt-20">
              <TimingInsights data={data} />
            </section>

            {/* Post Distribution Heatmap */}
            <section id="heatmap" className="scroll-mt-20">
              <PostDistributionHeatmap data={data} />
            </section>

            {/* Posting Rhythm & Top Posts */}
            <section id="top-posts" className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PostingRhythm data={data} />
              <TopPosts data={data} />
            </section>

            {/* Peer Comparison */}
            <section id="peer-comparison" className="scroll-mt-20">
              <PeerComparison data={data} />
            </section>

            {/* Value Proposition Section */}
            <section id="value-proposition" className="scroll-mt-20">
              <ValueProposition data={data} />
            </section>

              {/* Data Management */}
              <CardWithName cardName="Data Management Card">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Clear saved data or download analysis</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleClearData}
                        variant="destructive"
                        size="sm"
                      >
                        🗑️ Clear Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CardWithName>
            </div>
          )}
    </div>
  )
}

export default function Home() {
  return (
    <CardNameProvider>
      <HomeContent />
    </CardNameProvider>
  )
}
