'use client'

import Card, { CardContent } from '@/components/CardWithName'

/**
 * PostTypeDistributionCard with weighted column layout based on percentage distribution
 * data: [{ type: 'Text', desc: 'Pure text updates', value: 58, color: '#D6E3DD' }, ...]
 * options:
 *  - columns: 1 | 2 | 'auto'  default 'auto'
 *  - preferOneColumnForThree: boolean  default false
 *  - minH: px min tile height  default 120
 *  - maxH: px cap tile height  default 420
 *  - unit: px per percent  default 6  -> height = clamp(minH, value*unit, maxH)
 */
export default function PostTypeDistributionCard({
  data = [],
  options = { columns: 'auto', preferOneColumnForThree: false, minH: 120, maxH: 420, unit: 6 },
  cardName = 'Post Type Distribution Card'
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value)

  const decideColumns = () => {
    if (options.columns === 1 || options.columns === 2) return options.columns
    const n = sorted.length
    if (n <= 2) return 1
    if (n === 3) return options.preferOneColumnForThree ? 1 : 2
    return 2
  }

  const cols = decideColumns()

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))
  const minH = options.minH ?? 0 // No minimum height by default
  const maxH = options.maxH ?? 420
  const unit = options.unit ?? 6

  // Determine layout strategy based on percentage distribution
  const getLayoutStrategy = () => {
    if (cols === 1) return { type: 'single' };

    // Always use weighted columns - first column gets highest percentage item
    // Width is proportional to actual percentage value (no hardcoded constraints)
    return {
      type: 'weighted'
    };
  }

  const layoutStrategy = getLayoutStrategy()

  // Generate colors based on percentage ranking (darker for higher %)
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


  // Render individual card
  const renderCard = (item, index, customHeight = null) => {
    const h = customHeight !== null ? customHeight : clamp((item.value || 0) * unit, minH, maxH)
    
    // Dynamic font sizing based on percentage value and rectangle height
    // Percentage font size is proportional to the actual percentage
    // Range: 14px (small %) to 42px (large %)
    const minPercentageFontSize = 14
    const maxPercentageFontSize = 42
    let percentageFontSize = minPercentageFontSize + ((item.value / 100) * (maxPercentageFontSize - minPercentageFontSize))
    
    // Type font size is also proportional but smaller range
    // Range: 9px (small %) to 16px (large %)
    const minTypeFontSize = 9
    const maxTypeFontSize = 16
    let typeFontSize = minTypeFontSize + ((item.value / 100) * (maxTypeFontSize - minTypeFontSize))
    
    // Further reduce font sizes if rectangle is very small
    if (h < 60) {
      percentageFontSize = Math.min(percentageFontSize, 14)
      typeFontSize = Math.min(typeFontSize, 9)
    } else if (h < 100) {
      percentageFontSize = Math.min(percentageFontSize, 20)
      typeFontSize = Math.min(typeFontSize, 11)
    }
    
    return (
      <Card
        key={index}
        cardName={`${cardName} - ${item.type}`}
        className={`rounded-tl-3xl rounded-tr-3xl rounded-br-3xl border-0 shadow-none`}
        style={{
          backgroundColor: generateGreenShade(index, sorted.length),
          height: h
          // Removed aspectRatio to allow proper height scaling
        }}
      >
        <CardContent className="p-2 flex flex-col justify-between h-full overflow-hidden" style={{ padding: '8px' }}>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold leading-tight overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: `${typeFontSize}px` }}>{item.type}</p>
            {/* Remove description text completely */}
          </div>
          <div className="self-end overflow-hidden">
            <p className="whitespace-nowrap" style={{ fontSize: `${percentageFontSize}px` }}>{item.value}%</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render based on layout strategy
  if (layoutStrategy.type === 'weighted') {
    // CORRECT LOGIC:
    // 1. First column: width = highest percentage, height = 100% (400px)
    // 2. Second column: width = remaining percentage, height = 100% (400px)
    // 3. Second column is divided vertically - each item gets height proportional to its percentage
    
    const containerHeight = 400
    
    // Get the highest percentage item (first column)
    const highestItem = sorted[0]
    const highestPercentage = highestItem.value
    
    // First column gets FULL height
    const firstColumnHeight = containerHeight
    
    // First column width is proportional to its percentage
    const firstColumnWidthPercent = highestPercentage
    const remainingWidthPercent = 100 - highestPercentage
    
    // Get remaining items (second column)
    const remainingItems = sorted.slice(1)
    
    // Calculate total percentage of remaining items
    const remainingTotalPercentage = remainingItems.reduce((sum, item) => sum + item.value, 0)
    
    // Calculate height for each remaining item
    // The entire 400px height is divided proportionally among remaining items
    const remainingItemHeights = remainingItems.map(item => {
      // Each item gets height proportional to its percentage of the remaining total
      const itemShare = item.value / remainingTotalPercentage
      const itemHeight = containerHeight * itemShare
      return itemHeight
    })

    return (
      <div className="flex gap-0" style={{ height: '400px' }}>
        {/* First Column - Highest percentage item, FULL HEIGHT */}
        <div className="flex flex-col gap-0" style={{ width: `${firstColumnWidthPercent}%` }}>
          {renderCard(highestItem, 0, firstColumnHeight)}
        </div>

        {/* Second Column - Remaining items stacked vertically, FULL HEIGHT total */}
        <div className="flex flex-col gap-0" style={{ width: `${remainingWidthPercent}%` }}>
          {remainingItems.map((item, i) => {
            const itemHeight = remainingItemHeights[i]
            return renderCard(item, i + 1, itemHeight)
          })}
        </div>
      </div>
    )
  }

  // Balanced masonry layout
  return (
    <div className="columns-2 gap-0 [column-fill:_balance]">
      {sorted.map((item, i) => renderCard(item, i))}
    </div>
  )
}
