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
  
  // Get all months from the data
  const dataMonths = Object.keys(arr).sort()
  
  if (dataMonths.length === 0) {
    return {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Posts',
          data: [],
          backgroundColor: 'rgba(130, 175, 160, 0.8)',
          borderColor: 'rgba(90, 140, 130, 1)',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
          datalabels: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 3, // Show at least up to 3 on y-axis
            ticks: { 
              stepSize: 1,
              precision: 0
            }
          }
        }
      }
    }
  }
  
  // Create complete month range from first to last month
  const firstMonth = dataMonths[0]
  const lastMonth = dataMonths[dataMonths.length - 1]
  
  // Parse first and last months
  const [firstYear, firstMonthNum] = firstMonth.split('-').map(Number)
  const [lastYear, lastMonthNum] = lastMonth.split('-').map(Number)
  
  // Generate all months in the range
  const allMonths = []
  let currentYear = firstYear
  let currentMonth = firstMonthNum
  
  while (currentYear < lastYear || (currentYear === lastYear && currentMonth <= lastMonthNum)) {
    const monthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
    allMonths.push(monthKey)
    
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }
  
  // Create values array with 0 for months without data
  const values = allMonths.map(month => arr[month] || 0)
  const labels = allMonths.map(labelMonth)
  
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Posts',
          data: values,
          backgroundColor: 'rgba(130, 175, 160, 0.8)',
          borderColor: 'rgba(90, 140, 130, 1)',
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
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: Math.max(...values) + 2, // Always show 2 extra ticks above max value
          ticks: {
            stepSize: 1,
            precision: 0
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
  const medianData = data?.trends?.month_median || {}
  const totalData = data?.trends?.month_total || {}
  
  const months = Object.keys({...medianData, ...totalData}).sort()
  const medianValues = months.map(month => medianData[month] || 0)
  const totalValues = months.map(month => totalData[month] || 0)
  const labels = months.map(labelMonth)
  
  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Median Engagement',
          data: medianValues,
          borderColor: 'rgba(90, 140, 130, 1)',
          backgroundColor: 'rgba(90, 140, 130, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y',
          pointRadius: 0,
          pointHoverRadius: 0
        },
        {
          label: 'Total Engagement',
          data: totalValues,
          borderColor: 'rgba(160, 195, 180, 1)',
          backgroundColor: 'rgba(160, 195, 180, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y1',
          pointRadius: 0,
          pointHoverRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            font: {
              size: 11,
              weight: '400'
            },
            padding: 8,
            boxWidth: 8
          }
        },
        title: {
          display: false
        },
        datalabels: {
          display: false
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Median Engagement'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total Engagement'
          },
          grid: {
            drawOnChartArea: false,
          },
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
  
  // Sort data by percentage (highest first) for both chart and legend order
  const sortedData = [...donutData].sort((a, b) => b.value - a.value)
  
  const generateGreenShade = (index, totalItems) => {
    // Base color range (darkest to lightest) - same as PostTypeDistribution
    const baseColors = [
      { r: 90, g: 140, b: 130 },   // Very dark green
      { r: 130, g: 175, b: 160 },  // Dark green
      { r: 160, g: 195, b: 180 },  // Medium-dark green
      { r: 190, g: 215, b: 205 },  // Medium-light green
      { r: 220, g: 235, b: 225 },  // Light green
    ];

    // If we have more items than base colors, interpolate between them
    if (totalItems <= baseColors.length) {
      return `rgb(${baseColors[index].r}, ${baseColors[index].g}, ${baseColors[index].b})`;
    }

    // For more than 5 items, create a gradient from darkest to lightest
    const minR = baseColors[0].r;
    const maxR = baseColors[baseColors.length - 1].r;
    const minG = baseColors[0].g;
    const maxG = baseColors[baseColors.length - 1].g;
    const minB = baseColors[0].b;
    const maxB = baseColors[baseColors.length - 1].b;

    // Calculate position in gradient (0 = darkest, 1 = lightest)
    const position = totalItems > 1 ? index / (totalItems - 1) : 0;

    // Interpolate colors
    const r = Math.round(minR + (maxR - minR) * position);
    const g = Math.round(minG + (maxG - minG) * position);
    const b = Math.round(minB + (maxB - minB) * position);

    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Generate colors for sorted data (darker for higher percentages)
  const colors = sortedData.map((_, index) => generateGreenShade(index, sortedData.length))
  
  // Calculate actual counts from percentages - derive from type_counts
  const typeCounts = data?.mix?.type_counts || {}
  const actualCounts = sortedData.map(d => typeCounts[d.name] || 0)
  
  return {
    type: 'doughnut',
    data: {
      labels: sortedData.map(d => d.name), // Use sorted labels
      datasets: [
        {
          data: sortedData.map(d => d.value), // Use sorted data
          backgroundColor: colors,
          borderWidth: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '50%', // Smaller outer circle, bigger inner circle
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        }
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 8,
            usePointStyle: true,
            font: {
              size: 14
            }
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
          color: '#000000',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value) => {
            // Show all percentages, even small ones
            return `${value}%`;
          },
          anchor: 'center',
          align: 'center'
        }
      }
    }
  }
}

/**
 * Generate action mix chart configuration (Post vs Reshare Chart)
 * 
 * CRITICAL: This is the ONLY chart that uses ALL posts including reshares.
 * This chart specifically shows the split between original posts and reshared content.
 * All other analysis in the app uses ONLY original posts (excluding reshares).
 */
