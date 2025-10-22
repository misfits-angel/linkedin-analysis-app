'use client'

import Card, { CardContent } from '@/components/CardWithName'

/**
 * data: [{ type: 'Text', value: 58, color: '#D6E3DD' }, ...]
 * options:
 *  - minH: px min tile height  default 120
 *  - maxH: px cap tile height  default 420
 *  - unit: px per percent  default 6  -> height = clamp(minH, value*unit, maxH)
 */
export default function PostTypeMosaic({
  data = [],
  options = { minH: 120, maxH: 420, unit: 6 },
  cardName = 'Post Type Mosaic'
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value)

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))
  const minH = options.minH ?? 120
  const maxH = options.maxH ?? 420
  const unit = options.unit ?? 6

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

  // Layout with equal width for all cards
  const Wrapper = ({ children }) => (
    <div className="flex flex-wrap gap-0">{children}</div>
  )

  return (
    <Wrapper>
      {sorted.map((item, i) => {
        const h = clamp((item.value || 0) * unit, minH, maxH)
        return (
          <Card
            key={i}
            cardName={`${cardName} - ${item.type}`}
            className="rounded-tl-3xl rounded-tr-3xl rounded-br-3xl border-0 shadow-none flex-1"
            style={{
              backgroundColor: generateGreenShade(i, sorted.length), // Use index and total count for color ranking
              height: h,
              minWidth: '120px' // Ensure minimum width for readability
            }}
          >
            <CardContent className="p-3 flex items-center justify-between h-full" style={{ padding: '12px' }}>
              <div className="flex-1">
                <p className="font-bold text-lg leading-tight">{item.type}</p>
              </div>
              <div className="ml-4">
                <p className="text-5xl">{item.value}%</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </Wrapper>
  )
}
