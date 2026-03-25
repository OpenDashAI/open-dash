# Start Here: Task #109 - CompositionContext Interface

**Status**: Ready to begin
**Time Estimate**: 1-2 hours
**Risk Level**: Very low (types only, no implementation)
**GitHub Issue**: #109

---

## What We're Building

The interface that defines how components talk to each other.

This is **not** an implementation. Just the TypeScript types and interface that the provider will implement.

---

## File to Create

```
src/lib/composition-context.ts
```

---

## Step 1: Understand the Interface

Components need to:
1. **Register themselves** with a name/ID
2. **Emit events** when something happens ("item-added", "playback-started")
3. **Listen to events** from other components
4. **Unsubscribe** from events when component unmounts
5. **Find other components** by type (e.g., "find all Transport components")

The CompositionContext provides these capabilities.

---

## Step 2: Write the Interface

**File**: `src/lib/composition-context.ts`

```typescript
import { createContext, ReactNode } from 'react'

/**
 * Represents a registered component instance.
 */
export interface ComponentInstance {
  id: string                        // Unique ID for this component instance
  type: string                      // Component type (e.g., 'composer', 'transport')
  enabled: boolean                  // Is this component active?
  state: unknown                    // Current component state
  props: Record<string, unknown>   // Component configuration
}

/**
 * CompositionContext defines how components communicate seamlessly.
 *
 * Components don't import each other. They communicate through events and context.
 * Example:
 *   Composer emits 'track-added' → Transport listens and updates
 *   Transport emits 'playback-started' → Effects listens and activates
 */
export interface CompositionContext {
  /**
   * Register a component instance with the context.
   * Called by components when they mount.
   *
   * @param id - Unique component instance ID
   * @param component - Component instance information
   */
  registerComponent(id: string, component: ComponentInstance): void

  /**
   * Get a component's current state by ID.
   *
   * @param id - Component instance ID
   * @returns Component state, or undefined if not registered
   */
  getComponentState(id: string): unknown

  /**
   * Listen for events from components.
   *
   * @param sourceId - Component ID to listen to, or 'any' for all components
   * @param event - Event name (e.g., 'track-added', 'playback-started')
   * @param handler - Function called when event fires
   * @returns Unsubscribe function - call to remove listener
   *
   * Example:
   *   const unsubscribe = onComponentEvent('composer-1', 'track-added', (payload) => {
   *     console.log('Track added:', payload)
   *   })
   *
   *   // Clean up when component unmounts
   *   return () => unsubscribe()
   */
  onComponentEvent(
    sourceId: string | 'any',
    event: string,
    handler: (payload: unknown) => void
  ): () => void

  /**
   * Emit an event from a component.
   * Other components listening for this event will be notified.
   *
   * @param id - Component instance ID (source of event)
   * @param event - Event name
   * @param payload - Data to send with event
   *
   * Example:
   *   emitEvent('composer-1', 'track-added', { track: 'song.mp3', allTracks: [...] })
   */
  emitEvent(id: string, event: string, payload: unknown): void

  /**
   * Find all enabled components of a specific type.
   *
   * @param type - Component type (e.g., 'transport')
   * @returns Array of matching component instances
   *
   * Example:
   *   const transports = findComponentsByType('transport')
   */
  findComponentsByType(type: string): ComponentInstance[]

  /**
   * Get all currently enabled component IDs.
   *
   * @returns Array of enabled component IDs
   */
  getEnabledComponents(): string[]
}

/**
 * React Context object for accessing CompositionContext.
 * Created by CompositionProvider.
 */
export const CompositionContextReact = createContext<CompositionContext | null>(null)
```

---

## Step 3: Verify the Interface

Check that your file:
- ✅ Defines `ComponentInstance` interface
- ✅ Defines `CompositionContext` interface
- ✅ Has all 6 methods in CompositionContext:
  - `registerComponent()`
  - `getComponentState()`
  - `onComponentEvent()`
  - `emitEvent()`
  - `findComponentsByType()`
  - `getEnabledComponents()`
- ✅ Creates `CompositionContextReact` context object
- ✅ All methods have JSDoc comments explaining usage
- ✅ No TypeScript errors

---

## Step 4: Test It

Create a quick test file to verify the types work:

**File**: `src/lib/composition-context.test.ts`

```typescript
import { CompositionContext, ComponentInstance, CompositionContextReact } from './composition-context'

describe('CompositionContext', () => {
  it('should have all required methods', () => {
    // This is a type test - just checks that the interface is correct
    type Methods = keyof CompositionContext

    const methods: Methods[] = [
      'registerComponent',
      'getComponentState',
      'onComponentEvent',
      'emitEvent',
      'findComponentsByType',
      'getEnabledComponents',
    ]

    expect(methods.length).toBe(6)
  })

  it('should export CompositionContextReact', () => {
    expect(CompositionContextReact).toBeDefined()
  })

  it('should define ComponentInstance interface', () => {
    const instance: ComponentInstance = {
      id: 'test-1',
      type: 'composer',
      enabled: true,
      state: {},
      props: {},
    }

    expect(instance.id).toBe('test-1')
    expect(instance.type).toBe('composer')
  })
})
```

Run:
```bash
npm test composition-context.test.ts
```

---

## Step 5: Checklist

Before marking done:

- [ ] File created: `src/lib/composition-context.ts`
- [ ] `ComponentInstance` interface defined with all fields
- [ ] `CompositionContext` interface defined with all 6 methods
- [ ] All methods have JSDoc comments
- [ ] `CompositionContextReact` context created
- [ ] Test file created and passing
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Can import successfully: `import { CompositionContext } from './composition-context'`

---

## What Gets Built on This

Once this interface is done, the next task (#110) implements it in `CompositionProvider`.

The provider will:
- Create the actual event listener registry
- Implement the routing logic
- Provide a React Context provider component
- Be tested with unit tests

---

## Key Design Decisions

**Why `onComponentEvent()` returns an unsubscribe function?**
- Allows cleanup in `useEffect` return
- Prevents memory leaks from listeners
- Simple pattern: `useEffect(() => { return unsubscribe() })`

**Why `sourceId` can be 'any'?**
- Sometimes components listen to ANY component's event
- Example: Effects listens to "any component" emitting 'track-added'
- More flexible than specifying exact source

**Why `findComponentsByType()`?**
- Find sibling components (e.g., "find all other transports")
- Useful for aggregating state from similar components
- Enables component discovery without hardcoding IDs

**Why separate `state` and `props`?**
- `props` = configuration from feature flags (unchanging)
- `state` = current component state (changes over time)
- Allows components to coordinate on state changes

---

## Questions?

This interface defines how components talk to each other. It's intentionally simple:
- No dependency injection
- No middleware
- No built-in logging
- Just event routing and state access

The implementation (#110) will add the complexity. This file is just the contract.

---

## Next: Task #110

Once #109 is done, move to #110: `CompositionProvider` implementation.

The provider will implement this interface and provide a React Context wrapper.

---

**Ready? Create `src/lib/composition-context.ts` and test it!**
