'use client'

import { useEffect, useCallback } from 'react'

const STORAGE_KEYS = {
  data: 'linkedin_analysis_data',
  timestamp: 'linkedin_analysis_timestamp'
}

export function useDataPersistence() {
  const saveData = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.timestamp, new Date().toISOString())
      console.log('Data saved to localStorage')
    } catch (error) {
      console.error('Failed to save data to localStorage:', error)
    }
  }, [])

  const loadData = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.data)
      const timestamp = localStorage.getItem(STORAGE_KEYS.timestamp)
      
      if (!data || !timestamp) {
        return null
      }

      // Check if data is not too old (e.g., 7 days)
      const dataAge = Date.now() - new Date(timestamp).getTime()
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      
      if (dataAge > maxAge) {
        console.log('Saved data is too old, clearing...')
        clearData()
        return null
      }

      const parsedData = JSON.parse(data)
      console.log('Data loaded from localStorage')
      return parsedData
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
      return null
    }
  }, [])

  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.data)
      localStorage.removeItem(STORAGE_KEYS.timestamp)
      console.log('Data cleared from localStorage')
    } catch (error) {
      console.error('Failed to clear data from localStorage:', error)
    }
  }, [])

  const hasStoredData = useCallback(() => {
    return localStorage.getItem(STORAGE_KEYS.data) !== null
  }, [])

  return {
    saveData,
    loadData,
    clearData,
    hasStoredData
  }
}
