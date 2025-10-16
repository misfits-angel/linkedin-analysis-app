'use client'

import { useState } from 'react'

interface PeerComparisonProps {
  data: any
}

export default function PeerComparison({ data }: PeerComparisonProps) {
  const [peerData, setPeerData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePeerFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const text = await file.text()
      
      // Parse CSV
      const Papa = (await import('papaparse')).default
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      })

      if (!result.data || result.data.length === 0) {
        throw new Error('No data found in peer CSV file.')
      }

      // Process the peer data using the same logic as main data
      const { analyzeCsvData } = await import('@/lib/csv-processor')
      const processedPeerData = analyzeCsvData(result.data)

      if (!processedPeerData) {
        throw new Error('Failed to process peer CSV data')
      }

      setPeerData(processedPeerData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process peer file'
      setError(errorMessage)
      console.error('Peer file processing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearPeerData = () => {
    setPeerData(null)
    setError(null)
  }

  const generateComparisonInsights = (you: any, peer: any) => {
    const insights = []
    
    // Posts comparison
    const yourPosts = you?.summary?.posts_last_12m || 0
    const peerPosts = peer?.summary?.posts_last_12m || 0
    if (yourPosts > 0 && peerPosts > 0) {
      const postDiff = Math.round(((yourPosts - peerPosts) / peerPosts) * 100)
      if (Math.abs(postDiff) > 10) {
        insights.push(`📝 ${postDiff > 0 ? 'You post' : 'Peer posts'} ${Math.abs(postDiff)}% more frequently`)
      }
    }
    
    // Engagement comparison
    const yourMedian = you?.summary?.median_engagement || 0
    const peerMedian = peer?.summary?.median_engagement || 0
    if (yourMedian > 0 && peerMedian > 0) {
      const engagementDiff = Math.round(((yourMedian - peerMedian) / peerMedian) * 100)
      if (Math.abs(engagementDiff) > 15) {
        insights.push(`🎯 ${engagementDiff > 0 ? 'Your' : 'Peer\'s'} median engagement is ${Math.abs(engagementDiff)}% higher`)
      }
    }
    
    // P90 comparison
    const yourP90 = you?.summary?.p90_engagement || 0
    const peerP90 = peer?.summary?.p90_engagement || 0
    if (yourP90 > 0 && peerP90 > 0) {
      const p90Diff = Math.round(((yourP90 - peerP90) / peerP90) * 100)
      if (Math.abs(p90Diff) > 20) {
        insights.push(`🚀 ${p90Diff > 0 ? 'Your' : 'Peer\'s'} top 10% posts perform ${Math.abs(p90Diff)}% better`)
      }
    }
    
    // Activity consistency
    const yourActive = you?.summary?.active_months || 0
    const peerActive = peer?.summary?.active_months || 0
    if (yourActive > 0 && peerActive > 0) {
      const activeDiff = yourActive - peerActive
      if (Math.abs(activeDiff) > 2) {
        insights.push(`📅 ${activeDiff > 0 ? 'You are' : 'Peer is'} ${Math.abs(activeDiff)} months more consistent`)
      }
    }
    
    if (insights.length === 0) {
      insights.push('📊 Similar performance levels - both profiles show comparable metrics')
    }
    
    return insights
  }

  if (!data?.summary) {
    return null
  }

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="section-title">👥 Peer Comparison</div>
        <div className="flex gap-2">
          <input
            id="peerFileInput"
            type="file"
            accept=".csv,text/csv"
            onChange={handlePeerFileUpload}
            className="hidden"
          />
          <label
            htmlFor="peerFileInput"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            📊 Upload Peer CSV
          </label>
          {peerData && (
            <button
              onClick={clearPeerData}
              className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Processing peer data...</div>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}
      
      {!peerData && !isLoading && !error && (
        <div className="text-sm text-gray-500 italic">
          Upload a similar LinkedIn CSV file to compare your performance metrics with a peer.
        </div>
      )}
      
      {peerData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Metrics */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="font-semibold text-blue-800">You ({data.profile?.name || 'LinkedIn User'})</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts (12m):</span>
                  <span className="font-semibold">{data.summary?.posts_last_12m || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Median Engagement:</span>
                  <span className="font-semibold">{data.summary?.median_engagement || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">P90 Engagement:</span>
                  <span className="font-semibold">{data.summary?.p90_engagement || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Months:</span>
                  <span className="font-semibold">{data.summary?.active_months || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Peer Metrics */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="font-semibold text-purple-800">Peer ({peerData.profile?.name || 'Peer User'})</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts (12m):</span>
                  <span className="font-semibold">{peerData.summary?.posts_last_12m || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Median Engagement:</span>
                  <span className="font-semibold">{peerData.summary?.median_engagement || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">P90 Engagement:</span>
                  <span className="font-semibold">{peerData.summary?.p90_engagement || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Months:</span>
                  <span className="font-semibold">{peerData.summary?.active_months || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comparison Insights */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-2">📊 Key Insights</div>
            <div className="space-y-1 text-sm text-gray-600">
              {generateComparisonInsights(data, peerData).map((insight, index) => (
                <div key={index}>{insight}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
