// ============= STATISTICS UTILITIES =============

/**
 * Calculate median of array
 */
export function median(arr) {
  if (!arr || arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

/**
 * Calculate percentile of array
 */
export function percentile(arr, p) {
  if (!arr || arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

/**
 * Calculate mean of array
 */
export function mean(arr) {
  if (!arr || arr.length === 0) return 0
  const sum = arr.reduce((a, b) => a + b, 0)
  return Math.round(sum / arr.length)
}

/**
 * Ensure value is an array
 */
export function ensureArray(a) {
  return Array.isArray(a) ? a : []
}

/**
 * Clip string to specified length
 */
export function clip(s, n = 120) {
  if (!s) return ''
  s = String(s)
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

/**
 * Convert share object to donut chart format
 */
export function toDonut(shareObj = {}) {
  return Object.entries(shareObj).map(([name, frac]) => ({
    name, 
    value: Math.round((frac || 0) * 100)
  }))
}

