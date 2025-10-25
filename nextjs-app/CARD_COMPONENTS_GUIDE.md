# Card Components System Guide

This guide explains the different Card wrapper components in the application and when to use each one.

## Overview

The application has several card wrapper components that serve different purposes:

```
Card (base)
├── CardWithName (adds name overlay feature)
├── GridCard (integrates with visibility system)
├── CollapsibleGridCard (adds collapsible behavior)
└── ConditionalCard (conditional rendering based on visibility)
```

---

## Component Descriptions

### 1. **`Card` (Base Component)**
- **Location**: `src/components/ui/card.jsx`
- **Purpose**: Base shadcn/ui card component
- **Use When**: Building standalone cards or custom implementations
- **Features**: 
  - Basic card styling (border, shadow, rounded corners)
  - CardHeader, CardTitle, CardContent sub-components
  - No special behaviors

**Example:**
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

### 2. **`CardWithName`**
- **Location**: `src/components/CardWithName.jsx`
- **Purpose**: Extends base Card with optional name overlay for debugging/development
- **Use When**: You want the ability to show/hide card names (useful during development)
- **Features**:
  - All features of base Card
  - Optional name overlay (controlled by UIPreferencesContext)
  - Appears in top-left corner when enabled

**Example:**
```jsx
import Card from '@/components/CardWithName'

<Card cardName="User Profile Card">
  <CardContent>Profile information</CardContent>
</Card>
```

---

### 3. **`GridCard`**
- **Location**: `src/components/GridCard.jsx`
- **Purpose**: Card that integrates with the card visibility system
- **Use When**: Card should be toggleable via Card Visibility Settings
- **Features**:
  - Integrates with `UIPreferencesContext` (consolidated context)
  - Always visible by default (no conditional rendering)
  - Used with `IndependentColumnLayout` for proper grid positioning
  - Includes cardName overlay feature

**Example:**
```jsx
import GridCard from '@/components/GridCard'

<GridCard cardId="top-posts" cardName="Top Posts Card">
  <CardHeader>
    <CardTitle>Top Posts</CardTitle>
  </CardHeader>
  <CardContent>
    Posts list here
  </CardContent>
</GridCard>
```

**Alternative - Use GridCardContent for raw content without Card wrapper:**
```jsx
import { GridCardContent } from '@/components/GridCard'

<GridCardContent cardId="posts-count" cardName="Posts Count">
  <div className="text-sm">Posts</div>
  <div className="text-2xl font-bold">42</div>
</GridCardContent>
```

---

### 4. **`CollapsibleGridCard`**
- **Location**: `src/components/CollapsibleGridCard.jsx`
- **Purpose**: GridCard with collapsible/expandable behavior
- **Use When**: Card contains a lot of content that should be collapsed by default
- **Features**:
  - All features of GridCard
  - Collapsible content with expand/collapse button
  - Configurable collapsed height
  - Smooth transitions

**Example:**
```jsx
import CollapsibleGridCard from '@/components/CollapsibleGridCard'

<CollapsibleGridCard 
  cardId="timing-insights" 
  cardName="Timing Insights Card"
  title="⏰ Timing Insights"
  collapsedHeight="250px"
>
  <div>Large content that can be collapsed</div>
</CollapsibleGridCard>
```

**Alternative - Use CollapsibleGridCardContent for raw content:**
```jsx
import { CollapsibleGridCardContent } from '@/components/CollapsibleGridCard'

<CollapsibleGridCardContent 
  cardId="linkedin-analytics"
  cardName="LinkedIn Analytics Card"
  collapsedHeight="300px"
>
  <LinkedinAnalyticsCard {...props} />
</CollapsibleGridCardContent>
```

---

