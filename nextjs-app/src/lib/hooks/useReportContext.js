'use client'

import { useContext } from 'react'
import { UIPreferencesContext } from '@/lib/contexts/UIPreferencesContext'

/**
 * Hook to detect if we're in a report context (vs dashboard context)
 * Returns true if we're in a report context where download buttons should be hidden
 */
export function useReportContext() {
  try {
    const context = useContext(UIPreferencesContext)
    // If we can access UIPreferencesContext, we're in the dashboard
    // If we can't access it, we're likely in a report context
    return context === undefined
  } catch (error) {
    // If there's an error accessing the context, we're in a report context
    return true
  }
}
