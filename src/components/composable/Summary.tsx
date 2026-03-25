import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface SummaryProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Which component's display data to listen to */
  listenToComponent?: string | 'any'
  /** Summary label */
  label?: string
}

/**
 * Summary Component - Shows aggregate statistics about displayed data.
 *
 * This component demonstrates:
 * - Listening to display-ready events from Display
 * - Computing statistics from received data
 * - Displaying summary information
 * - Final component in a multi-stage pipeline
 *
 * Summary listens to Display component and computes statistics
 * to show aggregate information about the filtered results.
 */
export function Summary({
  componentId,
  listenToComponent = 'any',
  label = 'Summary',
}: SummaryProps) {
  const ctx = useCompositionContext()
  const [itemCount, setItemCount] = useState(0)
  const [items, setItems] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'summary',
      enabled: true,
      state: {
        itemCount,
        lastUpdated: lastUpdated?.toISOString(),
      },
      props: { label, listenToComponent },
    })
  }, [componentId, itemCount, lastUpdated, label, listenToComponent, ctx])

  // Listen for display-ready events from Display
  useEffect(() => {
    return ctx.onComponentEvent(
      listenToComponent,
      'display-ready',
      (payload: any) => {
        if (payload?.items) {
          setItemCount(payload.itemCount)
          setItems(payload.items)
          setLastUpdated(new Date())

          // Emit summary-ready event
          ctx.emitEvent(componentId, 'summary-ready', {
            totalCount: payload.itemCount,
            items: payload.items,
            timestamp: new Date().toISOString(),
          })
        }
      }
    )
  }, [ctx, listenToComponent, componentId])

  // Compute statistics
  const avgLength =
    items.length > 0
      ? (items.reduce((sum, item) => sum + item.length, 0) / items.length).toFixed(1)
      : 0

  const longestItem = items.length > 0
    ? items.reduce((longest, item) => (item.length > longest.length ? item : longest))
    : null

  const shortestItem = items.length > 0
    ? items.reduce((shortest, item) => (item.length < shortest.length ? item : shortest))
    : null

  return (
    <div className="flex flex-col gap-3 p-4 border border-orange-200 rounded-lg bg-white">
      {/* Header */}
      <div className="text-sm font-medium text-gray-700">{label}</div>

      {/* Statistics Grid */}
      {itemCount > 0 ? (
        <div className="space-y-3">
          {/* Total Count */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
            <span className="text-sm text-gray-700">Total Items</span>
            <span className="text-lg font-bold text-orange-600">{itemCount}</span>
          </div>

          {/* Average Length */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
            <span className="text-sm text-gray-700">Avg Item Length</span>
            <span className="text-lg font-bold text-blue-600">{avgLength}</span>
          </div>

          {/* Longest Item */}
          {longestItem && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-sm text-gray-700">Longest</span>
              <span className="text-sm font-medium text-green-700 truncate ml-2">
                {longestItem}
              </span>
            </div>
          )}

          {/* Shortest Item */}
          {shortestItem && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
              <span className="text-sm text-gray-700">Shortest</span>
              <span className="text-sm font-medium text-purple-700 truncate ml-2">
                {shortestItem}
              </span>
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-gray-500 text-right">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-6">
          No data available
        </div>
      )}
    </div>
  )
}
