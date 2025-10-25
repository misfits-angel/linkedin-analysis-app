# Context Usage Guide

This guide explains the context providers used in the application and best practices for using them.

## Overview

The application uses React Context API for global state management. Currently, there are 2 main contexts:

1. **AuthContext** - User authentication and session management
2. **UIPreferencesContext** - Consolidated UI preferences (card names, visibility settings)

---

## Context Architecture

```
App Root (layout.jsx)
│
└── ErrorBoundary
    └── AuthProvider
        └── (page.jsx)
            └── UIPreferencesProvider
```

---

## 1. AuthContext

**Location**: `src/lib/contexts/AuthContext.jsx`

**Purpose**: Manages user authentication state and provides auth-related utilities.

### Provided Values
```javascript
{
  user,           // Current user object (null if not authenticated)
  session,        // Current session
  loading,        // Boolean: Auth initialization in progress
  signUp,         // Function: Sign up new user
  signIn,         // Function: Sign in existing user
  signOut,        // Function: Sign out current user
  supabase        // Supabase client instance
}
```

### Usage
```jsx
import { useAuth } from '@/lib/contexts/AuthContext'

function MyComponent() {
  const { user, signOut, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  )
}
```

### Best Practices
- Always check `loading` before accessing `user`
- Use optional chaining when accessing user properties: `user?.email`
- Don't call auth functions in render - use event handlers or effects
- Check authentication requirements at route level with `ProtectedRoute`

---

## 2. UIPreferencesContext

**Location**: `src/lib/contexts/UIPreferencesContext.jsx`

**Purpose**: Consolidated context managing UI preferences including card name overlays and card visibility settings.

### Provided Values
```javascript
{
  // Card Name Settings
  showCardNames,          // Boolean: Whether card names are visible
  toggleCardNames,        // Function: Toggle card name visibility
  
  // Card Visibility Settings
  cardVisibility,         // Object: { cardId: boolean, ... }
  isInitialized,          // Boolean: Whether initial load is complete
  toggleCard,             // Function: (cardId) => void
  setCardVisibilityState, // Function: (cardId, visible) => void
  toggleCategory,         // Function: (category) => void
  toggleAllCards,         // Function: (visible) => void
  resetToDefaults,        // Function: () => void
  getVisibleCards,        // Function: () => string[]
  getCardsByCategory,     // Function: () => Object
  CARD_DEFINITIONS        // Object: Card metadata
}
```

### Card Definitions
All cards must be defined in `CARD_DEFINITIONS`:
```javascript
export const CARD_DEFINITIONS = {
  'card-id': { 
    name: 'Display Name', 
    category: 'Category Name', 
    defaultVisible: true 
  },
  // ... more cards
}
```

### Usage

**Card Name Toggle**
```jsx
import { useCardNames } from '@/lib/contexts/UIPreferencesContext'

function Header() {
  const { showCardNames, toggleCardNames } = useCardNames()
  
  return (
    <button onClick={toggleCardNames}>
      {showCardNames ? '🙈 Hide Names' : '🏷️ Show Names'}
    </button>
  )
}
```

**Card Visibility Management**
```jsx
import { useCardVisibility } from '@/lib/contexts/UIPreferencesContext'

function CardSettings() {
  const { cardVisibility, toggleCard } = useCardVisibility()
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={cardVisibility['top-posts'] || false}
          onChange={() => toggleCard('top-posts')}
        />
        Show Top Posts
      </label>
    </div>
  )
}
```

**Conditional Card Rendering**
```jsx
import ConditionalCard from '@/components/ConditionalCard'

function Dashboard() {
  return (
    <ConditionalCard cardId="top-posts">
      <Card>
        {/* Card content only renders if visible */}
      </Card>
    </ConditionalCard>
  )
}
```

**Check If Card Is Visible**
```jsx
const { cardVisibility } = useCardVisibility()
const isVisible = cardVisibility['my-card-id']

if (!isVisible) return null
```

### Best Practices
- **Always define cards** in `CARD_DEFINITIONS` before using them
- Use **meaningful cardIds** that match the card's purpose
- **Group related cards** using the same category
- Use `ConditionalCard`, `GridCard`, or `CollapsibleGridCard` for automatic visibility handling
- Don't manually check visibility in every card - let the wrapper components handle it
- Set sensible `defaultVisible` values based on importance
- Card components automatically respect the name overlay setting if using `CardWithName`, `GridCard`, or `CollapsibleGridCard`

---

## Performance Considerations

### Avoid Unnecessary Re-renders

**❌ Bad: Accessing entire context when only need one value**
```jsx
function MyComponent() {
  const auth = useAuth() // Component re-renders on any auth change
  return <div>{auth.user?.email}</div>
}
```

