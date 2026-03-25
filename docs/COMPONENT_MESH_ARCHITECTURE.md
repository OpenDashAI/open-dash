# Component Mesh Architecture Guide

**Build applications as networks of independent, loosely-coupled components that communicate through events.**

This guide teaches the composable component philosophy and shows how to structure applications for scalability, testability, and maintainability.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Architecture Overview](#architecture-overview)
3. [Core Concepts](#core-concepts)
4. [Building Your First App](#building-your-first-app)
5. [Real-World Examples](#real-world-examples)
6. [Advanced Patterns](#advanced-patterns)
7. [Anti-Patterns & What NOT to Do](#anti-patterns--what-not-to-do)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Core Philosophy

### The Problem with Traditional Component Hierarchies

Traditional React applications use **prop drilling** and **parent-managed state**:

```tsx
// ❌ This gets complex fast
function App() {
  const [selected, setSelected] = useState([])
  const [filtered, setFiltered] = useState([])
  const [results, setResults] = useState([])

  return (
    <>
      <Selector
        onSelect={(items) => {
          setSelected(items)
          setFiltered(items)  // Cascade updates
          setResults(items)
        }}
      />
      <Filter
        items={selected}
        onFilter={(items) => {
          setFiltered(items)
          setResults(items)  // Cascade again
        }}
      />
      <Display items={filtered} />
      <Summary items={results} />
    </>
  )
}
```

**Problems:**
- Parent couples all children together
- Adding a new component = refactor parent
- State lives in wrong place (parent, not in component)
- Removing a component breaks prop chains
- Prop names must match exactly (brittle contracts)

### The Composable Solution

Components don't import each other. They emit and listen to **named events**:

```tsx
// ✅ Components are independent
<CompositionProvider>
  <Selector componentId="selector" />
  <Filter componentId="filter" listenToComponent="selector" />
  <Display componentId="display" listenToComponent="filter" />
  <Summary componentId="summary" listenToComponent="display" />
</CompositionProvider>
```

**Benefits:**
- Components know nothing about each other
- Each manages its own state
- Add/remove components without touching others
- Reuse same component in different contexts
- Loose coupling = easy testing

---

## Architecture Overview

### Three Layers

```
┌─────────────────────────────────────────┐
│      Application (Your App)             │
│  <CompositionProvider>                  │
│    ├─ Component A                       │
│    ├─ Component B (listens to A)        │
│    ├─ Component C (listens to B)        │
│    └─ Component D (listens to A & B)    │
│  </CompositionProvider>                 │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│   Composition Layer (Event Router)      │
│  CompositionProvider manages:           │
│  - Component registration               │
│  - Event routing                        │
│  - Listener subscriptions               │
│  - State access                         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│      Individual Components              │
│  Each component:                        │
│  - Registers itself                     │
│  - Manages own state                    │
│  - Emits events                         │
│  - Listens to events                    │
│  - Renders own UI                       │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Action in Component A
         ↓
Component A emits event
         ↓
CompositionProvider routes event
         ↓
Components B, C, D listening receive event
         ↓
Each updates own state based on event
         ↓
Each re-renders independently
         ↓
New events emitted (cascade)
         ↓
Loop continues...
```

---

## Core Concepts

### 1. CompositionProvider

The centralized hub managing all component communication.

```tsx
import { CompositionProvider } from '@opendash/composition'

function App() {
  return (
    <CompositionProvider>
      {/* All composable components go here */}
    </CompositionProvider>
  )
}
```

**What it does:**
- Stores component registry (who's alive)
- Routes events between components
- Manages listener subscriptions
- Provides context to all children

### 2. Component ID

Every composable component has a **unique string identifier** within its provider.

```tsx
<Selector componentId="main-selector" />
<Filter componentId="main-filter" />
<Display componentId="main-display" />
```

**Why IDs matter:**
- Identify which component emitted/receives events
- Enable multiple instances of same component type
- Make event routing deterministic
- Support debugging ("which component sent this?")

### 3. Events

Named messages sent between components. Format: `{ componentId, eventName, payload }`.

```tsx
// Component A emits an event
ctx.emitEvent('selector', 'selection-changed', {
  selectedIds: ['id1', 'id2'],
  timestamp: Date.now()
})

// Component B listens
ctx.onComponentEvent('selector', 'selection-changed', (payload) => {
  setSelectedItems(payload.selectedIds)
})
```

**Event naming conventions:**
- Use past tense: `item-selected`, `data-loaded`, `filter-applied`
- Be specific: `user-filter-changed` not `update`
- Include component context if needed: `playlist-added`, `track-playing`

### 4. useCompositionContext Hook

Access the composition system from any component.

```tsx
import { useCompositionContext } from '@opendash/composition'

function MyComponent({ componentId }) {
  const ctx = useCompositionContext()

  // Register component
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'my-component',
      enabled: true,
      state: { /* current state */ }
    })
  }, [componentId, ctx])

  // Listen to events
  useEffect(() => {
    const unsubscribe = ctx.onComponentEvent('other-component', 'event-name', (payload) => {
      // Handle event
    })
    return unsubscribe  // Clean up subscription
  }, [ctx])

  // Emit events
  const handleClick = () => {
    ctx.emitEvent(componentId, 'my-event', { data: 'value' })
  }

  return <button onClick={handleClick}>Click me</button>
}
```

### 5. Listening Pattern

Components listen to specific sources or broadcast from 'any'.

```tsx
// Listen to specific component
listenToComponent="selector"  // Only events from 'selector'

// Listen to any component of this event
listenToComponent="any"  // Events from anyone
```

**Use `any` when:**
- Multiple components could emit the same event
- You don't care who sent it, just the data
- Building generic/reusable components

**Use specific ID when:**
- Data flow chain (A → B → C)
- Component depends on specific source
- You need to know who changed

---

## Building Your First App

### Step 1: Design Your Data Flow

Before writing code, sketch which component emits what:

```
User Input
    ↓
[DataSelector] → emits 'selection-changed'
    ↓
[Filter] → listens to 'selection-changed'
    ↓
[Filter] → emits 'filter-updated'
    ↓
[Display] → listens to 'filter-updated'
    ↓
[Display] → emits 'display-ready'
    ↓
[Summary] → listens to 'display-ready'
```

### Step 2: Create CompositionProvider

```tsx
// app.tsx
import { CompositionProvider } from '@opendash/composition'
import { DataSelector } from './components/DataSelector'
import { Filter } from './components/Filter'
import { Display } from './components/Display'
import { Summary } from './components/Summary'

const SAMPLE_DATA = [
  'Google Analytics',
  'GitHub Issues',
  'Stripe Revenue',
  'Email Campaigns',
]

export function Dashboard() {
  return (
    <CompositionProvider>
      <div className="grid grid-cols-4 gap-6">
        <DataSelector
          componentId="selector"
          items={SAMPLE_DATA}
        />
        <Filter
          componentId="filter"
          listenToComponent="selector"
        />
        <Display
          componentId="display"
          listenToComponent="filter"
        />
        <Summary
          componentId="summary"
          listenToComponent="display"
        />
      </div>
    </CompositionProvider>
  )
}
```

### Step 3: Implement DataSelector

The first component in the chain. Emits when user selects items.

```tsx
// components/DataSelector.tsx
import { useEffect, useState } from 'react'
import { useCompositionContext } from '@opendash/composition'

interface DataSelectorProps {
  componentId: string
  items: string[]
}

export function DataSelector({ componentId, items }: DataSelectorProps) {
  const ctx = useCompositionContext()
  const [selected, setSelected] = useState<string[]>([])

  // Register this component
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'data-selector',
      enabled: true,
      state: { selectedCount: selected.length }
    })
  }, [componentId, selected.length, ctx])

  // Handle selection change
  const handleToggle = (item: string) => {
    const newSelected = selected.includes(item)
      ? selected.filter(s => s !== item)
      : [...selected, item]

    setSelected(newSelected)

    // Emit event so Filter can react
    ctx.emitEvent(componentId, 'selection-changed', {
      selectedItems: newSelected,
      count: newSelected.length
    })
  }

  return (
    <div className="p-4 bg-white rounded border">
      <h2 className="font-bold mb-3">Available Data</h2>
      <div className="space-y-2">
        {items.map(item => (
          <label key={item} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => handleToggle(item)}
            />
            {item}
          </label>
        ))}
      </div>
      <div className="text-sm text-gray-600 mt-3">
        {selected.length} selected
      </div>
    </div>
  )
}
```

### Step 4: Implement Filter

Listens to DataSelector, emits filtered results.

```tsx
// components/Filter.tsx
import { useEffect, useState } from 'react'
import { useCompositionContext } from '@opendash/composition'

interface FilterProps {
  componentId: string
  listenToComponent: string
}

export function Filter({ componentId, listenToComponent }: FilterProps) {
  const ctx = useCompositionContext()
  const [searchText, setSearchText] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Register this component
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'filter',
      enabled: true,
      state: { filteredCount: filteredItems.length }
    })
  }, [componentId, ctx])

  // Listen to DataSelector events
  useEffect(() => {
    const unsubscribe = ctx.onComponentEvent(
      listenToComponent,
      'selection-changed',
      (payload: any) => {
        setSelectedItems(payload.selectedItems)
      }
    )
    return unsubscribe
  }, [componentId, listenToComponent, ctx])

  // Calculate filtered items
  const filteredItems = selectedItems.filter(item =>
    item.toLowerCase().includes(searchText.toLowerCase())
  )

  // When filter changes, emit new event
  useEffect(() => {
    ctx.emitEvent(componentId, 'filter-updated', {
      filteredItems,
      query: searchText
    })
  }, [componentId, filteredItems, searchText, ctx])

  return (
    <div className="p-4 bg-white rounded border">
      <h2 className="font-bold mb-3">Filter</h2>
      <input
        type="text"
        placeholder="Search selected items..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <div className="text-sm text-gray-600 mt-3">
        {filteredItems.length} results
      </div>
    </div>
  )
}
```

### Step 5: Implement Display

Listens to Filter, emits display-ready event.

```tsx
// components/Display.tsx
import { useEffect, useState } from 'react'
import { useCompositionContext } from '@opendash/composition'

interface DisplayProps {
  componentId: string
  listenToComponent: string
}

export function Display({ componentId, listenToComponent }: DisplayProps) {
  const ctx = useCompositionContext()
  const [items, setItems] = useState<string[]>([])

  // Register this component
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'display',
      enabled: true,
      state: { displayCount: items.length }
    })
  }, [componentId, items.length, ctx])

  // Listen to Filter events
  useEffect(() => {
    const unsubscribe = ctx.onComponentEvent(
      listenToComponent,
      'filter-updated',
      (payload: any) => {
        setItems(payload.filteredItems)

        // Emit that display is ready
        ctx.emitEvent(componentId, 'display-ready', {
          items: payload.filteredItems,
          count: payload.filteredItems.length
        })
      }
    )
    return unsubscribe
  }, [componentId, listenToComponent, ctx])

  return (
    <div className="p-4 bg-white rounded border">
      <h2 className="font-bold mb-3">Results</h2>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item} className="p-2 bg-gray-100 rounded">
            {item}
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-gray-500 text-sm">No items to display</div>
      )}
    </div>
  )
}
```

### Step 6: Implement Summary

Listens to Display, shows aggregate statistics.

```tsx
// components/Summary.tsx
import { useEffect, useState } from 'react'
import { useCompositionContext } from '@opendash/composition'

interface SummaryProps {
  componentId: string
  listenToComponent: string
}

export function Summary({ componentId, listenToComponent }: SummaryProps) {
  const ctx = useCompositionContext()
  const [stats, setStats] = useState({
    totalItems: 0,
    avgLength: 0
  })

  // Register this component
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'summary',
      enabled: true,
      state: stats
    })
  }, [componentId, stats, ctx])

  // Listen to Display events
  useEffect(() => {
    const unsubscribe = ctx.onComponentEvent(
      listenToComponent,
      'display-ready',
      (payload: any) => {
        const items = payload.items as string[]
        const newStats = {
          totalItems: items.length,
          avgLength: items.length > 0
            ? Math.round(
                items.reduce((sum, i) => sum + i.length, 0) / items.length
              )
            : 0
        }
        setStats(newStats)
      }
    )
    return unsubscribe
  }, [componentId, listenToComponent, ctx])

  return (
    <div className="p-4 bg-white rounded border">
      <h2 className="font-bold mb-3">Statistics</h2>
      <div className="space-y-2 text-sm">
        <div>Total items: <strong>{stats.totalItems}</strong></div>
        <div>Avg length: <strong>{stats.avgLength}</strong> chars</div>
      </div>
    </div>
  )
}
```

### Result

You now have:
- 4 independent components
- Zero prop drilling
- Each manages own state
- Data flows through events
- Easy to add/remove components
- Reusable in different contexts

---

## Real-World Examples

### Example 1: Music Player (Composer + Transport)

**Data Flow:**
```
[Composer] (add/remove tracks)
    ↓ emits 'track-added', 'track-removed'
[Transport] (play/pause/navigate)
```

**Composer Component:**
```tsx
export function Composer({ componentId, items }: ComposerProps) {
  const ctx = useCompositionContext()
  const [playlist, setPlaylist] = useState(items)

  const handleAddTrack = (track: Track) => {
    setPlaylist([...playlist, track])
    ctx.emitEvent(componentId, 'track-added', track)
  }

  const handleRemoveTrack = (trackId: string) => {
    const updated = playlist.filter(t => t.id !== trackId)
    setPlaylist(updated)
    ctx.emitEvent(componentId, 'track-removed', { id: trackId })
  }

  return (
    // UI for adding/removing tracks
  )
}
```

**Transport Component:**
```tsx
export function Transport({ componentId, listenToComponent }: TransportProps) {
  const ctx = useCompositionContext()
  const [items, setItems] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  // Listen to Composer
  useEffect(() => {
    const unsub1 = ctx.onComponentEvent(listenToComponent, 'track-added', (track) => {
      setItems(prev => [...prev, track])
    })
    const unsub2 = ctx.onComponentEvent(listenToComponent, 'track-removed', ({ id }) => {
      setItems(prev => prev.filter(t => t.id !== id))
    })
    return () => {
      unsub1()
      unsub2()
    }
  }, [listenToComponent, ctx])

  const handlePlay = () => {
    setIsPlaying(true)
    ctx.emitEvent(componentId, 'playback-started', { itemCount: items.length })
  }

  return (
    // Play/pause controls
  )
}
```

### Example 2: Email Client (7 Components)

**Architecture:**
```
┌─ [FolderSelector] → emits 'folder-selected'
├─ [ContactsList] → emits 'contact-selected'
├─ [EmailSettings] → emits 'settings-changed'
│
├─ [EmailList] → listens to 'folder-selected'
│                    → emits 'email-selected'
│
├─ [EmailPreview] → listens to 'email-selected'
│
├─ [EmailSearch] → emits 'search-updated'
│                      (Display layer decision: filter EmailList UI)
│
└─ [Summary] → listens to 'email-selected', 'settings-changed'
```

This is production-ready with multiple independent data sources.

---

## Advanced Patterns

### Pattern 1: Fan-Out (One Source, Many Listeners)

```tsx
[DataSource]
    ├─ [Analytics] listens
    ├─ [Cache] listens
    ├─ [Logger] listens
    └─ [Alert] listens
```

```tsx
// All listen to 'data-source'
<Display componentId="analytics" listenToComponent="data-source" />
<Cache componentId="cache" listenToComponent="data-source" />
<Logger componentId="logger" listenToComponent="data-source" />
<Alert componentId="alert" listenToComponent="data-source" />
```

### Pattern 2: Merge (Many Sources, One Listener)

```tsx
[UserInput]        ─┐
[DataFetch]        ─├─→ [ProcessingQueue]
[ExternalWebhook]  ─┘
```

```tsx
useEffect(() => {
  ctx.onComponentEvent('user-input', 'action', handleAction)
  ctx.onComponentEvent('data-fetch', 'complete', handleData)
  ctx.onComponentEvent('webhook', 'received', handleWebhook)
}, [ctx])
```

### Pattern 3: Broadcast (Listen to 'any')

For components that monitor all activity:

```tsx
<Logger componentId="logger" listenToComponent="any" />
<Monitor componentId="monitor" listenToComponent="any" />
```

```tsx
useEffect(() => {
  const unsubscribe = ctx.onComponentEvent('any', 'any-event', (payload) => {
    console.log('Activity:', payload)
  })
  return unsubscribe
}, [ctx])
```

### Pattern 4: Conditional Re-Emission

Transform events:

```tsx
useEffect(() => {
  ctx.onComponentEvent('selector', 'selection-changed', (payload) => {
    if (payload.selectedItems.length > 0) {
      // Only re-emit if selection is non-empty
      ctx.emitEvent(componentId, 'valid-selection', {
        items: payload.selectedItems
      })
    }
  })
}, [componentId, ctx])
```

### Pattern 5: Debounced Emission

Prevent event floods:

```tsx
const debouncedEmit = useCallback(
  debounce((value: string) => {
    ctx.emitEvent(componentId, 'search-query-changed', { query: value })
  }, 300),
  [componentId, ctx]
)

const handleSearch = (value: string) => {
  setSearchText(value)
  debouncedEmit(value)
}
```

### Pattern 6: Conditional Listening

Toggle listening based on component state:

```tsx
useEffect(() => {
  if (!enabled) return  // Don't set up listener if disabled

  const unsubscribe = ctx.onComponentEvent(
    listenToComponent,
    'event-name',
    handleEvent
  )
  return unsubscribe
}, [enabled, listenToComponent, ctx])
```

---

## Anti-Patterns & What NOT to Do

### ❌ Anti-Pattern 1: Global State Mutations (Virtual Media's Approach)

**BAD:**
```tsx
// Don't do this
const state = {
  allTracks: [],
  selectedTracks: [],
  generatedImages: []
}

function loadLibrary() {
  // Mutate global state
  state.allTracks = await fetchTracks()
  // Update dependent views manually
  renderDisplay()
  loadStats()
  updateSearch()
}
```

**Problems:**
- Global state mutations are hard to track
- Side effects cascade (loadLibrary calls loadStats calls renderSearch)
- Impossible to know who changed what
- Testing requires mocking globals
- No clear data flow

**GOOD:**
```tsx
// Use CompositionProvider instead
<CompositionProvider>
  <TrackLoader componentId="loader" />
  <Display componentId="display" listenToComponent="loader" />
  <Stats componentId="stats" listenToComponent="display" />
</CompositionProvider>

// Each component owns its state
function TrackLoader({ componentId }) {
  const [tracks, setTracks] = useState([])  // Local state

  useEffect(() => {
    fetchTracks().then(data => {
      setTracks(data)
      ctx.emitEvent(componentId, 'tracks-loaded', { tracks: data })
    })
  }, [])
}
```

### ❌ Anti-Pattern 2: Direct DOM Manipulation

**BAD:**
```tsx
function loadLibrary() {
  const grid = document.getElementById('promptGrid')!
  grid.innerHTML = '<div class="loading">Loading…</div>'

  const prompts = await fetchPrompts()
  grid.innerHTML = prompts.map(renderPromptCard).join('')

  grid.querySelectorAll('.prompt-card').forEach(card => {
    card.addEventListener('click', handleCardClick)
  })
}
```

**Problems:**
- DOM queries scattered everywhere
- Event listeners re-attached after rebuild
- No component encapsulation
- Memory leaks from stale listeners
- Impossible to test without DOM

**GOOD:**
```tsx
function PromptGrid({ componentId, listenToComponent }) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const ctx = useCompositionContext()

  useEffect(() => {
    ctx.onComponentEvent(listenToComponent, 'filter-changed', (payload) => {
      fetchPrompts(payload.filter).then(setPrompts)
    })
  }, [])

  return (
    <div className="grid">
      {prompts.map(prompt => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onClick={() => ctx.emitEvent(componentId, 'prompt-selected', prompt)}
        />
      ))}
    </div>
  )
}
```

### ❌ Anti-Pattern 3: Props Drilling

**BAD:**
```tsx
// Level 1
function App() {
  const [selected, setSelected] = useState([])
  return <Level1 selected={selected} onSelect={setSelected} />
}

// Level 2
function Level1({ selected, onSelect }) {
  return <Level2 selected={selected} onSelect={onSelect} />
}

// Level 3
function Level2({ selected, onSelect }) {
  return <Level3 selected={selected} onSelect={onSelect} />
}

// Finally used at Level 4
function Level3({ selected, onSelect }) {
  return <ItemSelector selected={selected} onSelect={onSelect} />
}
```

**Problems:**
- Middle components polluted with props they don't use
- Hard to refactor (can't remove a level without breaking everything)
- Props must match exactly (no flexibility)
- Components are never reusable without their parent chain

**GOOD:**
```tsx
<CompositionProvider>
  <ItemSelector componentId="selector" />
  <Display componentId="display" listenToComponent="selector" />
</CompositionProvider>

// Each component is standalone
function ItemSelector({ componentId }) {
  const [selected, setSelected] = useState([])
  const ctx = useCompositionContext()

  const handleSelect = (items) => {
    setSelected(items)
    ctx.emitEvent(componentId, 'selection-changed', items)
  }

  return <SelectUI onChange={handleSelect} />
}
```

### ❌ Anti-Pattern 4: Tightly Coupled Components

**BAD:**
```tsx
// Components import and know about each other
import { Display } from './Display'
import { Summary } from './Summary'

function Filter({ items }) {
  const [filtered, setFiltered] = useState(items)

  const handleFilter = (query) => {
    const results = items.filter(...)
    setFiltered(results)
    // Directly update other components ❌
    Summary.update(results)
    Display.update(results)
  }

  return (
    <>
      <FilterUI onChange={handleFilter} />
      <Display items={filtered} />
      <Summary items={filtered} />
    </>
  )
}
```

**Problems:**
- Cannot reuse Filter without Display and Summary
- Cannot test Filter in isolation
- Tight coupling = brittle
- Adding/removing components = major refactor

**GOOD:**
```tsx
<CompositionProvider>
  <Filter componentId="filter" />
  <Display componentId="display" listenToComponent="filter" />
  <Summary componentId="summary" listenToComponent="filter" />
</CompositionProvider>

// Filter only emits events
function Filter({ componentId }) {
  const ctx = useCompositionContext()
  const [filtered, setFiltered] = useState([])

  const handleFilter = (query) => {
    const results = items.filter(...)
    setFiltered(results)
    ctx.emitEvent(componentId, 'filter-updated', results)
  }

  return <FilterUI onChange={handleFilter} />
}
```

### ❌ Anti-Pattern 5: Synchronous State Assumptions

**BAD:**
```tsx
const handleClick = () => {
  setItems([...items, newItem])
  // ❌ items is still old value here!
  logItems(items)
}
```

**GOOD:**
```tsx
const handleClick = () => {
  const updated = [...items, newItem]
  setItems(updated)
  // Use updated value, or emit event
  ctx.emitEvent(componentId, 'item-added', updated)
}

// Or use useEffect to react to state changes
useEffect(() => {
  ctx.emitEvent(componentId, 'items-changed', items)
}, [items, componentId, ctx])
```

---

## Testing

### Unit Testing a Composable Component

```tsx
import { render, screen } from '@testing-library/react'
import { CompositionProvider } from '@opendash/composition'
import { DataSelector } from './DataSelector'

describe('DataSelector', () => {
  it('emits selection-changed when item is toggled', async () => {
    const mockCtx = {
      registerComponent: jest.fn(),
      emitEvent: jest.fn(),
      onComponentEvent: jest.fn(() => () => {}),
      getComponentState: jest.fn(),
      findComponentsByType: jest.fn(),
      getEnabledComponents: jest.fn()
    }

    render(
      <CompositionProvider value={mockCtx}>
        <DataSelector
          componentId="selector"
          items={['Item 1', 'Item 2']}
        />
      </CompositionProvider>
    )

    // Click checkbox
    const checkbox = screen.getByRole('checkbox', { name: 'Item 1' })
    fireEvent.click(checkbox)

    // Verify emitEvent was called
    expect(mockCtx.emitEvent).toHaveBeenCalledWith(
      'selector',
      'selection-changed',
      expect.objectContaining({
        selectedItems: ['Item 1']
      })
    )
  })

  it('registers component on mount', () => {
    const mockCtx = { /* ... */ }

    render(
      <CompositionProvider value={mockCtx}>
        <DataSelector componentId="selector" items={[]} />
      </CompositionProvider>
    )

    expect(mockCtx.registerComponent).toHaveBeenCalledWith(
      'selector',
      expect.objectContaining({ type: 'data-selector' })
    )
  })
})
```

### Integration Testing Multiple Components

```tsx
describe('Dashboard Integration', () => {
  it('data flows through selector → filter → display → summary', async () => {
    render(
      <CompositionProvider>
        <DataSelector
          componentId="selector"
          items={['Analytics', 'GitHub', 'Stripe']}
        />
        <Filter
          componentId="filter"
          listenToComponent="selector"
        />
        <Display
          componentId="display"
          listenToComponent="filter"
        />
        <Summary
          componentId="summary"
          listenToComponent="display"
        />
      </CompositionProvider>
    )

    // Select an item
    fireEvent.click(screen.getByRole('checkbox', { name: 'Analytics' }))

    // Wait for cascade
    await waitFor(() => {
      expect(screen.getByText('1 results')).toBeInTheDocument()
    })

    // Filter should update
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'Ana' }
    })

    await waitFor(() => {
      expect(screen.getByText('1 result')).toBeInTheDocument()
    })

    // Summary should show stats
    await waitFor(() => {
      expect(screen.getByText('Total items: 1')).toBeInTheDocument()
    })
  })
})
```

---

## Troubleshooting

### Issue: Component doesn't receive events

**Check:**
1. Is `listenToComponent` ID correct?
2. Did the source component call `emitEvent`?
3. Is the event name spelled correctly?
4. Did you return `unsubscribe()` from useEffect?

**Debug:**
```tsx
// Add logging to verify events
useEffect(() => {
  const unsubscribe = ctx.onComponentEvent(
    listenToComponent,
    'event-name',
    (payload) => {
      console.log('Received event:', payload)  // Check console
      handleEvent(payload)
    }
  )
  return unsubscribe
}, [listenToComponent, ctx])
```

### Issue: Event cascades cause infinite loops

**Problem:**
```tsx
// Component A emits, Component B listens and re-emits
useEffect(() => {
  ctx.onComponentEvent('a', 'event', () => {
    ctx.emitEvent('b', 'event', {})  // Loops if B listens to itself
  })
}, [ctx])
```

**Solution:**
Add guards or separate event names:
```tsx
useEffect(() => {
  ctx.onComponentEvent('a', 'data-loaded', (payload) => {
    // Transform and emit different event
    ctx.emitEvent('b', 'data-transformed', transform(payload))
  })
}, [ctx])
```

### Issue: Component state not updating

**Check:**
1. Did you call `registerComponent`?
2. Is state passed in effect dependency arrays?
3. Are you using `useCallback` where needed?

**Debug:**
```tsx
// Verify component is registered
const state = ctx.getComponentState('my-component')
console.log('Component state:', state)
```

### Issue: Memory leaks from event listeners

**Always unsubscribe:**
```tsx
useEffect(() => {
  const unsub1 = ctx.onComponentEvent('a', 'event1', handler1)
  const unsub2 = ctx.onComponentEvent('b', 'event2', handler2)

  // Clean up both
  return () => {
    unsub1()
    unsub2()
  }
}, [ctx])
```

---

## Key Takeaways

1. **Components are independent** — No imports, no prop drilling
2. **Events are the contract** — Components communicate through named events only
3. **State is local** — Each component manages its own state
4. **Data flows openly** — Event emissions create natural cascades
5. **Easy to scale** — Add components without touching existing ones
6. **Easy to test** — Each component is testable in isolation or with mocks
7. **Reusable everywhere** — Same component works in different contexts

---

## Next Steps

- **Read the examples**: See `examples/Dashboard`, `examples/TodoList`, `examples/EmailClient`
- **Build your app**: Use this guide to architect your features
- **Test thoroughly**: Use the testing patterns above
- **Iterate and refactor**: The architecture supports safe refactoring

---

## See Also

- [CompositionProvider API](./API_REFERENCE.md)
- [Example Applications](../src/examples)
- [Component Testing Guide](./TESTING_GUIDE.md)
- [Performance Tips](./PERFORMANCE.md)

