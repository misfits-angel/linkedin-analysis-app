'use client'

import { useMemo } from 'react'
import Chart from './Chart'
import { ChartConfiguration } from 'chart.js'

// Import chart setup with plugins
import '@/lib/chart-setup'

interface InsightChartProps {
  data: any
  type: 'topics' | 'positioning' | 'evaluation'
  title: string
}

export default function InsightChart({ data, type, title }: InsightChartProps) {
  const chartConfig = useMemo((): ChartConfiguration | null => {
    if (!data) return null

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false,
        },
        datalabels: {
          display: true,
          color: '#374151',
          font: {
            weight: 'bold' as const,
            size: 12
          },
          anchor: 'end' as const,
          align: 'top' as const,
          offset: 4
        }
      },
    }

    switch (type) {
      case 'topics':
        if (!data.topics) return null
        return {
          type: 'bar',
          data: {
            labels: data.topics.slice(0, 5).map((topic: any) => topic.topic),
            datasets: [
              {
                label: 'Posts',
                data: data.topics.slice(0, 5).map((topic: any) => topic.frequency),
                backgroundColor: [
                  'rgba(102, 126, 234, 0.8)',
                  'rgba(118, 75, 162, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                ],
                borderColor: [
                  'rgba(102, 126, 234, 1)',
                  'rgba(118, 75, 162, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(16, 185, 129, 1)',
                  'rgba(245, 158, 11, 1)',
                ],
                borderWidth: 2,
              },
            ],
          },
          options: baseOptions,
        }

      case 'positioning':
        // No chart needed for positioning analysis - only show current positioning
        return null

      case 'evaluation':
        if (!data.rubric_breakdown) return null
        return {
          type: 'radar',
          data: {
            labels: [
              'Depth & Originality',
              'Hook Effectiveness',
              'Evidence & Examples',
              'Actionability',
              'Conclusion Strength',
              'Personal Story',
              'Emotional Resonance',
            ],
            datasets: [
              {
                label: 'Score',
                data: [
                  data.rubric_breakdown.depth_originality,
                  data.rubric_breakdown.hook_effectiveness,
                  data.rubric_breakdown.evidence_examples,
                  data.rubric_breakdown.actionability,
                  data.rubric_breakdown.conclusion_strength,
                  data.rubric_breakdown.personal_story,
                  data.rubric_breakdown.emotional_resonance,
                ],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
              },
            ],
          },
          options: {
            ...baseOptions,
            plugins: {
              ...baseOptions.plugins,
              datalabels: {
                display: true,
                color: '#374151',
                font: {
                  weight: 'bold' as const,
                  size: 10
                },
                anchor: 'center' as const,
                align: 'top' as const,
                offset: 6,
                formatter: (value: number) => Math.round(value * 10) / 10
              }
            },
          },
        }

      default:
        return null
    }
  }, [data, type])

  if (!chartConfig) return null

  return (
    <div className="chart-wrap" style={{ height: '300px', marginTop: '1rem' }}>
      <Chart config={chartConfig} title={title} />
    </div>
  )
}
