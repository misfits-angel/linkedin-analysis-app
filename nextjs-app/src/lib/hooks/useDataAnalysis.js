'use client'

import { useState, useEffect } from 'react'
import { analyzeCsvData as processCsvData } from '@/lib/csv-processor'

export function useDataAnalysis(initialData) {
  const [data, setData] = useState(initialData || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Update data when initialData changes (e.g., when profile is selected)
  useEffect(() => {
    console.log('🔄 useDataAnalysis: initialData changed', initialData ? 'Has data' : 'No data')
    if (initialData) {
      console.log('📊 useDataAnalysis: Updating data with profile:', initialData.profile?.name)
      setData(initialData)
      setError(null)
    }
  }, [initialData])

  const analyzeCsvData = async (csvData, metadata = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Analyzing CSV data:', csvData.length, 'rows')
      
      // Process CSV data using the migrated logic
      const result = processCsvData(csvData, metadata)
      
      if (!result) {
        throw new Error('Failed to process CSV data')
      }
      
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('CSV analysis error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearData = () => {
    setData(null)
    setError(null)
  }

  return {
    data,
    isLoading,
    error,
    analyzeCsvData,
    clearData
  }
}
