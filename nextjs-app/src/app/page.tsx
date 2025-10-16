'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import MetricsDisplay from '@/components/MetricsDisplay'
import ChartSection from '@/components/ChartSection'
import InsightsPanel from '@/components/InsightsPanel'
import EngagementAnalysis from '@/components/EngagementAnalysis'
import PostingRhythm from '@/components/PostingRhythm'
import TimingInsights from '@/components/TimingInsights'
import TopPosts from '@/components/TopPosts'
import PeerComparison from '@/components/PeerComparison'
import ValueProposition from '@/components/ValueProposition'
import MenuDropdown from '@/components/MenuDropdown'
import { useDataAnalysis } from '@/lib/hooks/useDataAnalysis'
import { useDataPersistence } from '@/lib/hooks/useDataPersistence'
import { generatePDF, printPage } from '@/lib/pdf-utils'

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [savedData, setSavedData] = useState<any>(null)
  const { data, isLoading, error: dataError, analyzeCsvData, clearData: clearAnalysisData } = useDataAnalysis(savedData)
  const { saveData, loadData, clearData, hasStoredData } = useDataPersistence()

  // Load saved data on mount
  useEffect(() => {
    const loadedData = loadData()
    if (loadedData && !savedData) {
      setSavedData(loadedData)
      console.log('Loaded saved data from localStorage')
    }
  }, [loadData, savedData])

  // Menu dropdown functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuContainer = document.querySelector('.menu-container')
      const menuDropdown = document.querySelector('.menu-dropdown')
      
      if (menuContainer && menuDropdown && !menuContainer.contains(event.target as Node)) {
        menuDropdown.classList.remove('active')
      }
    }

    const handleMenuClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('.menu-btn')) {
        event.preventDefault()
        const dropdown = document.querySelector('.menu-dropdown')
        dropdown?.classList.toggle('active')
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('click', handleMenuClick)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('click', handleMenuClick)
    }
  }, [])

  const handleFileUpload = async (csvData: any[]) => {
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

  const handleFileUploadFromMenu = async (file: File) => {
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

  const handlePrint = () => {
    try {
      printPage()
    } catch (error) {
      console.error('Print failed:', error)
      setError('Failed to open print dialog')
    }
  }

  const handleDownloadPDF = async () => {
    try {
      await generatePDF('main-content', {
        filename: `linkedin-analysis-${new Date().toISOString().split('T')[0]}.pdf`
      })
    } catch (error) {
      console.error('PDF generation failed:', error)
      setError('Failed to generate PDF')
    }
  }

  const handleClearData = () => {
    clearData()
    clearAnalysisData()
    setSavedData(null)
    setError(null)
    console.log('Data cleared and state reset')
  }

  const displayError = error || dataError

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span>{data?.profile?.name || 'LinkedIn Yearly Wrap'}</span>
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              <span>{new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="text-sm text-gray-500">
              Audit Period: <span>Last 12 months</span>
            </div>
          </div>
          <MenuDropdown 
            onFileUpload={handleFileUploadFromMenu}
            onPrint={handlePrint}
            onDownloadPDF={handleDownloadPDF}
          />
        </header>

        {/* Error Display */}
        {displayError && (
          <div className="error-message">
            {displayError}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card p-8 text-center">
            <div className="loading-skeleton mb-4" style={{ height: '3rem', borderRadius: '0.5rem' }}></div>
            <p className="text-gray-600">
              📊 Processing your CSV file and analyzing LinkedIn posts...
            </p>
          </div>
        )}

        {/* Success State */}
        {data && !isLoading && (
          <div id="main-content" className="space-y-6">
            {/* Key Numbers Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="label">Posts <span style={{fontSize: '0.7rem', color: '#9ca3af'}}>(excl. reshares)</span></div>
                <div className="metric" role="status" aria-live="polite" aria-label="Total posts in last 12 months excluding reshares">
                  {data?.summary?.posts_last_12m ?? '-'}
                </div>
              </div>
              <div className="card p-4">
                <div className="label">Active months</div>
                <div className="metric" role="status" aria-live="polite" aria-label="Number of active months">
                  {data?.summary?.active_months ?? '-'}
                </div>
              </div>
              <div className="card p-4">
                <div className="label">Median engagement</div>
                <div className="metric" role="status" aria-live="polite" aria-label="Median engagement per post">
                  {data?.summary?.median_engagement ?? '-'}
                </div>
              </div>
              <div className="card p-4">
                <div className="label">P90 engagement</div>
                <div className="metric" role="status" aria-live="polite" aria-label="90th percentile engagement">
                  {data?.summary?.p90_engagement ?? '-'}
                </div>
              </div>
            </section>

            <ChartSection data={data} />
            <EngagementAnalysis data={data} />
            <InsightsPanel data={data} />
            
            {/* Timing Insights */}
            <TimingInsights data={data} />

            {/* Posting Rhythm & Top Posts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PostingRhythm data={data} />
              <TopPosts data={data} />
            </section>

            {/* Peer Comparison */}
            <PeerComparison data={data} />

            {/* Value Proposition Section */}
            <ValueProposition data={data} />

            {/* Data Management */}
            <section className="card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="section-title mb-1">Data Management</div>
                  <div className="text-sm text-gray-600">Clear saved data or download analysis</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    🗑️ Clear Data
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Empty State */}
        {!data && !isLoading && !displayError && (
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4 emoji-display">📊</div>
            <h2 className="text-xl font-semibold mb-2">Analyze Your LinkedIn Performance</h2>
            <p className="text-gray-600 mb-6">
              Upload your LinkedIn CSV data to get AI-powered insights about your posting patterns, engagement trends, and content performance.
            </p>
            
            <div className="mt-8 text-sm text-gray-500 text-center">
              <p className="mb-2">Supported features:</p>
              <ul className="space-y-1 inline-block text-left">
                <li>• 📈 Engagement analysis and trends</li>
                <li>• 🎯 AI-powered content insights</li>
                <li>• 📊 Visual charts and metrics</li>
                <li>• 💡 Strategic recommendations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
