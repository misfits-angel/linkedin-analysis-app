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
import ProfileSelector from '@/components/ProfileSelector'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/contexts/AuthContext'

function HomeContent() {
  const [error, setError] = useState(null)
  const [savedData, setSavedData] = useState(null)
  const [currentProfile, setCurrentProfile] = useState(null)
  const [showProfileSelector, setShowProfileSelector] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const linkedinCardRef = useRef(null)
  const fileInputRef = useRef(null)
  const { data, isLoading, error: dataError, analyzeCsvData, clearData: clearAnalysisData } = useDataAnalysis(savedData)
  const { saveData, loadData, loadDatasetById, clearData, hasStoredData, loadAllDatasets } = useDataPersistence()
  const { showCardNames, toggleCardNames } = useCardNames()
  const { user } = useAuth()

  // Load saved data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Check if user is a misfits.capital admin
        const isAdmin = user?.email?.endsWith('@misfits.capital')
        
        if (isAdmin) {
          // For admin users, don't auto-load - let them select manually
        } else {
          // For regular users, try to load their personal data
          const loadedData = await loadData()
          if (loadedData) {
            setSavedData(loadedData)
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setIsInitialLoad(false)
      }
    }
    
    if (user && isInitialLoad) {
      loadInitialData()
    } else if (!user) {
      setIsInitialLoad(false)
    }
  }, [user, isInitialLoad])

  // Handle profile selection
  const handleProfileSelect = async (datasetId) => {
    if (!datasetId) {
      setCurrentProfile(null)
      setSavedData(null)
      return
    }

    try {
      const profileData = await loadDatasetById(datasetId)
      
      if (profileData) {
        setSavedData(profileData)
        setCurrentProfile({ id: datasetId, name: profileData.profile?.name })
        setShowProfileSelector(false)
        
        // Scroll to dashboard section after loading profile
        setTimeout(() => {
          const dashboardElement = document.getElementById('dashboard')
          if (dashboardElement) {
            dashboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        setError('Failed to load profile data - no data returned')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError('Failed to load profile data')
    }
  }

  // Handle upload new profile
  const handleUploadNew = () => {
    setShowProfileSelector(false)
    setCurrentProfile(null)
    setSavedData(null)
    // Clear any existing data analysis
    clearAnalysisData()
    // Trigger file input directly
    fileInputRef.current?.click()
  }

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
    setCurrentProfile(null)
    setError(null)
  }, [clearData, clearAnalysisData])


  const handleFileUpload = async (csvData, metadata = {}) => {
    setError(null)
    
    try {
      const result = await analyzeCsvData(csvData, metadata)
      
      // Save data to both Supabase and localStorage
      if (result) {
        console.log('CSV analysis completed successfully')
        const saveResult = await saveData(result)
        if (saveResult.success) {
          // Update current profile if saved to Supabase
          if (saveResult.id) {
            setCurrentProfile({ id: saveResult.id, name: result.profile?.name })
          }
        }
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
      
      // Extract metadata from the file
      const metadata = {
        fileName: file.name,
        rawCsvData: text, // Store the raw CSV text
        storagePath: null, // Could be set if using Supabase Storage
        linkedinProfileUrl: null // Could be extracted from CSV or provided by user
      }
      
      // Parse CSV and extract metadata
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            // Look for LinkedIn profile URL in the first few rows
            const firstRow = results.data[0]
            if (firstRow.profileUrl || firstRow.linkedinUrl || firstRow.authorUrl) {
              metadata.linkedinProfileUrl = firstRow.profileUrl || firstRow.linkedinUrl || firstRow.authorUrl
            }
            handleFileUpload(results.data, metadata)
          }
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process CSV file'
      setError(errorMessage)
      console.error('File upload error:', err)
    }
  }

  // Handle file input change (for Upload New button)
  const handleFileInputChange = async (event) => {
    const file = event.target.files?.[0]
    if (file) {
      await handleFileUploadFromMenu(file)
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

      {/* Profile Selector - Always show for multi-user functionality */}
      <ProfileSelector
        currentProfile={currentProfile}
        onProfileSelect={handleProfileSelect}
        onUploadNew={handleUploadNew}
        showUploadButton={true}
        defaultCollapsed={false}
      />

      {/* Hidden file input for Upload New button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload CSV data file"
      />

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
          {(isLoading || isInitialLoad) && (
            <CardWithName cardName="Loading State Card" className="p-8 text-center">
              <CardContent>
                <div className="loading-skeleton mb-4" style={{ height: '3rem', borderRadius: '0.5rem' }}></div>
                <p className="text-muted-foreground">
                  {isInitialLoad ? '🔄 Loading your data...' : '📊 Processing your CSV file and analyzing LinkedIn posts...'}
                </p>
              </CardContent>
            </CardWithName>
          )}

          {/* File Upload - Show when no data and user is not admin */}
          {!isLoading && !isInitialLoad && !data && !savedData && !user?.email?.endsWith('@misfits.capital') && (
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

          {/* Admin Message - Show when no data and user is admin */}
          {!isLoading && !isInitialLoad && !data && !savedData && user?.email?.endsWith('@misfits.capital') && (
            <CardWithName cardName="Admin Message Card" className="p-8 text-center">
              <CardContent>
                <div className="mb-4">
                  <div className="text-4xl mb-4">🔑</div>
                  <h2 className="text-xl font-semibold mb-2">Admin Access</h2>
                  <p className="text-muted-foreground mb-6">
                    As a misfits.capital admin, you have access to all LinkedIn datasets. 
                    Use the Profile Selector above to choose which dataset to view.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    If no datasets are available, you can upload new data using the "Upload New" button in the Profile Selector.
                  </p>
                </div>
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
    <ProtectedRoute>
      <CardNameProvider>
        <HomeContent />
      </CardNameProvider>
    </ProtectedRoute>
  )
}
