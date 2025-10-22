'use client'

import { useState } from 'react'
import { analyzeCsvData as processCsvData } from '@/lib/csv-processor'

export function useDataAnalysis(initialData) {
  const [data, setData] = useState(initialData || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeCsvData = async (csvData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Analyzing CSV data:', csvData.length, 'rows')
      
      // Process CSV data using the migrated logic
      const result = processCsvData(csvData)
      
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
