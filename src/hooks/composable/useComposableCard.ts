import { useEffect, useState, useCallback } from 'react'
import { useCompositionContext } from '@opendash/composition'

export interface UseComposableCardOptions<T = unknown> {
  componentId: string
  listenToComponent?: string | 'any'
  initialData?: T | null
}

/**
 * Headless composition hook for card/detail behavior.
 *
 * Handles: registration, data from selection, action emission.
 * Returns data + action emitter. No JSX, no styling.
 *
 * Use with ANY styled card (shadcn Card, plain div, custom).
 */
export function useComposableCard<T = unknown>({
  componentId,
  listenToComponent = 'any',
  initialData = null,
}: UseComposableCardOptions<T>) {
  const ctx = useCompositionContext()
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)

  // Register with CompositionProvider
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'card',
      enabled: true,
      state: { hasData: data !== null, loading },
      props: { listenToComponent },
    })
  }, [componentId, data, loading, listenToComponent, ctx])

  // Listen for item-selected events
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'item-selected', (payload: unknown) => {
      const p = payload as { item?: T }
      if (p?.item !== undefined) {
        setData(p.item)
      }
    })
  }, [ctx, listenToComponent])

  // Listen for data-ready events
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'data-ready', (payload: unknown) => {
      const p = payload as { data?: T }
      if (p?.data !== undefined) {
        setData(p.data)
      }
    })
  }, [ctx, listenToComponent])

  // Emit action
  const emitAction = useCallback((action: string, payload?: unknown) => {
    ctx.emitEvent(componentId, 'card-action', { action, data, ...payload as object })
  }, [ctx, componentId, data])

  return {
    data,
    loading,
    hasData: data !== null,
    setData,
    setLoading,
    emitAction,
  }
}
