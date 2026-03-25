# Component Reactivity Architecture

**Date**: 2026-03-25
**Status**: Design Document
**Purpose**: Define how independently-composed components communicate seamlessly and feel native

---

## Core Insight

**The app IS the feature flags + component configuration.** The app is:
- A set of feature flags (which components are enabled)
- A set of component configurations (how each component is set up)
- A styling/layout configuration (which layout components are active)

**The hard problem**: Making composed components react to each other seamlessly—they should be indistinguishable from handcrafted apps.

---

## Current Architecture

### Card Registry Pattern (Composition)
```
AI Response → Card Directives → Registry Lookup → Component Render
```

**Current file**: `src/lib/card-registry.tsx`

Components registered by type (machine_card, brand_card, etc.) are dynamically rendered. The registry enables pluggable components.

### HUD Store Pattern (State)
```
Global State → useSyncExternalStore → Components Subscribe → Re-render
```

**Current file**: `src/lib/hud-store.ts`

Centralized state with:
- `useHudState()` - Subscribe to full state
- `useHudSelect(selector)` - Subscribe to state slices (fine-grained updates)
- `emit()` - Notify all subscribers on state changes

This prevents unnecessary re-renders and allows components to coordinate.

---

## Problem: Component Isolation

### Current Behavior
```
Component A          Component B          Component C
     ↓                    ↓                    ↓
useHudState() ← → useHudState() ← → useHudState()
     ↓                    ↓                    ↓
Reads/writes        Reads/writes        Reads/writes
global state        global state        global state
```

**Issues**:
- Components read from global state (no component-level encapsulation)
- No way for Component A to say "when I change, Component B should update"
- No natural way to pass data between components
- Composition is purely visual (layout), not logical (behavior)

### Example: Music Player Complexity
```
Scenario: User adds a track in Composer → should update Transport controls

Current way:
  1. Composer updates global state (tracks[])
  2. Transport reads tracks[] and re-renders

Problem: What if you have:
  - Multiple composers (one for main, one for chorus)
  - Multiple transports (one for preview, one for export)
  - Filter components that only show some tracks
  - Effects components that transform tracks

Each needs to know which "track pool" to use. Global state becomes a mess.
```

---

## Solution: Component-Level Reactivity

### 1. Component Interface

Each component declares:
- **Props**: Configuration from feature flags
- **Events**: What this component can emit
- **Slots**: Where child components can be placed
- **Dependencies**: What other components or data it needs

```typescript
interface ComponentInterface {
  id: string                      // Unique component instance ID
  type: string                    // Component type (machine_card, etc.)
  props: Record<string, unknown>  // Configuration from feature flags
  events: Record<string, (...args: any[]) => void>  // Available events
  slots: Record<string, ReactNode>  // Child components
  dependencies: string[]          // Component IDs this depends on
}
```

### 2. Composition Context

When components are composed, they share a **Composition Context** that:
- Routes events between components
- Provides data access to dependent components
- Coordinates behavior

```typescript
interface CompositionContext {
  // Get another component's current state
  getComponentState(componentId: string): unknown

  // Listen for events from other components
  onComponentEvent(
    sourceComponentId: string,
    eventName: string,
    handler: (payload: unknown) => void
  ): () => void  // unsubscribe

  // Emit event that other components can listen to
  emitEvent(componentId: string, eventName: string, payload: unknown): void

  // Get components by type (for finding siblings)
  findComponentsOfType(type: string): ComponentInterface[]
}
```

### 3. Feature Flags Control Composition

Feature flags determine:
- **Which components are enabled** (only enabled components are rendered)
- **How components are connected** (which events route to which components)
- **Component configuration** (props passed to each component)

```typescript
// Example: Music Player app composition defined by feature flags

const featureFlags = {
  // Components to enable
  'composer.enabled': true,
  'composer.type': 'monophonic',  // affects props

  'transport.enabled': true,
  'transport.modes': ['play', 'pause', 'forward', 'backward'],

  'effects.enabled': true,
  'effects.available': ['reverb', 'delay', 'compression'],

  'export.enabled': true,
  'export.formats': ['wav', 'mp3'],

  // How components connect
  'composer->transport.connection': 'auto',  // composer changes trigger transport update
  'transport->effects.connection': 'auto',
  'effects->export.connection': 'auto',
}

// This same feature flag set can create:
// - Full music studio (all enabled, all connections active)
// - DJ system (subset of components, different connections)
// - Simple player (minimal components, direct connections)
```

### 4. Component-to-Component Event Flow

```
Composer emits 'track-added' event
         ↓
Composition Context routes to listeners
         ↓
Transport, Effects, Export all listen for 'track-added'
         ↓
Each updates its own state via useCompositionContext()
         ↓
Components re-render with new data
```

**Key**: Components don't import each other. They communicate through the Composition Context.

---

## Implementation Strategy

### Phase 1: Core Infrastructure
1. **Create CompositionContext provider**
   - Wraps composed component tree
   - Manages event routing
   - Maintains component registry

2. **Create useCompositionContext() hook**
   - Components access the context
   - Get other components' state
   - Listen/emit events

3. **Extend HUD Store with component-level state**
   - Still centralized
   - But organized by component ID
   - Enables fine-grained reactivity

