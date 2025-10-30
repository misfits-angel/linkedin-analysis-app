import React from 'react'
import { createClient } from '@supabase/supabase-js'
import ProposalContentClient from './ProposalContentClient'

// Server Component - fetches data on the server
export default async function StaticReport({ params }) {
  // Create Supabase client for server-side
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  )

  try {
    // Fetch data on the server
        const { data: dataset, error: fetchError } = await supabase
          .from('linkedin_datasets')
          .select('*')
          .eq('shareable_url', params.token)
          .single()

    if (fetchError || !dataset) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
            <p className="text-gray-600 text-sm sm:text-base">This report could not be found.</p>
          </div>
      </div>
    )
  }

    const data = {
      ...dataset.analysis_data,
      llmInsights: dataset.llm_insights,
      profile: dataset.analysis_data?.profile
    }

  if (!data) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Data Available</h1>
          <p className="text-gray-600 text-sm sm:text-base">This report contains no data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Prepared for</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {data?.profile?.name || 'LinkedIn Profile'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-0">
          <ProposalContentClient data={data} />
        </div>
      </div>
    )
  } catch (err) {
    console.error('Failed to load report:', err)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Error Loading Report</h1>
          <p className="text-gray-600 text-sm sm:text-base">{err.message}</p>
      </div>
    </div>
  )
  }
}
