'use client'

/**
 * Utility functions for exporting visual components as PNG and CSV
 */

/**
 * Export a DOM element as high-resolution PNG
 * @param {HTMLElement} element - The DOM element to export
 * @param {string} filename - The filename for the download
 * @param {Object} options - Export options
 */
export async function exportElementAsPNG(element, filename, options = {}) {
  try {
    if (typeof window === 'undefined') {
      throw new Error('PNG export is only available on the client side')
    }

    // Dynamic import to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default

    const defaultOptions = {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight
    }

    const canvas = await html2canvas(element, { ...defaultOptions, ...options })
    
    // Create download link
    const link = document.createElement('a')
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log(`PNG exported: ${filename}`)
    return true
  } catch (error) {
    console.error('Error exporting PNG:', error)
    throw error
  }
}


/**
 * Get a clean filename from a card name
 * @param {string} cardName - The card name to clean
 * @returns {string} - Clean filename
 */
export function getCleanFilename(cardName) {
  if (!cardName) return 'export'
  
  return cardName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate timestamp for filename
 * @returns {string} - Timestamp string
 */
export function getTimestamp() {
  const now = new Date()
  return now.toISOString().split('T')[0] // YYYY-MM-DD format
}
