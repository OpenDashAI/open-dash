# Composition Implementation Guide

**Status**: Implementation Ready
**Purpose**: Concrete code patterns for component-to-component reactivity

---

## 1. Create CompositionContext

**File**: `src/lib/composition-context.ts`

```typescript
import { createContext, ReactNode } from 'react'

export interface CompositionContext {
  // Register a component instance
  registerComponent(id: string, component: ComponentInstance): void

  // Get component's current state
  getComponentState(id: string): unknown

  // Listen for events from other components
  onComponentEvent(
    sourceId: string | 'any',  // 'any' = listen to all components
    event: string,
    handler: (payload: unknown) => void
  ): () => void  // returns unsubscribe function

  // Emit event
  emitEvent(id: string, event: string, payload: unknown): void

  // Find all components of a type
  findComponentsByType(type: string): ComponentInstance[]

  // Get all enabled component IDs
  getEnabledComponents(): string[]
}

export interface ComponentInstance {
  id: string
  type: string
  enabled: boolean
  state: unknown
  props: Record<string, unknown>
}

export const CompositionContextReact = createContext<CompositionContext | null>(null)
```

---

## 2. Implement CompositionContext Provider

**File**: `src/lib/composition-provider.tsx`

```typescript
import { useMemo, useCallback, useRef, useState, ReactNode } from 'react'
import { CompositionContext, CompositionContextReact, ComponentInstance } from './composition-context'

interface EventListener {
  sourceId: string | 'any'
  event: string
  handler: (payload: unknown) => void
}

export function CompositionProvider({ children }: { children: ReactNode }) {
  const componentsRef = useRef<Map<string, ComponentInstance>>(new Map())
  const listenersRef = useRef<EventListener[]>([])
  const [, setUpdateTrigger] = useState(0)

  const context: CompositionContext = useMemo(() => ({
    registerComponent: (id: string, component: ComponentInstance) => {
      componentsRef.current.set(id, component)
      setUpdateTrigger(prev => prev + 1)
    },

    getComponentState: (id: string) => {
      return componentsRef.current.get(id)?.state
    },

    onComponentEvent: (sourceId: string | 'any', event: string, handler) => {
      const listener: EventListener = { sourceId, event, handler }
      listenersRef.current.push(listener)

      // Return unsubscribe function
      return () => {
        const index = listenersRef.current.indexOf(listener)
        if (index > -1) {
          listenersRef.current.splice(index, 1)
        }
      }
    },

    emitEvent: (id: string, event: string, payload: unknown) => {
      // Find all listeners for this event
      listenersRef.current.forEach(listener => {
        if (
          (listener.sourceId === 'any' || listener.sourceId === id) &&
          listener.event === event
        ) {
          listener.handler(payload)
        }
      })
    },

    findComponentsByType: (type: string) => {
      return Array.from(componentsRef.current.values())
        .filter(c => c.type === type && c.enabled)
    },

    getEnabledComponents: () => {
      return Array.from(componentsRef.current.values())
        .filter(c => c.enabled)
        .map(c => c.id)
    },
  }), [])

  return (
    <CompositionContextReact.Provider value={context}>
      {children}
    </CompositionContextReact.Provider>
  )
}
```

---

## 3. Create useCompositionContext Hook

**File**: `src/hooks/useCompositionContext.ts`

```typescript
import { useContext } from 'react'
import { CompositionContextReact, CompositionContext } from '../lib/composition-context'

export function useCompositionContext(): CompositionContext {
  const context = useContext(CompositionContextReact)
  if (!context) {
    throw new Error(
      'useCompositionContext must be used within CompositionProvider'
    )
  }
  return context
}
```

---

## 4. Component Integration Pattern

**How a component uses CompositionContext**:

```typescript
import { useEffect, useState } from 'react'
import { useCompositionContext } from '../hooks/useCompositionContext'

interface ComposerProps {
  componentId: string
  tracks?: string[]
}

export function Composer({ componentId, tracks: initialTracks = [] }: ComposerProps) {
  const composition = useCompositionContext()
  const [tracks, setTracks] = useState(initialTracks)

  // Register this component instance
  useEffect(() => {
    composition.registerComponent(componentId, {
      id: componentId,
      type: 'composer',
      enabled: true,
      state: { tracks },
      props: { tracks: initialTracks },
    })
  }, [componentId, tracks, initialTracks, composition])

  // Listen for events from Transport
  useEffect(() => {
    return composition.onComponentEvent('transport', 'playback-started', () => {
      console.log('Transport started playing')
    })
  }, [composition])

  // Handle track added
  const handleAddTrack = (track: string) => {
    const newTracks = [...tracks, track]
    setTracks(newTracks)

    // Emit event so Transport and other components know
    composition.emitEvent(componentId, 'track-added', { track, allTracks: newTracks })
  }

  // Handle track removed
  const handleRemoveTrack = (trackIndex: number) => {
    const newTracks = tracks.filter((_, i) => i !== trackIndex)
    setTracks(newTracks)

    composition.emitEvent(componentId, 'track-removed', {
      trackIndex,
      allTracks: newTracks,
    })
  }

  return (
    <div className="composer">
      <h2>Composer</h2>
      <TrackList
        tracks={tracks}
        onAddTrack={handleAddTrack}
        onRemoveTrack={handleRemoveTrack}
      />
    </div>
  )
}
```

