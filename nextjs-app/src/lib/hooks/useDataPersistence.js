'use client'

import { useEffect, useCallback } from 'react'
import { supabase, isSupabaseAvailable } from '@/lib/supabase-client'

const STORAGE_KEYS = {
  data: 'linkedin_analysis_data',
  timestamp: 'linkedin_analysis_timestamp',
  datasetId: 'linkedin_dataset_id' // Track current dataset
}

export function useDataPersistence() {
  // Save to both Supabase AND localStorage (fallback)
  const saveData = useCallback(async (data) => {
    try {
      // Always save to localStorage as backup
      localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.timestamp, new Date().toISOString())
      console.log('✅ Data saved to localStorage')

      // If Supabase is configured, save there too
      if (isSupabaseAvailable()) {
        console.log('🔄 Attempting to save to Supabase...')
        console.log('Author name:', data.profile?.name || 'Unknown')
        console.log('Total posts:', data.summary?.posts_last_12m || 0)
        
        const { data: savedData, error } = await supabase
          .from('linkedin_datasets')
          .insert({
            author_name: data.profile?.name || 'Unknown',
            file_name: data.fileName || null,
            analysis_data: data,
            raw_csv_data: data.rawCsvData || null,
            storage_path: data.storagePath || null,
            linkedin_profile_url: data.linkedinProfileUrl || null,
            // Quick metrics will be auto-extracted by trigger
            total_posts: data.summary?.posts_last_12m || 0,
            median_engagement: data.summary?.median_engagement || 0
          })
          .select()
          .single()

        if (error) {
          console.error('❌ Failed to save to Supabase:', error)
          console.log('💡 Tip: Check SUPABASE_SETUP.md for configuration help')
          return { success: true, source: 'localStorage', id: null }
        }

        // Store the dataset ID for later reference
        localStorage.setItem(STORAGE_KEYS.datasetId, savedData.id)
        console.log('✅ Data saved to Supabase with ID:', savedData.id)
        
        return { success: true, source: 'supabase', id: savedData.id }
      } else {
        console.log('⚠️ Supabase not configured - using localStorage only')
        console.log('💡 To enable cloud storage, see SUPABASE_SETUP.md')
      }

      return { success: true, source: 'localStorage', id: null }
    } catch (error) {
      console.error('Failed to save data:', error)
      return { success: false, error }
    }
  }, [])

  // Load from Supabase first, fallback to localStorage
  const loadData = useCallback(async () => {
    try {
      // Try loading from Supabase first if configured
      if (isSupabaseAvailable()) {
        const datasetId = localStorage.getItem(STORAGE_KEYS.datasetId)
        
        if (datasetId) {
          const { data: dataset, error } = await supabase
            .from('linkedin_datasets')
            .select('*')
            .eq('id', datasetId)
            .single()

          if (!error && dataset) {
            console.log('✅ Data loaded from Supabase')
            return dataset.analysis_data
          }
        }
      }

      // Fallback to localStorage
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
      console.log('✅ Data loaded from localStorage')
      return parsedData
    } catch (error) {
      console.error('Failed to load data:', error)
      return null
    }
  }, [])

  // Load all datasets for a specific author
  const loadDatasetsByAuthor = useCallback(async (authorName) => {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('linkedin_datasets')
        .select('id, author_name, file_name, created_at, total_posts, median_engagement, date_range_start, date_range_end')
        .eq('author_name', authorName)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to load datasets:', error)
      return []
    }
  }, [])

  // Load all available datasets (for multi-user dropdown)
  const loadAllDatasets = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('linkedin_datasets')
        .select('id, author_name, file_name, created_at, total_posts, median_engagement, date_range_start, date_range_end')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to load all datasets:', error)
      return []
    }
  }, [])

  // Load specific dataset by ID
  const loadDatasetById = useCallback(async (datasetId) => {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('linkedin_datasets')
        .select('*')
        .eq('id', datasetId)
        .single()

      if (error) throw error
      
      // Store this as the current dataset
      localStorage.setItem(STORAGE_KEYS.datasetId, datasetId)
      
      return data.analysis_data
    } catch (error) {
      console.error('Failed to load dataset:', error)
      return null
    }
  }, [])

  // Delete a dataset
  const deleteDataset = useCallback(async (datasetId) => {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured')
      return false
    }

    try {
      const { error } = await supabase
        .from('linkedin_datasets')
        .delete()
        .eq('id', datasetId)

      if (error) throw error
      
      // If this was the current dataset, clear it
      const currentId = localStorage.getItem(STORAGE_KEYS.datasetId)
      if (currentId === datasetId) {
        clearData()
      }
      
      return true
    } catch (error) {
      console.error('Failed to delete dataset:', error)
      return false
    }
  }, [])

  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.data)
      localStorage.removeItem(STORAGE_KEYS.timestamp)
      localStorage.removeItem(STORAGE_KEYS.datasetId)
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
    loadDatasetsByAuthor,
    loadAllDatasets,
    loadDatasetById,
    deleteDataset,
    clearData,
    hasStoredData
  }
}
