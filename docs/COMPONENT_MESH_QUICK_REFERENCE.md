# Component Mesh Quick Reference

**One-page cheat sheet for building composable components.**

---

## Setup

```tsx
import { CompositionProvider } from '@opendash/composition'

<CompositionProvider>
  <ComponentA componentId="a" />
  <ComponentB componentId="b" listenToComponent="a" />
</CompositionProvider>
```

---

## Component Template

```tsx
import { useEffect, useState } from 'react'
import { useCompositionContext } from '@opendash/composition'

interface MyComponentProps {
  componentId: string
  listenToComponent?: string
}

export function MyComponent({ componentId, listenToComponent }: MyComponentProps) {
  const ctx = useCompositionContext()
  const [state, setState] = useState<any>(null)

  // 1. Register on mount
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'my-component',
      enabled: true,
      state: { /* current state */ }
    })
  }, [componentId, ctx])

  // 2. Listen to other components
  useEffect(() => {
    if (!listenToComponent) return

    const unsubscribe = ctx.onComponentEvent(
      listenToComponent,
      'event-name',
      (payload: any) => {
        setState(payload)
      }
    )

    return unsubscribe
  }, [componentId, listenToComponent, ctx])

  // 3. Emit events when state changes
  const handleAction = (data: any) => {
    setState(data)
    ctx.emitEvent(componentId, 'my-event', data)
  }

  // 4. Render
  return (
    <div onClick={() => handleAction({ /* data */ })}>
      {/* UI */}
    </div>
  )
}
```

---

## Common Patterns

### Listen to One Source
```tsx
listenToComponent="selector"
```

### Listen to Any Source
```tsx
listenToComponent="any"
```

### Listen to Multiple Events
```tsx
useEffect(() => {
  const unsub1 = ctx.onComponentEvent('a', 'event1', handle1)
  const unsub2 = ctx.onComponentEvent('b', 'event2', handle2)
  return () => { unsub1(); unsub2() }
}, [ctx])
```

### Emit Event
```tsx
ctx.emitEvent(componentId, 'event-name', { data: 'value' })
```

### Unsubscribe
```tsx
useEffect(() => {
  const unsubscribe = ctx.onComponentEvent('source', 'event', handler)
  return unsubscribe  // Cleanup
}, [ctx])
```

### Guard Against Re-render
```tsx
useEffect(() => {
  ctx.registerComponent(componentId, {
    id: componentId,
    type: 'my-component',
    enabled: true,
    state
  })
}, [componentId, state, ctx])  // Add all dependencies
```

---

## Data Flow Patterns

### Pipeline (A → B → C)
```
[A] emits 'data-loaded'
  ↓
[B] listens, transforms, emits 'data-filtered'
  ↓
[C] listens, displays
```

### Fan-Out (One → Many)
```
[Source] emits 'event'
  ├─ [Display] listens
  ├─ [Log] listens
  └─ [Alert] listens
```

### Merge (Many → One)
```
[A] emits 'event'  ─┐
[B] emits 'event'  ─┼─ [Processor] listens to all
[C] emits 'event'  ─┘
```

### Broadcast (Listen to All)
```
[Monitor] listens to 'any'
[Logger] listens to 'any'
```

---

## Event Naming Conventions

| Pattern | Example |
|---------|---------|
| User action | `item-selected`, `button-clicked` |
| Data change | `data-loaded`, `filter-updated` |
| Completion | `upload-complete`, `render-done` |
| Error | `fetch-failed`, `validation-error` |
| State | `status-changed`, `enabled` |

**Good names:**
- ✅ `selection-changed`
- ✅ `track-added`
- ✅ `filter-updated`
- ✅ `playback-started`

**Bad names:**
- ❌ `update`
- ❌ `change`
- ❌ `event`
- ❌ `trigger`

---

## Testing Snippet

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompositionProvider } from '@opendash/composition'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('emits event on action', async () => {
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
        <MyComponent componentId="test" />
      </CompositionProvider>
    )

    fireEvent.click(screen.getByRole('button'))

    expect(mockCtx.emitEvent).toHaveBeenCalledWith(
      'test',
      'my-event',
      expect.any(Object)
    )
  })
})
```

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do |
|---------|-------|
| Prop drilling | Use CompositionProvider |
| Global state | Local component state |
| Direct DOM manipulation | React state + render |
| Tight component coupling | Event-based loose coupling |
| Scattered event listeners | Centralized `onComponentEvent` |
| Synchronous state assumptions | Use effects or events |
| Unsubscribed listeners | Return `unsubscribe()` from useEffect |

---

## Debugging

### Log Events
```tsx
useEffect(() => {
  const unsub = ctx.onComponentEvent('any', 'any-event', (payload) => {
    console.log('Event:', { componentId, eventName, payload })
  })
  return unsub
}, [ctx])
```

### Check Component Registration
```tsx
const state = ctx.getComponentState('my-component')
console.log('Registered:', state)
```

### Verify Event Emission
```tsx
ctx.emitEvent(componentId, 'test-event', { debug: true })
// Check browser console for event routing
```

### Check Listener Setup
```tsx
useEffect(() => {
  console.log('Setting up listener for:', listenToComponent)
  const unsub = ctx.onComponentEvent(listenToComponent, 'event-name', (payload) => {
    console.log('Received:', payload)
  })
  return unsub
}, [listenToComponent, ctx])
```

---

## Dependency Array Checklist

```tsx
// ❌ Wrong - will re-run unnecessarily or leak listeners
useEffect(() => {
  ctx.onComponentEvent(listenToComponent, 'event', handler)
}, [])  // Missing dependencies!

