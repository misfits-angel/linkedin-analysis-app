'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { ChartJS } from '@/lib/chart-setup'

const Chart = forwardRef(({ config, title, className = '', showHeaderButton = false, noBorder = false }, ref) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useImperativeHandle(ref, () => ({
    exportChart: () => {
      if (canvasRef.current) {
        // Import the export function dynamically to avoid SSR issues
        import('@/lib/chart-utils').then(({ exportChart }) => {
          exportChart(canvasRef.current, title, chartRef.current)
        })
      }
    },
    getCanvas: () => canvasRef.current
  }))

  useEffect(() => {
    if (!canvasRef.current) return

    // Destroy existing chart first
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    // Wait for next tick to ensure canvas is ready
    const timer = setTimeout(() => {
      if (!canvasRef.current) return

      try {
        // Set up high-resolution canvas for display
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const devicePixelRatio = window.devicePixelRatio || 1
        
        // Set canvas size for high DPI displays
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * devicePixelRatio
        canvas.height = rect.height * devicePixelRatio
        
        // Scale the context to match device pixel ratio
        ctx.scale(devicePixelRatio, devicePixelRatio)
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Set CSS size to maintain visual size
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'

        // Build final chart config
        const finalConfig = {
          ...config,
          options: {
            ...config.options,
            responsive: true,
            maintainAspectRatio: false,
            // Normal display settings
            animation: {
              duration: 750
            },
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              // Start with base config plugins
              ...config.options?.plugins,
              // Override specific plugin settings (but preserve datalabels from above spread)
              legend: {
                ...config.options?.plugins?.legend,
                labels: {
                  ...config.options?.plugins?.legend?.labels,
                  usePointStyle: true,
                  font: {
                    ...config.options?.plugins?.legend?.labels?.font,
                    size: 11,
                    weight: '400'
                  },
                  padding: 8,
                  boxWidth: 8
                }
              },
              tooltip: {
                ...config.options?.plugins?.tooltip,
                titleFont: {
                  size: 12,
                  weight: '600'
                },
                bodyFont: {
                  size: 11,
                  weight: '400'
                },
                padding: 8
              },
              // Explicitly ensure datalabels config is preserved (comes after spread to override)
              ...(config.options?.plugins?.datalabels && {
                datalabels: config.options.plugins.datalabels
              })
            },
            elements: {
              ...config.options?.elements,
              point: {
                ...config.options?.elements?.point,
                radius: 2,
                hoverRadius: 4,
                borderWidth: 1
              },
              line: {
                ...config.options?.elements?.line,
                borderWidth: 1.5,
                tension: 0.4
              },
              bar: {
                ...config.options?.elements?.bar,
                borderWidth: 0.5
              }
            }
          }
        }

        // Create new chart with final configuration
        chartRef.current = new ChartJS(canvas, finalConfig)
      } catch (error) {
        console.error(`Chart failed to render:`, error)
      }
    }, 100)

    // Cleanup on unmount
    return () => {
      clearTimeout(timer)
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [config, title])

  const handleExport = () => {
    if (canvasRef.current) {
      import('@/lib/chart-utils').then(({ exportChart }) => {
        exportChart(canvasRef.current, title, chartRef.current)
      })
    }
  }

  const wrapperClass = noBorder 
    ? `${className}` 
    : `chart-wrap ${className}`

  if (!showHeaderButton) {
    return (
      <div className={wrapperClass} style={noBorder ? { height: '300px', position: 'relative' } : {}}>
        <canvas 
          ref={canvasRef}
          role="img" 
          aria-label={`Chart: ${title}`}
        />
      </div>
    )
  }

  return (
    <div className={wrapperClass} style={noBorder ? { height: '300px', position: 'relative' } : {}}>
      <button 
        className="chart-export-btn" 
        onClick={handleExport}
        title="Export as High-Resolution PNG"
      >
        📥
      </button>
      <canvas 
        ref={canvasRef}
        role="img" 
        aria-label={`Chart: ${title}`}
      />
    </div>
  )
})

Chart.displayName = 'Chart'

export default Chart
