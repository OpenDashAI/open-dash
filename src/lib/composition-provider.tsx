'use client'

import { type ReactNode, useMemo, useCallback, useRef, useState } from 'react'
import {
  type CompositionContext,
  CompositionContextReact,
  type ComponentInstance,
} from './composition-context'

/**
 * Event listener entry - tracks who is listening to what events
 */
interface EventListener {
  /** Component ID listening to, or 'any' for all */
  sourceId: string | 'any'
  /** Event name to listen for */
  event: string
  /** Callback function */
  handler: (payload: unknown) => void
}

/**
 * CompositionProvider - React Context provider that implements CompositionContext.
 *
 * Manages:
 * - Component registration and discovery
 * - Event emission and routing
 * - Listener subscription and cleanup
 * - Performance optimization (uses refs, not state)
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <CompositionProvider>
 *       <Composer componentId="composer-1" />
 *       <Transport componentId="transport-1" />
 *       <Effects componentId="effects-1" />
 *     </CompositionProvider>
 *   )
 * }
 * ```
 */
export function CompositionProvider({ children }: { children: ReactNode }) {
  // Use refs for performance - component registry and listeners don't trigger re-renders
  const componentsRef = useRef<Map<string, ComponentInstance>>(new Map())
  const listenersRef = useRef<EventListener[]>([])

  // State trigger - needed to notify context consumers of changes
  // We use this sparingly to avoid unnecessary re-renders
  const [, setUpdateTrigger] = useState(0)

  /**
   * Trigger subscribers to re-evaluate context.
   * Called after registerComponent updates occur.
   */
  const notifySubscribers = useCallback(() => {
    setUpdateTrigger(prev => prev + 1)
  }, [])

  /**
   * Implementation of CompositionContext interface
   */
  const context: CompositionContext = useMemo(() => ({
    registerComponent: (id: string, component: ComponentInstance) => {
      componentsRef.current.set(id, component)
      notifySubscribers()
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
      // Find all listeners for this event and call their handlers
      listenersRef.current.forEach(listener => {
        // Match if:
        // 1. Listener is listening to this specific component, OR
        // 2. Listener is listening to 'any' component
        if (
          (listener.sourceId === 'any' || listener.sourceId === id) &&
          listener.event === event
        ) {
          try {
            listener.handler(payload)
          } catch (error) {
            // Log errors but don't let one listener's error break others
            console.error(
              `Error in event listener for ${event} from ${id}:`,
              error
            )
          }
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
  }), [notifySubscribers])

  return (
    <CompositionContextReact.Provider value={context}>
      {children}
    </CompositionContextReact.Provider>
  )
}