export function createActionMixChart(data) {
  const donutData = toDonut(data?.mix?.action_share)
  
  // Sort data by percentage (highest first) for both chart and legend order - same as Format Mix
  const sortedData = [...donutData].sort((a, b) => b.value - a.value)
  
  // Use the same green color scheme as format mix
  const generateGreenShade = (index, totalItems) => {
    // Base color range (darkest to lightest) - same as PostTypeDistribution
    const baseColors = [
      { r: 90, g: 140, b: 130 },   // Very dark green
      { r: 130, g: 175, b: 160 },  // Dark green
      { r: 160, g: 195, b: 180 },  // Medium-dark green
      { r: 190, g: 215, b: 205 },  // Medium-light green
      { r: 220, g: 235, b: 225 },  // Light green
    ];

    // If we have more items than base colors, interpolate between them
    if (totalItems <= baseColors.length) {
      return `rgb(${baseColors[index].r}, ${baseColors[index].g}, ${baseColors[index].b})`;
    }

    // For more than 5 items, create a gradient from darkest to lightest
    const minR = baseColors[0].r;
    const maxR = baseColors[baseColors.length - 1].r;
    const minG = baseColors[0].g;
    const maxG = baseColors[baseColors.length - 1].g;
    const minB = baseColors[0].b;
    const maxB = baseColors[baseColors.length - 1].b;

    // Calculate position in gradient (0 = darkest, 1 = lightest)
    const position = totalItems > 1 ? index / (totalItems - 1) : 0;

    // Interpolate colors
    const r = Math.round(minR + (maxR - minR) * position);
    const g = Math.round(minG + (maxG - minG) * position);
    const b = Math.round(minB + (maxB - minB) * position);

    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Generate colors for sorted data (darker for higher percentages) - same as Format Mix
  const colors = sortedData.map((_, index) => generateGreenShade(index, sortedData.length))
  
  // Calculate actual counts - derive from action_counts (original posts only)
  const actionCounts = data?.mix?.action_counts || {}
  const actualCounts = sortedData.map(d => {
    // Map display names back to action names
    const actionName = d.name
    return actionCounts[actionName] || 0
  })
  
  return {
    type: 'doughnut',
    data: {
      labels: sortedData.map(d => d.name), // Use sorted labels - same as Format Mix
      datasets: [
        {
          data: sortedData.map(d => d.value), // Use sorted data - same as Format Mix
          backgroundColor: colors,
          borderWidth: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '50%', // Smaller outer circle, bigger inner circle - same as Format Mix
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        }
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 8,
            usePointStyle: true,
            font: {
              size: 14
            }
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
          color: '#000000',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value) => {
            // Show all percentages, even small ones - same as Format Mix
            return `${value}%`;
          },
          anchor: 'center',
          align: 'center'
        }
      }
    }
  }
}

/**
 * Export chart as ultra-high-resolution PNG
 */
export function exportChart(canvas, title, chartInstance = null) {
  try {
    // Ultra-high-resolution scaling factors
    const devicePixelRatio = window.devicePixelRatio || 1
    const exportScale = Math.max(4, devicePixelRatio * 2) // Minimum 4x scaling, 2x device ratio if higher
    const titleHeight = 100 * exportScale // Larger scaled title height
    const padding = 50 * exportScale // Larger scaled padding
    
    // Create ultra-high-resolution temporary canvas
    const tempCanvas = document.createElement('canvas')
    const ctx = tempCanvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    // Set ultra-high-resolution dimensions
    tempCanvas.width = canvas.width * exportScale
    tempCanvas.height = (canvas.height * exportScale) + titleHeight
    
    // Enable maximum quality rendering settings
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // Enable subpixel rendering for better text quality
    ctx.textRenderingOptimization = 'optimizeQuality'
    ctx.textBaseline = 'alphabetic'
    
    // Fill background with ultra-high quality
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Draw ultra-high-resolution title with better font rendering
    ctx.fillStyle = '#111827'
    ctx.font = `bold ${24 * exportScale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 2 * exportScale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 1 * exportScale
    
    ctx.fillText(title, tempCanvas.width / 2, titleHeight / 2)
    
    // Reset shadow for chart rendering
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Handle chart rendering with ultra-high resolution
    if (chartInstance && title.toLowerCase().includes('engagement')) {
      const originalConfig = chartInstance.config
      const originalDatasets = originalConfig.data.datasets
      
      // Filter out hidden datasets based on legend visibility
      const visibleDatasets = originalDatasets.filter((dataset, index) => {
        const legendItem = chartInstance.legend?.legendItems?.[index]
        return legendItem && !legendItem.hidden
      })
      
      // Temporarily update the chart to only show visible datasets
      if (visibleDatasets.length < originalDatasets.length) {
        originalConfig.data.datasets = visibleDatasets
        chartInstance.update('none') // Update without animation
        
        // Draw the chart with ultra-high resolution and better interpolation
        ctx.drawImage(canvas, 0, titleHeight, tempCanvas.width, canvas.height * exportScale)
        
        // Restore original datasets
        originalConfig.data.datasets = originalDatasets
        chartInstance.update('none') // Update without animation
      } else {
        // Draw the chart normally with ultra-high resolution
        ctx.drawImage(canvas, 0, titleHeight, tempCanvas.width, canvas.height * exportScale)
      }
    } else {
      // Draw the chart normally with ultra-high resolution
      ctx.drawImage(canvas, 0, titleHeight, tempCanvas.width, canvas.height * exportScale)
    }
    
    // Download ultra-high-resolution PNG
    const link = document.createElement('a')
    const filename = title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`
    
    // Export with maximum quality (no compression for PNG)
    link.href = tempCanvas.toDataURL('image/png', 1.0)
    link.click()
    
  } catch (error) {
    console.error('Failed to export chart:', error)
    alert('Failed to export chart: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}