---

## 5. Transport Component Listening

```typescript
import { useEffect, useState } from 'react'
import { useCompositionContext } from '../hooks/useCompositionContext'

interface TransportProps {
  componentId: string
}

export function Transport({ componentId }: TransportProps) {
  const composition = useCompositionContext()
  const [tracks, setTracks] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  // Listen for track changes from Composer
  useEffect(() => {
    const unsubscribeTrackAdded = composition.onComponentEvent(
      'any',  // Listen to any component
      'track-added',
      (payload: any) => {
        setTracks(payload.allTracks)
      }
    )

    const unsubscribeTrackRemoved = composition.onComponentEvent(
      'any',
      'track-removed',
      (payload: any) => {
        setTracks(payload.allTracks)
      }
    )

    return () => {
      unsubscribeTrackAdded()
      unsubscribeTrackRemoved()
    }
  }, [composition])

  // Register component
  useEffect(() => {
    composition.registerComponent(componentId, {
      id: componentId,
      type: 'transport',
      enabled: true,
      state: { isPlaying, currentPosition: 0 },
      props: {},
    })
  }, [componentId, isPlaying, composition])

  const handlePlay = () => {
    setIsPlaying(true)
    // Emit event so Effects, Monitor, etc. know we're playing
    composition.emitEvent(componentId, 'playback-started', { tracks })
  }

  const handlePause = () => {
    setIsPlaying(false)
    composition.emitEvent(componentId, 'playback-stopped', {})
  }

  return (
    <div className="transport">
      <h2>Transport</h2>
      <div>Tracks loaded: {tracks.length}</div>
      <button onClick={handlePlay} disabled={isPlaying}>
        ▶ Play
      </button>
      <button onClick={handlePause} disabled={!isPlaying}>
        ⏸ Pause
      </button>
    </div>
  )
}
```

---

## 6. Effects Component Reacting

```typescript
import { useEffect, useState } from 'react'
import { useCompositionContext } from '../hooks/useCompositionContext'

export function Effects({ componentId }: { componentId: string }) {
  const composition = useCompositionContext()
  const [isActive, setIsActive] = useState(false)

  // Listen for playback events
  useEffect(() => {
    const unsubscribe = composition.onComponentEvent('transport', 'playback-started', () => {
      setIsActive(true)
    })

    return unsubscribe
  }, [composition])

  useEffect(() => {
    const unsubscribe = composition.onComponentEvent('transport', 'playback-stopped', () => {
      setIsActive(false)
    })

    return unsubscribe
  }, [composition])

  return (
    <div className="effects">
      <h2>Effects</h2>
      <div>Status: {isActive ? '🔴 Active' : '⚪ Inactive'}</div>
      <label>
        <input type="checkbox" disabled={!isActive} />
        Reverb
      </label>
      <label>
        <input type="checkbox" disabled={!isActive} />
        Delay
      </label>
    </div>
  )
}
```

---

## 7. Wire Up in App

**File**: Update main app component

```typescript
import { CompositionProvider } from './lib/composition-provider'
import { Composer } from './components/Composer'
import { Transport } from './components/Transport'
import { Effects } from './components/Effects'
import { MusicPlayerTemplate } from './templates/MusicPlayerTemplate'

function App() {
  return (
    <CompositionProvider>
      {/* Option 1: Manual composition for full control */}
      <div className="flex gap-4">
        <Composer componentId="composer-main" />
        <Transport componentId="transport-main" />
        <Effects componentId="effects-main" />
      </div>

      {/* Option 2: Template-based for quick start */}
      <MusicPlayerTemplate template="studio" />
    </CompositionProvider>
  )
}
```

---

## 8. Template System

**File**: `src/templates/MusicPlayerTemplate.tsx`

