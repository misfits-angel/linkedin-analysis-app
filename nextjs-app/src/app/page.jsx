'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import FileUpload from '@/components/FileUpload'
import MenuDropdown from '@/components/MenuDropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardWithName from '@/components/CardWithName'
import { Badge } from '@/components/ui/badge'
import { useDataAnalysis } from '@/lib/hooks/useDataAnalysis'
import { useDataPersistence } from '@/lib/hooks/useDataPersistence'
import { generatePDF, printPage } from '@/lib/pdf-utils'
import { useCardNames } from '@/lib/contexts/UIPreferencesContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import AdminControlSection from '@/components/AdminControlSection'
import LinkedInAnalyticsSection from '@/components/LinkedInAnalyticsSection'
import UnstoppableSection from '@/components/UnstoppableSection'

function HomeContent() {
  const [error, setError] = useState(null)
  const [savedData, setSavedData] = useState(null)
  const [currentProfile, setCurrentProfile] = useState(null)
  const [showProfileSelector, setShowProfileSelector] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [shareableUrl, setShareableUrl] = useState(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isDeletingReport, setIsDeletingReport] = useState(false)
  const [isShareableReportCollapsed, setIsShareableReportCollapsed] = useState(false)
  const linkedinCardRef = useRef(null)
  const fileInputRef = useRef(null)
  const { data, isLoading, error: dataError, analyzeCsvData, clearData: clearAnalysisData } = useDataAnalysis(savedData)
  const { saveData, loadData, loadDatasetById, clearData, hasStoredData, loadAllDatasets } = useDataPersistence()
  const { showCardNames, toggleCardNames } = useCardNames()
  const { user } = useAuth()

  // Load saved data on mount
  useEffect(() => {
    let isMounted = true // Track if component is still mounted
    
    const loadInitialData = async () => {
      try {
        // Check if user is a misfits.capital admin
        const isAdmin = user?.email?.endsWith('@misfits.capital')
        
        if (isAdmin) {
          // For admin users, don't auto-load - let them select manually
        } else {
          // For regular users, try to load their personal data
          const loadedData = await loadData()
          // Only update state if component is still mounted
          if (isMounted && loadedData) {
            setSavedData(loadedData)
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        // Only update state if component is still mounted
        if (isMounted) {
          setIsInitialLoad(false)
        }
      }
    }
    
    if (user && isInitialLoad) {
      loadInitialData()
    } else if (!user) {
      setIsInitialLoad(false)
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [user, isInitialLoad, loadData])

  // Handle profile selection
  const handleProfileSelect = async (datasetId) => {
    if (!datasetId) {
      setCurrentProfile(null)
      setSavedData(null)
      setShareableUrl(null)
      return
    }

    try {
      // Fetch both profile data AND shareable URL together to avoid race conditions
      const profileData = await loadDatasetById(datasetId)
      
      if (profileData) {
        // Check shareable URL BEFORE updating state
        const { data: dataset } = await supabase
          .from('linkedin_datasets')
          .select('shareable_url')
          .eq('id', datasetId)
          .single()
        
        // Update all state together atomically
        setSavedData(profileData)
        setCurrentProfile({ id: datasetId, name: profileData.profile?.name })
        setShareableUrl(dataset?.shareable_url ? `${window.location.origin}/report/${dataset.shareable_url}` : null)
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
    setShareableUrl(null)
    // Clear any existing data analysis
    clearAnalysisData()
    // Trigger file input directly
    fileInputRef.current?.click()
  }

  // Handle generate shareable report
  const handleGenerateReport = async () => {
    if (!currentProfile?.id) return

    try {
      setIsGeneratingReport(true)
      setError(null)

      // Get current card visibility settings from the UI preferences context
      const cardVisibilitySettings = JSON.parse(localStorage.getItem('cardVisibility') || '{}')
      
      // Get current editable content from localStorage
      const editableContent = JSON.parse(localStorage.getItem('unstoppableContent') || '{}')

      const response = await fetch(`/api/generate-report/${currentProfile.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardVisibility: cardVisibilitySettings,
          editableContent: editableContent
        }),
      })

      const result = await response.json()

      if (result.success) {
        setShareableUrl(result.url)
      } else {
        setError(result.error || 'Failed to generate report')
      }
    } catch (err) {
      console.error('Failed to generate report:', err)
      setError('Failed to generate report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Handle copy URL to clipboard
  const handleCopyUrl = async () => {
    if (!shareableUrl) return

    try {
      await navigator.clipboard.writeText(shareableUrl)
      // You could add a toast notification here
      console.log('URL copied to clipboard')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  // Handle delete report
  const handleDeleteReport = async () => {
    if (!currentProfile?.id) return

    const confirmMessage = `Are you sure you want to delete the report for ${currentProfile.name}?\n\nThis will permanently remove:\n- The shareable report URL\n- AI insights and analysis\n- Report customization settings\n\nNote: The original LinkedIn data and analysis will be preserved.\nThis action cannot be undone.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setIsDeletingReport(true)
      setError(null)

      const response = await fetch(`/api/delete-report/${currentProfile.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Clear only report-related data, keep profile and analysis data
        setShareableUrl(null)
        // Note: We keep currentProfile, savedData, and analysis data intact
        // since we only cleared the report-specific columns from the database
        
        console.log('Report data cleared successfully:', result.clearedDataset)
      } else {
        setError(result.error || 'Failed to clear report data')
      }
    } catch (err) {
      console.error('Failed to clear report data:', err)
      setError('Failed to clear report data')
    } finally {
      setIsDeletingReport(false)
    }
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
    <div className="flex flex-1 flex-col gap-8 py-8 px-8 md:py-12 md:px-20 lg:px-32 xl:px-40 2xl:px-48 w-full max-w-[1600px] mx-auto">

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


      {/* Section 1: Admin Control */}
      <AdminControlSection
        currentProfile={currentProfile}
        onProfileSelect={handleProfileSelect}
        onUploadNew={handleUploadNew}
        showProfileSelector={showProfileSelector}
        shareableUrl={shareableUrl}
        isShareableReportCollapsed={isShareableReportCollapsed}
        setIsShareableReportCollapsed={setIsShareableReportCollapsed}
        onGenerateReport={handleGenerateReport}
        isGeneratingReport={isGeneratingReport}
        onCopyUrl={handleCopyUrl}
        onDeleteReport={handleDeleteReport}
        isDeletingReport={isDeletingReport}
        data={data}
        savedData={savedData}
        isLoading={isLoading}
        isInitialLoad={isInitialLoad}
        user={user}
        showCardNames={showCardNames}
        toggleCardNames={toggleCardNames}
        onFileUpload={handleFileUploadFromMenu}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Section 2: LinkedIn Analytics - Show when data is available */}
      {!isLoading && (data || savedData) && (
        <LinkedInAnalyticsSection data={data} />
      )}

      {/* Section 3: Unstoppable - Always show */}
      <UnstoppableSection />
    </div>
  )
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  )
}
