'use client'

import Card, { CardContent } from '@/components/CardWithName'

/**
 * PostTypeMosaic with weighted column layout based on percentage distribution
 * data: [{ type: 'Text', desc: 'Pure text updates', value: 58, color: '#D6E3DD' }, ...]
 * options:
 *  - columns: 1 | 2 | 'auto'  default 'auto'
 *  - preferOneColumnForThree: boolean  default false
 *  - minH: px min tile height  default 120
 *  - maxH: px cap tile height  default 420
 *  - unit: px per percent  default 6  -> height = clamp(minH, value*unit, maxH)
 */
export default function PostTypeMosaicWeighted({
  data = [],
  options = { columns: 'auto', preferOneColumnForThree: false, minH: 120, maxH: 420, unit: 6 },
  cardName = 'Post Type Mosaic Weighted'
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
  const minH = options.minH ?? 120
  const maxH = options.maxH ?? 420
  const unit = options.unit ?? 6

  // Determine layout strategy based on percentage distribution
  const getLayoutStrategy = () => {
    if (cols === 1) return { type: 'single' };

    const sortedItems = [...sorted];
    const highestPercentage = sortedItems[0]?.value || 0;

    // If highest percentage is significantly larger (>= 60%), use weighted columns
    if (highestPercentage >= 60) {
      return {
        type: 'weighted',
        column1Items: [sortedItems[0]], // Highest percentage item
        column2Items: sortedItems.slice(1), // Remaining items
        column1Width: '60%', // Wider column for dominant item
        column2Width: '40%'  // Narrower column for others
      };
    }

    // Otherwise use balanced masonry layout
    return {
      type: 'balanced',
      column1Items: sortedItems.filter((_, i) => i % 2 === 0),
      column2Items: sortedItems.filter((_, i) => i % 2 === 1),
      column1Width: '50%',
      column2Width: '50%'
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

  // Layout with weighted columns
  const Wrapper = ({ children }) => {
    if (cols === 1) {
      return <div className="flex flex-col gap-0">{children}</div>;
    }

    if (layoutStrategy.type === 'weighted') {
      const column1Children = layoutStrategy.column1Items.map(item =>
        children.find(child => child.props.item === item)
      ).filter(Boolean);

      const column2Children = layoutStrategy.column2Items.map(item =>
        children.find(child => child.props.item === item)
      ).filter(Boolean);

      return (
        <div className="flex gap-0 h-full">
          {/* Column 1 - Dominant item */}
          <div
            className="flex flex-col gap-0"
            style={{ width: layoutStrategy.column1Width }}
          >
            {column1Children}
          </div>

          {/* Column 2 - Remaining items */}
          <div
            className="flex flex-col gap-0"
            style={{ width: layoutStrategy.column2Width }}
          >
            {column2Children}
          </div>
        </div>
      );
    }

    // Balanced masonry layout
    return (
      <div className="columns-2 gap-0 [column-fill:_balance]">{children}</div>
    );
  }

  return (
    <Wrapper>
      {sorted.map((item, i) => {
        const h = clamp((item.value || 0) * unit, minH, maxH)
        return (
          <Card
            key={i}
            cardName={`${cardName} - ${item.type}`}
            className={`rounded-tl-3xl rounded-tr-3xl rounded-br-3xl border-0 shadow-none ${
              cols === 2 ? 'break-inside-avoid' : ''
            }`}
            style={{
              backgroundColor: generateGreenShade(i, sorted.length),
              height: h,
              aspectRatio: '1' // Force square aspect ratio
            }}
          >
            <CardContent className="p-3 flex items-center justify-between h-full" style={{ padding: '12px' }}>
              <div className="flex-1">
                <p className="font-bold text-lg leading-tight">{item.type}</p>
                {item.desc ? (
                  <p className="text-4xs opacity-60 mt-1 leading-tight">{item.desc}</p>
                ) : null}
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
