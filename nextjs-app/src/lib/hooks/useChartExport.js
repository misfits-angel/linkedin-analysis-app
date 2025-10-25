'use client'

import { useCallback } from 'react'

/**
 * Unified chart export hook
 * Provides consistent export functionality for all chart types
 */
export function useChartExport() {
  /**
   * Export a canvas element as high-resolution PNG
   * @param {HTMLCanvasElement} canvas - The canvas element to export
   * @param {string} title - Title for the exported file
   * @param {Chart} chartInstance - Optional Chart.js instance for additional context
   */
  const exportChart = useCallback(async (canvas, title, chartInstance = null) => {
    if (!canvas) {
      console.error('No canvas element provided for export')
      return
    }

    try {
      const { exportChart: chartExportUtil } = await import('@/lib/chart-utils')
      await chartExportUtil(canvas, title, chartInstance)
    } catch (error) {
      console.error('Chart export failed:', error)
      throw error
    }
  }, [])

  /**
   * Export a DOM element (including non-canvas charts) as PNG
   * @param {HTMLElement} element - The DOM element to export
   * @param {string} filename - Filename for the export (without extension)
   */
  const exportElementAsPNG = useCallback(async (element, filename) => {
    if (!element) {
      console.error('No element provided for PNG export')
      return
    }

    try {
      const { exportElementAsPNG: exportUtil } = await import('@/lib/visual-export-utils')
      await exportUtil(element, filename)
    } catch (error) {
      console.error('PNG export failed:', error)
      throw error
    }
  }, [])

  /**
   * Generate clean filename from card name
   * @param {string} cardName - The card name to clean
   * @returns {string} Clean filename
   */
  const getCleanFilename = useCallback((cardName) => {
    if (!cardName) return 'chart-export'
    
    return cardName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  /**
   * Get timestamp for filename
   * @returns {string} Timestamp in format YYYYMMDD-HHMMSS
   */
  const getTimestamp = useCallback(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    return `${year}${month}${day}-${hours}${minutes}${seconds}`
  }, [])

  /**
   * Export with automatic filename generation
   * @param {HTMLElement|HTMLCanvasElement} elementOrCanvas - Element to export
   * @param {string} title - Title for the export
   * @param {Chart} chartInstance - Optional Chart.js instance
   */
  const exportWithAutoFilename = useCallback(async (elementOrCanvas, title, chartInstance = null) => {
    const cleanName = getCleanFilename(title)
    const timestamp = getTimestamp()
    const filename = `${cleanName}-${timestamp}`

    try {
      if (elementOrCanvas instanceof HTMLCanvasElement && chartInstance) {
        // Canvas with Chart.js instance
        await exportChart(elementOrCanvas, title, chartInstance)
      } else {
        // Generic DOM element
        await exportElementAsPNG(elementOrCanvas, filename)
      }
    } catch (error) {
      console.error('Auto-filename export failed:', error)
      throw error
    }
  }, [exportChart, exportElementAsPNG, getCleanFilename, getTimestamp])

  return {
    exportChart,
    exportElementAsPNG,
    exportWithAutoFilename,
    getCleanFilename,
    getTimestamp
  }
}

/**
 * Hook for exporting a specific chart ref
 * @param {React.RefObject} chartRef - Ref to chart component
 * @param {string} title - Chart title
 */
export function useChartRefExport(chartRef, title) {
  const { exportChart } = useChartExport()

  const handleExport = useCallback(() => {
    if (chartRef.current) {
      if (typeof chartRef.current.exportChart === 'function') {
        // Component has its own export method
        chartRef.current.exportChart()
      } else if (chartRef.current.getCanvas) {
        // Component provides canvas getter
        const canvas = chartRef.current.getCanvas()
        exportChart(canvas, title)
      } else {
        console.warn('Chart ref does not have exportChart method or getCanvas method')
      }
    }
  }, [chartRef, title, exportChart])

  return { handleExport }
}

/**
 * Hook for exporting DOM elements
 * @param {React.RefObject} elementRef - Ref to DOM element
 * @param {string} name - Element name for filename
 */
export function useElementExport(elementRef, name) {
  const { exportWithAutoFilename } = useChartExport()

  const handleExport = useCallback(async () => {
    if (elementRef.current) {
      try {
        await exportWithAutoFilename(elementRef.current, name)
      } catch (error) {
        console.error(`Failed to export ${name}:`, error)
      }
    }
  }, [elementRef, name, exportWithAutoFilename])

  return { handleExport }
}