### Phase 2: Refactor Existing Components
1. Convert card components to use CompositionContext
2. Define event interfaces for each component type
3. Update card-registry to pass context to components

### Phase 3: Feature Flag Integration
1. Map feature flags to component configuration
2. Feature flags determine which components render
3. Feature flags determine which event routes are active

### Phase 4: Template System
1. Pre-built feature flag combinations (templates)
   - "Music Studio" template (all features)
   - "DJ System" template (subset)
   - "Simple Player" template (minimal)

2. Users customize by modifying feature flags

---

## Example: Seamless Component Integration

### Goal: Same components, different apps

**Template 1: Music Studio**
```typescript
{
  enabledComponents: ['composer', 'transport', 'effects', 'mixer', 'export'],
  componentProps: {
    composer: { tracks: 'all', editing: 'full' },
    effects: { maxChain: 16 },
    mixer: { channels: 32 },
  },
  componentConnections: {
    'composer->transport': true,    // composer changes trigger transport
    'composer->effects': true,
    'effects->mixer': true,
    'mixer->export': true,
  }
}
```

**Template 2: DJ System**
```typescript
{
  enabledComponents: ['player', 'crossfader', 'effects', 'monitor'],
  componentProps: {
    player: { numDecks: 2 },
    effects: { maxChain: 4 },
    monitor: { visualization: 'waveform' },
  },
  componentConnections: {
    'player->crossfader': true,
    'crossfader->effects': true,
    'effects->monitor': true,
  }
}
```

**Template 3: Simple Player**
```typescript
{
  enabledComponents: ['player', 'progress', 'volume'],
  componentProps: {
    player: { numDecks: 1, display: 'minimal' },
  },
  componentConnections: {
    // Minimal connections - mostly UI updates
  }
}
```

### How This Works

1. **Same code** powers all three
2. **Feature flags** determine which components render
3. **Component interface** defines how components connect
4. **CompositionContext** enables communication
5. **Result**: Three different experiences that feel handcrafted

---

## Avoiding Tight Coupling

### Anti-Pattern (Direct Import)
```typescript
// ❌ BAD: Component imports another directly
import { Transport } from './Transport'

export function Composer() {
  return (
    <Transport tracks={selectedTracks} />
  )
}
```

**Problems**:
- Hard to compose differently
- Feature flags can't easily disable Transport
- Circular dependencies possible

### Pattern (Event-Based)
```typescript
// ✅ GOOD: Components communicate via events

export function Composer() {
  const { emitEvent } = useCompositionContext()

  function handleTrackAdded(track) {
    // Emit event - Transport (if enabled) listens
    emitEvent('track-added', track)
  }

  return <ComposerUI onTrackAdded={handleTrackAdded} />
}

export function Transport() {
  const { onComponentEvent } = useCompositionContext()
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    return onComponentEvent('any', 'track-added', (track) => {
      setTracks(prev => [...prev, track])
    })
  }, [])

  return <TransportUI tracks={tracks} />
}
```

---

## Shadcn Integration

### What shadcn Provides
- Base UI components: Button, Input, Card, Dialog, Dropdown, etc.
- Consistent styling with CSS variables
- Accessibility built-in
- Composable primitives

### How We Extend It
1. **Base Layer**: shadcn components (Button, Input, etc.)
2. **Domain Layer**: Domain-specific components (Composer, Transport, etc.)
3. **Composition Layer**: How domain components work together (CompositionContext)

```
shadcn UI Components (Button, Input, etc.)
         ↓
Domain Components (Composer, Transport, Effects)
         ↓
Composition Context (Events, state routing)
         ↓
Feature Flags (Which components enabled, how they connect)
         ↓
Templates (Pre-built configurations)
         ↓
User Customization (Modify templates or build from scratch)
```

---

## Key Files to Create/Modify

**New Files**:
- `src/lib/composition-context.ts` - CompositionContext implementation
- `src/hooks/useCompositionContext.ts` - Hook for component access
- `src/types/component-interface.ts` - Component interface definitions
- `src/lib/feature-flags-to-composition.ts` - Map feature flags to component config
- `src/lib/templates/` - Pre-built app templates

**Existing Files to Extend**:
- `src/lib/card-registry.tsx` - Add composition context
- `src/lib/hud-store.ts` - Add component-level state organization
- Component files - Update to use CompositionContext and events

---

## Success Criteria

✅ Components can communicate without direct imports
✅ Feature flags control which components are enabled
✅ Feature flags control how components connect
✅ Same components create different app experiences
✅ Composed components feel native (no seams)
✅ No prop drilling beyond 2-3 levels
✅ Templates enable quick-start
✅ Users can customize by modifying feature flags

---

## Next Actions

1. **Implement CompositionContext**
   - Design event routing system
   - Design component state organization

2. **Create useCompositionContext hook**
   - Provide event emit/listen API
   - Provide component state access

3. **Map Feature Flags to Composition**
   - Feature flags define enabled components
   - Feature flags define component connections

4. **Test with Music Player Example**
   - Implement three templates (Studio, DJ, Simple)
   - Verify seamless composition

---

**Status**: Ready for implementation
**Owner**: Architecture Phase
**Timeline**: 1-2 weeks for core infrastructure