```typescript
import { useMemo } from 'react'
import { Composer } from '../components/Composer'
import { Transport } from '../components/Transport'
import { Effects } from '../components/Effects'
import { Mixer } from '../components/Mixer'
import { Export } from '../components/Export'

type TemplateType = 'studio' | 'dj' | 'simple'

interface TemplateConfig {
  components: Array<{ id: string; type: string; props: Record<string, unknown> }>
}

const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  studio: {
    components: [
      { id: 'composer-main', type: 'composer', props: { editing: 'full' } },
      { id: 'transport-main', type: 'transport', props: {} },
      { id: 'effects-main', type: 'effects', props: { maxChain: 16 } },
      { id: 'mixer-main', type: 'mixer', props: { channels: 32 } },
      { id: 'export-main', type: 'export', props: { formats: ['wav', 'mp3'] } },
    ],
  },
  dj: {
    components: [
      { id: 'player-1', type: 'player', props: { deckNumber: 1 } },
      { id: 'player-2', type: 'player', props: { deckNumber: 2 } },
      { id: 'crossfader', type: 'crossfader', props: {} },
      { id: 'effects-main', type: 'effects', props: { maxChain: 4 } },
    ],
  },
  simple: {
    components: [
      { id: 'player-main', type: 'player', props: { display: 'minimal' } },
      { id: 'progress-main', type: 'progress', props: {} },
      { id: 'volume-main', type: 'volume', props: {} },
    ],
  },
}

function ComponentRenderer({ type, id, props }: { type: string; id: string; props: any }) {
  const componentMap: Record<string, any> = {
    composer: Composer,
    transport: Transport,
    effects: Effects,
    mixer: Mixer,
    export: Export,
  }

  const Component = componentMap[type]
  if (!Component) return null

  return <Component componentId={id} {...props} />
}

export function MusicPlayerTemplate({ template }: { template: TemplateType }) {
  const config = useMemo(() => TEMPLATES[template], [template])

  return (
    <div className="music-player">
      <div className="components-grid">
        {config.components.map(comp => (
          <ComponentRenderer
            key={comp.id}
            type={comp.type}
            id={comp.id}
            props={comp.props}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 9. Feature Flags Integration

**File**: `src/lib/feature-flags-to-composition.ts`

```typescript
export interface FeatureFlags {
  [key: string]: boolean | string | number | string[]
}

export function featureFlagsToTemplate(flags: FeatureFlags) {
  const components = []

  // Conditionally add components based on feature flags
  if (flags['composer.enabled']) {
    components.push({
      id: 'composer-main',
      type: 'composer',
      props: { editing: flags['composer.editing'] || 'full' },
    })
  }

  if (flags['transport.enabled']) {
    components.push({
      id: 'transport-main',
      type: 'transport',
      props: { modes: flags['transport.modes'] || ['play', 'pause'] },
    })
  }

  if (flags['effects.enabled']) {
    components.push({
      id: 'effects-main',
      type: 'effects',
      props: { available: flags['effects.available'] || [] },
    })
  }

  // ... more components

  return components
}
```

---

## 10. Integration with Existing Card Registry

**File**: Update `src/lib/card-registry.tsx`

```typescript
import { CompositionProvider } from './composition-provider'

export function renderCardWithComposition(
  type: string,
  props: Record<string, unknown>,
  key: string
) {
  const Card = getCard(type)
  if (!Card) return null

  return (
    <CompositionProvider key={key}>
      <Card {...props} />
    </CompositionProvider>
  )
}
```

---

## Event Types (Examples)

```typescript
// Composer events
type ComposerEvent =
  | { type: 'track-added'; track: string; allTracks: string[] }
  | { type: 'track-removed'; trackIndex: number; allTracks: string[] }
  | { type: 'composition-saved'; compositionId: string }

// Transport events
type TransportEvent =
  | { type: 'playback-started'; tracks: string[] }
  | { type: 'playback-stopped' }
  | { type: 'position-changed'; position: number }

// Effects events
type EffectsEvent =
  | { type: 'effect-enabled'; effectName: string }
  | { type: 'effect-disabled'; effectName: string }
  | { type: 'effect-parameter-changed'; effectName: string; parameter: string; value: number }
```

---

## Testing Component Communication

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompositionProvider } from '../lib/composition-provider'
import { Composer } from '../components/Composer'
import { Transport } from '../components/Transport'

test('transport updates when composer adds track', async () => {
  render(
    <CompositionProvider>
      <Composer componentId="composer-1" />
      <Transport componentId="transport-1" />
    </CompositionProvider>
  )

  const addButton = screen.getByText('Add Track')
  fireEvent.click(addButton)

  await waitFor(() => {
    expect(screen.getByText(/Tracks loaded: 1/)).toBeInTheDocument()
  })
})
```

---

## Next Steps

1. **Implement CompositionContext** (1-2 days)
   - Create files from steps 1-3 above
   - Test event routing works

2. **Convert one component pair** (1 day)
   - Composer + Transport example
   - Verify they communicate seamlessly

3. **Add Feature Flags layer** (1-2 days)
   - Map feature flags to component configuration
   - Test that enabling/disabling components works

4. **Build Music Player templates** (1-2 days)
   - Studio template (all features)
   - DJ template (subset)
   - Simple template (minimal)

5. **Document event types** (1 day)
   - Create event type definitions for each component
   - Document event flow

---

**Status**: Ready to implement
**Estimated Time**: 1 week for full implementation
