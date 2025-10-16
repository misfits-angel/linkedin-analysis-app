'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { ChartConfiguration } from 'chart.js'
import { ChartJS } from '@/lib/chart-setup'

export interface ChartProps {
  config: ChartConfiguration
  title: string
  className?: string
}

export interface ChartRef {
  exportChart: () => void
  getCanvas: () => HTMLCanvasElement | null
}

const Chart = forwardRef<ChartRef, ChartProps>(({ config, title, className = '' }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    exportChart: () => {
      if (canvasRef.current) {
        // Import the export function dynamically to avoid SSR issues
        import('@/lib/chart-utils').then(({ exportChart }) => {
          exportChart(canvasRef.current!, title)
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
        // Create new chart with proper configuration
        chartRef.current = new ChartJS(canvasRef.current, {
          ...config,
          options: {
            ...config.options,
            responsive: true,
            maintainAspectRatio: false,
          }
        })
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
        exportChart(canvasRef.current!, title)
      })
    }
  }

  return (
    <div className={`chart-wrap ${className}`}>
      <button 
        className="chart-export-btn" 
        onClick={handleExport}
        title="Export as PNG"
      >
        📥 PNG
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