// ✅ Correct
useEffect(() => {
  const unsub = ctx.onComponentEvent(listenToComponent, 'event', handler)
  return unsub
}, [listenToComponent, ctx])  // All dependencies included
```

**Always include:**
- `ctx` (from `useCompositionContext()`)
- `listenToComponent` (from props)
- `componentId` (from props)
- Any state used in handlers

---

## Common Mistakes

### 1. Forgetting to unsubscribe
```tsx
// ❌ Memory leak
useEffect(() => {
  ctx.onComponentEvent('source', 'event', handler)
}, [ctx])

// ✅ Clean up
useEffect(() => {
  const unsub = ctx.onComponentEvent('source', 'event', handler)
  return unsub
}, [ctx])
```

### 2. Not returning from listener effect
```tsx
// ❌ Multiple listeners accumulate
useEffect(() => {
  ctx.onComponentEvent('source', 'event', handler)  // No return
}, [])

// ✅ Single listener
useEffect(() => {
  const unsub = ctx.onComponentEvent('source', 'event', handler)
  return unsub  // Cleanup
}, [ctx])
```

### 3. Using state inside listener without dependency
```tsx
// ❌ State is stale
const [count, setCount] = useState(0)
useEffect(() => {
  ctx.onComponentEvent('source', 'event', () => {
    setCount(count + 1)  // count is always 0!
  })
}, [ctx])  // count not in dependencies

// ✅ Use setState callback
useEffect(() => {
  ctx.onComponentEvent('source', 'event', () => {
    setCount(prev => prev + 1)  // Always uses latest
  })
}, [ctx])
```

### 4. Assuming synchronous state updates
```tsx
// ❌ items is still old here
const handleAdd = () => {
  setItems([...items, newItem])
  console.log(items)  // Still old!
}

// ✅ Emit event instead
const handleAdd = () => {
  const updated = [...items, newItem]
  setItems(updated)
  ctx.emitEvent(componentId, 'item-added', updated)
}
```

---

## Performance Tips

### Debounce rapid events
```tsx
const debouncedEmit = useCallback(
  debounce((value) => ctx.emitEvent(componentId, 'search', value), 300),
  [componentId, ctx]
)
```

### Memoize expensive handlers
```tsx
const handleExpensive = useCallback(() => {
  // Expensive operation
}, [deps])
```

### Use `useMemo` for derived state
```tsx
const filtered = useMemo(
  () => items.filter(i => i.includes(query)),
  [items, query]
)
```

### Avoid registering on every render
```tsx
// ✅ Only register once, update state separately
useEffect(() => {
  ctx.registerComponent(componentId, { /* */ })
}, [componentId, ctx])

// Separate effect for state updates
useEffect(() => {
  ctx.registerComponent(componentId, { state: { /* */ } })
}, [componentId, state, ctx])
```

---

## Example: Complete Music Player

```tsx
export function Transport({ componentId, listenToComponent, items }: TransportProps) {
  const ctx = useCompositionContext()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Register
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'transport',
      enabled: true,
      state: { isPlaying, currentIndex }
    })
  }, [componentId, isPlaying, currentIndex, ctx])

  // Listen to track changes
  useEffect(() => {
    const unsub = ctx.onComponentEvent(listenToComponent, 'track-added', ({ tracks }) => {
      // Handle new tracks
    })
    return unsub
  }, [listenToComponent, ctx])

  // Play/pause
  const handlePlay = () => {
    audioRef.current?.play()
    setIsPlaying(true)
    ctx.emitEvent(componentId, 'playback-started', { track: items[currentIndex] })
  }

  const handlePause = () => {
    audioRef.current?.pause()
    setIsPlaying(false)
    ctx.emitEvent(componentId, 'playback-stopped', {})
  }

  // Next track
  const handleNext = () => {
    const next = (currentIndex + 1) % items.length
    setCurrentIndex(next)
    ctx.emitEvent(componentId, 'track-changed', { index: next })
  }

  return (
    <div>
      <audio
        ref={audioRef}
        src={items[currentIndex]?.url}
        onTimeUpdate={e => setCurrentTime(e.currentTime)}
        onLoadedMetadata={e => setDuration(e.duration)}
        onEnded={handleNext}
      />
      <button onClick={isPlaying ? handlePause : handlePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={handleNext}>Next</button>
      <div>{Math.floor(currentTime)} / {Math.floor(duration)}s</div>
    </div>
  )
}
```

---

## Resources

- [Full Guide](./COMPONENT_MESH_ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Examples](../src/examples)
- [Test Guide](./TESTING_GUIDE.md)

