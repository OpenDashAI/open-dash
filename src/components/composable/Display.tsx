import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface DisplayProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Which component's filtered data to listen to */
  listenToComponent?: string | 'any'
  /** Display label */
  label?: string
}

/**
 * Display Component - Shows filtered items from Filter component.
 *
 * This component demonstrates:
 * - Listening to filter-updated events from Filter
 * - Displaying processed data
 * - Emitting view-related events (item selected, etc.)
 * - Working in a multi-component pipeline
 *
 * Display receives filtered data from Filter and shows it in a table format.
 */
export function Display({
  componentId,
  listenToComponent = 'any',
  label = 'Results',
}: DisplayProps) {
  const ctx = useCompositionContext()
  const [filteredItems, setFilteredItems] = useState<string[]>([])
  const [filterText, setFilterText] = useState('')
  const [selectedCount, setSelectedCount] = useState(0)

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'display',
      enabled: true,
      state: {
        displayCount: filteredItems.length,
        filterText,
        selectedCount,
      },
      props: { label, listenToComponent },
    })
  }, [componentId, filteredItems.length, filterText, selectedCount, label, listenToComponent, ctx])

  // Listen for filter-updated events from Filter
  useEffect(() => {
    return ctx.onComponentEvent(
      listenToComponent,
      'filter-updated',
      (payload: any) => {
        if (payload?.filteredItems) {
          setFilteredItems(payload.filteredItems)
          setFilterText(payload.filterText || '')
          setSelectedCount(payload.selectedCount || 0)

          // Emit display-ready event so other components know data is ready
          ctx.emitEvent(componentId, 'display-ready', {
            itemCount: payload.filteredItems.length,
            items: payload.filteredItems,
          })
        }
      }
    )
  }, [ctx, listenToComponent, componentId])

  return (
    <div className="flex flex-col gap-3 p-4 border border-green-200 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-500">
          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter Info */}
      {filterText && (
        <div className="text-xs text-gray-600 bg-yellow-50 px-2 py-1 rounded">
          Filter: "<span className="font-medium">{filterText}</span>"
        </div>
      )}

      {/* Results Table */}
      {filteredItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-2 font-medium text-gray-700">Item</th>
                <th className="text-right px-3 py-2 font-medium text-gray-700 w-20">Index</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2 text-gray-800">{item}</td>
                  <td className="px-3 py-2 text-right text-gray-500">{index + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedCount > 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">
          No results match your filter
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-8">
          Select items above to see results
        </div>
      )}

      {/* Summary */}
      <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
        <span>
          {filteredItems.length === 0
            ? 'Waiting for data...'
            : `Displaying ${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  )
}
