'use client'

import { useRef } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { exportElementAsPNG, getCleanFilename, getTimestamp } from '@/lib/visual-export-utils'

/**
 * Horizontal Stacked Bar Chart for Post Type Distribution
 * data: [{ type: 'Text', value: 58, color: '#D6E3DD' }, ...]
 */
export default function PostTypeDistribution({
  data = [],
  cardName = 'Post Type Distribution'
}) {
  const containerRef = useRef(null)
  const sorted = [...data].sort((a, b) => b.value - a.value)

  const handleExport = async () => {
    if (!containerRef.current) {
      console.error('No element reference provided for PNG export')
      return
    }

    try {
      const cleanName = getCleanFilename(cardName)
      const timestamp = getTimestamp()
      const filename = `${cleanName}-${timestamp}`
      
      await exportElementAsPNG(containerRef.current, filename)
    } catch (error) {
      console.error('PNG export failed:', error)
    }
  }

  // Generate colors based on percentage ranking (darker for higher %)
  // Using the exact same color logic as PostTypeDistributionCard
  const generateGreenShade = (index, totalItems) => {
    // Base color range (darkest to lightest)
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

  const renderVisualContent = () => (
    <div className="flex justify-center">
      {/* Vertical Stacked Bar with labels on the right */}
      <div className="flex items-center gap-4">
        {/* Vertical Stacked Bar */}
        <div className="w-32 h-80 flex flex-col rounded-lg overflow-hidden shadow-sm">
          {sorted.map((item, i) => (
            <div
              key={i}
              className="relative flex items-center justify-center transition-all hover:brightness-110"
              style={{
                height: `${item.value}%`,
                backgroundColor: generateGreenShade(i, sorted.length),
                minHeight: item.value < 1 ? '20px' : 'auto'
              }}
              title={`${item.type}: ${item.value}%`}
            >
              {/* Show text labels for segments large enough */}
              {item.value >= 5 && (
                <div className="text-white text-center leading-tight">
                  <span className={
                    item.value < 5 ? 'text-xs' : 
                    item.value < 10 ? 'text-xs' : 
                    'text-sm'
                  } style={{ fontSize: item.value < 8 ? '8px' : undefined }}>{item.type}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Labels grouped together */}
        <div className="space-y-2">
          {sorted.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded flex-shrink-0"
                style={{ backgroundColor: generateGreenShade(i, sorted.length) }}
              />
              <span className="text-sm font-medium text-gray-700">{item.type}</span>
              <span className="text-sm font-bold text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Card cardName={cardName}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">📊 Post Type Distribution</CardTitle>
        <button 
          className="chart-export-btn" 
          onClick={handleExport}
          title="Export as High-Resolution PNG"
        >
          📥
        </button>
      </CardHeader>
      <CardContent>
        <div ref={containerRef}>
          {renderVisualContent()}
        </div>
      </CardContent>
    </Card>
  )
}
