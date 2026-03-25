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
   * Called when a component mounts.
   */
  registerComponent(id: string, component: ComponentInstance): void

  /**
   * Get a component's current state by its ID.
   */
  getComponentState(id: string): unknown

  /**
   * Listen for events from components.
   *
   * @param sourceId - Component ID to listen to, or 'any' to listen to all
   * @param event - Event name (e.g., 'track-added', 'playback-started')
   * @param handler - Callback when event fires
   * @returns Unsubscribe function
   */
  onComponentEvent(
    sourceId: string | 'any',
    event: string,
    handler: (payload: unknown) => void
  ): () => void

  /**
   * Emit an event from this component.
   *
   * @param id - Source component ID
   * @param event - Event name
   * @param payload - Data to send
   */
  emitEvent(id: string, event: string, payload: unknown): void

  /**
   * Find all enabled components of a specific type.
   */
  findComponentsByType(type: string): ComponentInstance[]

  /**
   * Get all currently enabled component IDs.
   */
  getEnabledComponents(): string[]
}

/**
 * React Context for accessing CompositionContext.
 * Consumers should use useCompositionContext() hook instead.
 */
export const CompositionContextReact = createContext<CompositionContext | null>(null)
