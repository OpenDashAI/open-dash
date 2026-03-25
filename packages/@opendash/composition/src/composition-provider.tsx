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
 * import { CompositionProvider } from '@opendash/composition'
 *
 * function App() {
 *   return (
 *     <CompositionProvider>
 *       <Composer componentId="composer-1" />
 *       <Transport componentId="transport-1" />
 *     </CompositionProvider>
 *   )
 * }
 * ```
 */
export function CompositionProvider({ children }: { children: ReactNode }) {
  const componentsRef = useRef<Map<string, ComponentInstance>>(new Map())
  const listenersRef = useRef<EventListener[]>([])
  const [, setUpdateTrigger] = useState(0)

  const notifySubscribers = useCallback(() => {
    setUpdateTrigger(prev => prev + 1)
  }, [])

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

      return () => {
        const index = listenersRef.current.indexOf(listener)
        if (index > -1) {
          listenersRef.current.splice(index, 1)
        }
      }
    },

    emitEvent: (id: string, event: string, payload: unknown) => {
      listenersRef.current.forEach(listener => {
        if (
          (listener.sourceId === 'any' || listener.sourceId === id) &&
          listener.event === event
        ) {
          try {
            listener.handler(payload)
          } catch (error) {
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