### 5. **`ConditionalCard`**
- **Location**: `src/components/ConditionalCard.jsx`
- **Purpose**: Wrapper that conditionally renders children based on visibility settings
- **Use When**: Wrapping non-card components that need visibility control
- **Features**:
  - Conditionally renders based on `UIPreferencesContext`
  - Returns `null` if card is hidden
  - Transparent wrapper (doesn't add styling)

**Example:**
```jsx
import ConditionalCard from '@/components/ConditionalCard'

<ConditionalCard cardId="engagement-trend-chart">
  <Card cardName="Engagement Chart">
    <CardContent>
      <Chart {...chartProps} />
    </CardContent>
  </Card>
</ConditionalCard>
```

---

## Decision Flow Chart

```
Need a card?
│
├─ Does it need to be toggleable in settings?
│  │
│  ├─ YES → Need collapsible behavior?
│  │       │
│  │       ├─ YES → Use CollapsibleGridCard
│  │       └─ NO  → Use GridCard
│  │
│  └─ NO → Need name overlay for debugging?
│          │
│          ├─ YES → Use CardWithName
│          └─ NO  → Use base Card
│
└─ Just wrapping existing component with visibility control?
   └─ Use ConditionalCard
```

---

## Common Patterns

### Pattern 1: Small Metric Cards
```jsx
<GridCardContent cardId="posts-count" cardName="Posts Count Card">
  <div className="text-sm text-muted-foreground">Total Posts</div>
  <div className="text-2xl font-bold">{count}</div>
</GridCardContent>
```

### Pattern 2: Large Content Cards
```jsx
<CollapsibleGridCard 
  cardId="analysis" 
  cardName="Analysis Card"
  title="📊 Analysis"
  collapsedHeight="300px"
>
  <LargeAnalysisComponent data={data} />
</CollapsibleGridCard>
```

### Pattern 3: Wrapping Existing Components
```jsx
<ConditionalCard cardId="chart-section">
  <ChartSection data={data} />
</ConditionalCard>
```

### Pattern 4: Standalone Cards (No Visibility Control)
```jsx
<Card cardName="Error Display">
  <CardContent>
    <p className="text-destructive">{error}</p>
  </CardContent>
</Card>
```

---

## Integration with IndependentColumnLayout

When using visibility-aware cards (GridCard, CollapsibleGridCard), they should be children of `IndependentColumnLayout`:

```jsx
<IndependentColumnLayout cardIds={['posts-count', 'top-posts', 'engagement-chart']}>
  <GridCardContent cardId="posts-count" cardName="Posts Count">
    {/* Content */}
  </GridCardContent>
  
  <GridCard cardId="top-posts" cardName="Top Posts">
    {/* Content */}
  </GridCard>
  
  <ConditionalCard cardId="engagement-chart">
    <Card cardName="Engagement">
      {/* Content */}
    </Card>
  </ConditionalCard>
</IndependentColumnLayout>
```

The layout will handle positioning based on visibility settings.

---

## Best Practices

1. **Always provide cardId and cardName** for visibility-aware components
2. **Use meaningful cardIds** that match CARD_DEFINITIONS in CardVisibilityContext
3. **Keep cardName descriptive** for easier debugging
4. **Use ConditionalCard** for components that already have their own Card styling
5. **Use GridCard/CollapsibleGridCard** when you need built-in Card styling
6. **Don't nest visibility-aware cards** (avoid GridCard inside ConditionalCard)

---

## Troubleshooting

**Q: My card isn't showing up**
- Check if cardId is defined in CARD_DEFINITIONS (UIPreferencesContext.jsx)
- Verify defaultVisible setting for that cardId
- Check Card Visibility Settings toggle in UI

**Q: Card name overlay not showing**
- Ensure you're using CardWithName, GridCard, or CollapsibleGridCard
- Check if "Show Names" is enabled (toggle button in header)
- Verify UIPreferencesContext is properly wrapped around your component

**Q: Collapsible card not collapsing**
- Ensure you're using CollapsibleGridCard, not GridCard
- Check if collapsedHeight is set appropriately
- Verify content height exceeds collapsedHeight

---

## Migration from Old Cards

If you have old card implementations, here's how to migrate:

**Old:**
```jsx
<Card className="...">
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**New (with visibility control):**
```jsx
<GridCard cardId="unique-id" cardName="Display Name">
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardContent>Content</CardContent>
</GridCard>
```

---

## File References

- Base Card: `nextjs-app/src/components/ui/card.jsx`
- CardWithName: `nextjs-app/src/components/CardWithName.jsx`
- GridCard: `nextjs-app/src/components/GridCard.jsx`
- CollapsibleGridCard: `nextjs-app/src/components/CollapsibleGridCard.jsx`
- ConditionalCard: `nextjs-app/src/components/ConditionalCard.jsx`
- UIPreferences Context: `nextjs-app/src/lib/contexts/UIPreferencesContext.jsx`
- Layout: `nextjs-app/src/components/IndependentColumnLayout.jsx`

