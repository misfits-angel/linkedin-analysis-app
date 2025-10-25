// ============= DATE UTILITIES =============

/**
 * Parse date from various formats including relative dates
 */
export function parseCSVDate(dateStr) {
  if (!dateStr) return null
  
  // Handle relative dates (e.g., "1w", "2w", "1mo", "3d")
  const relativeMatch = dateStr.match(/^(\d+)(w|d|mo|h|m|y)$/)
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1])
    const unit = relativeMatch[2]
    const now = new Date()
    
    switch(unit) {
      case 'h': // hours
        return new Date(now.getTime() - value * 60 * 60 * 1000)
      case 'd': // days
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000)
      case 'w': // weeks
        return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000)
      case 'mo': // months (approximate)
        return new Date(now.getFullYear(), now.getMonth() - value, now.getDate())
      case 'm': // minutes
        return new Date(now.getTime() - value * 60 * 1000)
      case 'y': // years
        return new Date(now.getFullYear() - value, now.getMonth(), now.getDate())
    }
  }
  
  // Try ISO format
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) return date
  
  // Try other formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
  ]
  
  for (const regex of formats) {
    const match = dateStr.match(regex)
    if (match) {
      date = new Date(match[0])
      if (!isNaN(date.getTime())) return date
    }
  }
  
  return null
}

/**
 * Get month key in YYYY-MM format
 */
export function getMonthKey(date) {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get day of week name
 */
export function getDayOfWeek(date) {
  if (!date) return null
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

/**
 * Generate months array for a given period
 * @param {number} monthsBack - Number of months to go back (default: 12)
 * @param {Date} endDate - End date for the period (default: now)
 */
export function generateMonthsArray(monthsBack = 12, endDate = new Date()) {
  const months = []
  
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }
  
  return months
}

/**
 * Generate last 12 months array (backward compatibility)
 */
export function generateLast12Months() {
  return generateMonthsArray(12)
}

/**
 * Format month label for display
 */
export function labelMonth(m) {
  if (!m) return ''
  if (/^\d{4}-\d{2}$/.test(m)) {
    const [y, mm] = m.split('-')
    const d = new Date(Number(y), Number(mm) - 1, 1)
    return d.toLocaleString('en-US', { month: 'short' }) + " '" + String(y).slice(-2)
  }
  if (/^\d{2}$/.test(m)) {
    const d = new Date(2000, Number(m) - 1, 1)
    return d.toLocaleString('en-US', { month: 'short' })
  }
  return m
}