**✅ Good: Destructure only what you need**
```jsx
function MyComponent() {
  const { user } = useAuth() // Still re-renders, but clearer intent
  return <div>{user?.email}</div>
}
```

**✅ Better: Use selectors or memo (for complex components)**
```jsx
const UserEmail = memo(function UserEmail() {
  const { user } = useAuth()
  return <div>{user?.email}</div>
})
```

### Context Splitting

The app uses a well-optimized context structure:
- **Auth** is separate from **UI preferences** (different concerns and update frequencies)
- **UIPreferences** consolidates related UI settings (card names and visibility) to reduce context overhead

If you add more contexts, consider:
- Will this value update frequently?
- How many components need this value?
- Can it be localized to a subtree instead of global?
- Can it be combined with existing contexts if they're related?

---

## Adding New Contexts

If you need to add a new context:

### 1. Create the Context File

```jsx
'use client'

import { createContext, useContext, useState } from 'react'

const MyContext = createContext()

export function MyProvider({ children }) {
  const [value, setValue] = useState(null)
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  )
}

export function useMyContext() {
  const context = useContext(MyContext)
  if (context === undefined) {
    throw new Error('useMyContext must be used within MyProvider')
  }
  return context
}
```

### 2. Add Provider to App

```jsx
// In appropriate place (layout.jsx or page.jsx)
<MyProvider>
  {children}
</MyProvider>
```

### 3. Document It

Add a section to this guide explaining:
- What it's for
- What values it provides
- How to use it
- Best practices

---

## Common Patterns

### Pattern 1: Protected Component

```jsx
import { useAuth } from '@/lib/contexts/AuthContext'

function AdminPanel() {
  const { user } = useAuth()
  
  if (!user?.email?.endsWith('@admin.com')) {
    return <div>Access denied</div>
  }
  
  return <div>Admin content</div>
}
```

### Pattern 2: Loading States

```jsx
import { useAuth } from '@/lib/contexts/AuthContext'

function Profile() {
  const { user, loading } = useAuth()
  
  if (loading) return <Skeleton />
  if (!user) return <SignInPrompt />
  
  return <UserProfile user={user} />
}
```

### Pattern 3: Conditional Rendering with Multiple Contexts

```jsx
import { useAuth } from '@/lib/contexts/AuthContext'
import { useCardVisibility } from '@/lib/contexts/UIPreferencesContext'

function Dashboard() {
  const { user } = useAuth()
  const { cardVisibility } = useCardVisibility()
  
  const isAdmin = user?.email?.endsWith('@admin.com')
  const showAdminPanel = isAdmin && cardVisibility['admin-panel']
  
  return (
    <div>
      {showAdminPanel && <AdminPanel />}
    </div>
  )
}
```

### Pattern 4: Context with Local Storage Sync

See `UIPreferencesContext` for example:
```jsx
// Load from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem('key')
  if (saved) {
    setState(JSON.parse(saved))
  }
}, [])

// Save to localStorage on changes
useEffect(() => {
  localStorage.setItem('key', JSON.stringify(state))
}, [state])
```

---

## Debugging Context Issues

### Issue: "Cannot read property X of undefined"

**Cause**: Using hook outside provider
**Fix**: Ensure component is wrapped in the provider

### Issue: Component not re-rendering on context change

**Cause**: Context value not properly memoized or reference changed
**Fix**: 
```jsx
// In provider
const value = useMemo(() => ({
  data,
  setData
}), [data]) // Include all dependencies
```

### Issue: Too many re-renders

**Cause**: Context provider value changing on every render
**Fix**: Use useMemo or useState to stabilize values

### Issue: Stale closure in context

**Cause**: Callback doesn't have all dependencies
**Fix**: Add dependencies to useCallback:
```jsx
const myFunction = useCallback(() => {
  // Use someValue
}, [someValue]) // Don't forget dependencies!
```

---

## Migration Guide

### Moving from Props to Context

**Before:**
```jsx
function App() {
  const [user, setUser] = useState(null)
  return <Dashboard user={user} setUser={setUser} />
}

function Dashboard({ user, setUser }) {
  return <Profile user={user} />
}

function Profile({ user }) {
  return <div>{user.name}</div>
}
```

**After:**
```jsx
function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}

function Dashboard() {
  return <Profile />
}

function Profile() {
  const { user } = useAuth()
  return <div>{user.name}</div>
}
```

---

## Summary

- ✅ Use contexts for truly global state (auth, themes, UI preferences)
- ✅ Split contexts by concern and update frequency
- ✅ Always provide a custom hook (e.g., `useAuth`)
- ✅ Add error checking in hooks
- ✅ Document what the context provides
- ❌ Don't use context for frequently updating values that only affect a few components
- ❌ Don't create deeply nested provider hierarchies
- ❌ Don't put everything in one giant context

