import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface FilterProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Which component's selection to listen to */
  listenToComponent?: string | 'any'
  /** Filter label */
  label?: string
}

/**
 * Filter Component - Applies text-based filtering to selected items.
 *
 * This component demonstrates:
 * - Listening to selection-changed events from DataSelector
 * - Processing data from other components
 * - Applying local transformations (text filter)
 * - Emitting filtered results for Display component
 *
 * Filter listens to DataSelector and processes the selected items,
 * then Display listens to Filter to show the final results.
 */
export function Filter({
  componentId,
  listenToComponent = 'any',
  label = 'Filter Results',
}: FilterProps) {
  const ctx = useCompositionContext()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filterText, setFilterText] = useState('')

  // Register this component with the context
  useEffect(() => {
    const filteredItems = selectedItems.filter(item =>
      item.toLowerCase().includes(filterText.toLowerCase())
    )

    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'filter',
      enabled: true,
      state: {
        selectedItems,
        filterText,
        filteredCount: filteredItems.length,
      },
      props: { label, listenToComponent },
    })
  }, [componentId, selectedItems, filterText, label, listenToComponent, ctx])

  // Listen for selection-changed events from DataSelector
  useEffect(() => {
    return ctx.onComponentEvent(
      listenToComponent,
      'selection-changed',
      (payload: any) => {
        if (payload?.selectedItems) {
          setSelectedItems(payload.selectedItems)

          // Emit filtered results
          const filtered = payload.selectedItems.filter((item: string) =>
            item.toLowerCase().includes(filterText.toLowerCase())
          )
          ctx.emitEvent(componentId, 'filter-updated', {
            filteredItems: filtered,
            filterText,
            selectedCount: payload.selectedItems.length,
          })
        }
      }
    )
  }, [ctx, listenToComponent, filterText, componentId])

  /**
   * Handle filter text change
   */
  const handleFilterChange = (text: string) => {
    setFilterText(text)

    // Emit updated filter results
    const filtered = selectedItems.filter(item =>
      item.toLowerCase().includes(text.toLowerCase())
    )
    ctx.emitEvent(componentId, 'filter-updated', {
      filteredItems: filtered,
      filterText: text,
      selectedCount: selectedItems.length,
    })
  }

  const filtered = selectedItems.filter(item =>
    item.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3 p-4 border border-blue-200 rounded-lg bg-white">
      {/* Header */}
      <div className="text-sm font-medium text-gray-700">{label}</div>

      {/* Filter Input */}
      <input
        type="text"
        value={filterText}
        onChange={e => handleFilterChange(e.target.value)}
        placeholder="Search selected items..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      {/* Filter Results */}
      <div className="text-xs text-gray-600">
        {selectedItems.length === 0 ? (
          <span>No items selected</span>
        ) : (
          <span>
            Showing {filtered.length} of {selectedItems.length} selected items
          </span>
        )}
      </div>

      {/* Clear Filter */}
      {filterText && (
        <button
          onClick={() => handleFilterChange('')}
          className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium"
        >
          Clear Filter
        </button>
      )}
    </div>
  )
}
