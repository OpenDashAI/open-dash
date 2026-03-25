import { createContext } from 'react'

/**
 * Represents a registered component instance in the composition system.
 *
 * Each component that participates in composition must register an instance
 * with the CompositionContext to enable communication with other components.
 */
export interface ComponentInstance {
  /** Unique identifier for this component instance */
  id: string

  /** Component type (e.g., 'composer', 'transport', 'effects') */
  type: string

  /** Is this component currently enabled/active? */
  enabled: boolean

  /** Current component state (can change over time) */
  state: unknown

  /** Component configuration from feature flags (unchanging) */
  props: Record<string, unknown>
}

/**
 * CompositionContext defines how components communicate seamlessly.
 *
 * Instead of components importing each other (tight coupling),
 * components communicate through events and shared context (loose coupling).
 *
 * Pattern:
 *   Composer emits 'track-added' event
 *   ↓
 *   CompositionContext routes the event
 *   ↓
 *   Transport, Effects, Export listen and update
 *
 * This enables seamless component composition without direct dependencies.
 */
export interface CompositionContext {
  /**
   * Register a component instance with the context.
   *
   * Called when a component mounts. Allows the context to track the component
   * and enable other components to find it by type or ID.
   *
   * @param id - Unique component instance ID (e.g., 'composer-main')
   * @param component - Component instance information
   *
   * @example
   * ```tsx
   * const ctx = useCompositionContext()
   * useEffect(() => {
   *   ctx.registerComponent('composer-1', {
   *     id: 'composer-1',
   *     type: 'composer',
   *     enabled: true,
   *     state: { items: [...] },
   *     props: { editing: 'full' }
   *   })
   * }, [])
   * ```
   */
  registerComponent(id: string, component: ComponentInstance): void

  /**
   * Get a component's current state by its ID.
   *
   * @param id - Component instance ID
   * @returns Component state, or undefined if component not found
   *
   * @example
   * ```tsx
   * const composerState = ctx.getComponentState('composer-1')
   * ```
   */
  getComponentState(id: string): unknown

  /**
   * Listen for events from components.
   *
   * When another component (or any component if sourceId is 'any') emits
   * an event, the provided handler will be called with the event payload.
   *
   * @param sourceId - Component ID to listen to, or 'any' to listen to all components
   * @param event - Event name (e.g., 'track-added', 'playback-started')
   * @param handler - Function called when event is emitted
   * @returns Unsubscribe function - call to remove listener and prevent memory leaks
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   // Listen to Composer's 'track-added' event
   *   const unsubscribe = ctx.onComponentEvent(
   *     'composer-1',
   *     'track-added',
   *     (payload) => {
   *       console.log('Track added:', payload)
   *       setTracks(payload.allTracks)
   *     }
   *   )
   *
   *   // Clean up when component unmounts
   *   return () => unsubscribe()
   * }, [ctx])
   * ```
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   // Listen to ANY component emitting 'playback-started'
   *   const unsubscribe = ctx.onComponentEvent(
   *     'any',
   *     'playback-started',
   *     (payload) => {
   *       console.log('Playback started')
   *       setIsActive(true)
   *     }
   *   )
   *
   *   return () => unsubscribe()
   * }, [ctx])
   * ```
   */
  onComponentEvent(
    sourceId: string | 'any',
    event: string,
    handler: (payload: unknown) => void
  ): () => void

  /**
   * Emit an event from this component.
   *
   * Other components listening for this event will have their handlers called.
   * The event is identified by both the source component ID and the event name.
   *
   * @param id - Component instance ID (source of the event)
   * @param event - Event name (e.g., 'track-added', 'playback-started')
   * @param payload - Data to send with the event
   *
   * @example
   * ```tsx
   * function handleAddTrack(track: string) {
   *   const newTracks = [...tracks, track]
   *   setTracks(newTracks)
   *
   *   // Emit event so Transport, Effects, Export know about the new track
   *   ctx.emitEvent('composer-1', 'track-added', {
   *     track,
   *     allTracks: newTracks
   *   })
   * }
   * ```
   */
  emitEvent(id: string, event: string, payload: unknown): void

  /**
   * Find all enabled components of a specific type.
   *
   * Useful for discovering sibling components or aggregating state
   * from multiple components of the same type.
   *
   * @param type - Component type (e.g., 'transport', 'effects')
   * @returns Array of matching component instances, empty if none found
   *
   * @example
   * ```tsx
   * // Find all Transport components to coordinate them
   * const transports = ctx.findComponentsByType('transport')
   * transports.forEach(transport => {
   *   // Do something with each transport
   * })
   * ```
   */
  findComponentsByType(type: string): ComponentInstance[]

  /**
   * Get all currently enabled component IDs.
   *
   * Useful for checking which components are active or iterating
   * over all components.
   *
   * @returns Array of enabled component IDs
   *
   * @example
   * ```tsx
   * const enabledIds = ctx.getEnabledComponents()
   * console.log(`${enabledIds.length} components are active`)
   * ```
   */
  getEnabledComponents(): string[]
}

/**
 * React Context object for accessing CompositionContext.
 *
 * This is created by CompositionProvider and provides access to
 * the context throughout the component tree via useContext() or
 * the useCompositionContext() hook.
 *
 * @internal Consumers should use useCompositionContext() hook instead
 */
export const CompositionContextReact = createContext<CompositionContext | null>(null)
