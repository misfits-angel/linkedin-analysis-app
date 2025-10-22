// ============= CHART UTILITIES =============

// Import chart setup with plugins
import './chart-setup'

/**
 * Generate month labels for display
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

/**
 * Convert share object to donut chart format
 */
export function toDonut(shareObj = {}) {
  return Object.entries(shareObj).map(([name, frac]) => ({
    name, 
    value: Math.round((frac || 0) * 100)
  }))
}

/**
 * Ensure value is an array
 */
export function ensureArray(a) {
  return Array.isArray(a) ? a : []
}

/**
 * Generate posts per month chart configuration
 */
export function createPostsPerMonthChart(data) {
  const arr = data?.trends?.posts_per_month || {}
  
  const months = Object.keys(arr).sort()
  const values = months.map(month => arr[month] || 0)
  const labels = months.map(labelMonth)
  
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Posts',
          data: values,
          backgroundColor: 'rgba(21, 113, 135, 0.8)',
          borderColor: 'rgba(21, 113, 135, 1)',
          borderWidth: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        },
        datalabels: {
          display: true,
          color: '#374151',
          font: {
            weight: 'bold',
            size: 12
          },
          anchor: 'end',
          align: 'top',
          offset: 4
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  }
}

/**
 * Generate engagement over time chart configuration
 */
export function createEngagementOverTimeChart(data) {
  const arr = data?.trends?.month_median || {}
  
  const months = Object.keys(arr).sort()
  const values = months.map(month => arr[month] || 0)
  const labels = months.map(labelMonth)
  
  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Median Engagement',
          data: values,
          borderColor: 'rgba(99, 165, 179, 1)',
          backgroundColor: 'rgba(99, 165, 179, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        },
        datalabels: {
          display: true,
          color: '#374151',
          font: {
            weight: 'bold',
            size: 10
          },
          anchor: 'center',
          align: 'top',
          offset: 6,
          formatter: (value) => Math.round(value * 10) / 10
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  }
}

/**
 * Generate format mix chart configuration
 */
export function createFormatMixChart(data) {
  const donutData = toDonut(data?.mix?.type_share)
  
  const colors = [
    'rgba(21, 113, 135, 0.8)',   // brand
    'rgba(99, 165, 179, 0.8)',   // brand2
    'rgba(177, 217, 223, 0.8)',  // muted
    'rgba(32, 32, 34, 0.8)',     // ink
  ]
  
  // Calculate actual counts from percentages - derive from type_counts
  const typeCounts = data?.mix?.type_counts || {}
  const actualCounts = donutData.map(d => typeCounts[d.name] || 0)
  
  return {
    type: 'doughnut',
    data: {
      labels: donutData.map(d => d.name),
      datasets: [
        {
          data: donutData.map(d => d.value),
          backgroundColor: colors.slice(0, donutData.length),
          borderWidth: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
          }
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const index = context.dataIndex
              const count = actualCounts[index] || 0
              return `${label}: ${count}`
            }
          }
        },
        datalabels: {
          display: true,
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 12
          },
          formatter: (value) => value > 5 ? `${value}%` : ''
        }
      }
    }
  }
}

/**
 * Generate action mix chart configuration
 */
export function createActionMixChart(data) {
  const donutData = toDonut(data?.mix?.action_share_full_data)
  
  const colors = [
    'rgba(21, 113, 135, 0.8)',   // brand
    'rgba(99, 165, 179, 0.8)',   // brand2
  ]
  
  // Calculate actual counts - derive from action_counts (full dataset counts)
  const actionCounts = data?.mix?.action_counts_full_data || {}
  const actualCounts = donutData.map(d => {
    // Map display names back to action names
    const actionName = d.name === 'Post' ? 'Post' : d.name === 'Reshare' ? 'Reshare' : d.name
    return actionCounts[actionName] || 0
  })
  
  return {
    type: 'doughnut',
    data: {
      labels: donutData.map(d => d.name),
      datasets: [
        {
          data: donutData.map(d => d.value),
          backgroundColor: colors.slice(0, donutData.length),
          borderWidth: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
          }
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const index = context.dataIndex
              const count = actualCounts[index] || 0
              return `${label}: ${count}`
            }
          }
        },
        datalabels: {
          display: true,
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 12
          },
          formatter: (value) => value > 5 ? `${value}%` : ''
        }
      }
    }
  }
}

/**
 * Export chart as PNG
 */
export function exportChart(canvas, title) {
  try {
    // Create a temporary canvas with extra space for title
    const tempCanvas = document.createElement('canvas')
    const ctx = tempCanvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    // Set dimensions (add space for title)
    const titleHeight = 50
    const padding = 20
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height + titleHeight
    
    // Fill background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Draw title
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 18px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, tempCanvas.width / 2, 35)
    
    // Draw the chart
    ctx.drawImage(canvas, 0, titleHeight)
    
    // Download
    const link = document.createElement('a')
    const filename = title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`
    link.href = tempCanvas.toDataURL('image/png')
    link.click()
    
  } catch (error) {
    console.error('Failed to export chart:', error)
    alert('Failed to export chart: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}
