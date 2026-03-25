import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface DataSelectorProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Initial items to display */
  items?: string[]
  /** Label for the selector */
  label?: string
}

/**
 * DataSelector Component - Displays available data items for selection.
 *
 * This component demonstrates:
 * - Registering with CompositionContext
 * - Managing a list of selectable items
 * - Emitting events when items are selected/deselected
 * - Working with Filter and Display components
 *
 * Other components (Filter, Display) listen to selection events
 * and update themselves accordingly.
 */
export function DataSelector({
  componentId,
  items: initialItems = [],
  label = 'Select Data',
}: DataSelectorProps) {
  const ctx = useCompositionContext()
  const [items] = useState<string[]>(initialItems)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'dataselector',
      enabled: true,
      state: { selectedItems, itemsCount: items.length },
      props: { label },
    })
  }, [componentId, selectedItems, items.length, label, ctx])

  /**
   * Handle item selection
   * Emits event so Filter and Display components update
   */
  const handleSelectItem = (item: string) => {
    const newSelected = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item]
    setSelectedItems(newSelected)

    ctx.emitEvent(componentId, 'selection-changed', {
      selectedItems: newSelected,
      selectedCount: newSelected.length,
    })
  }

  /**
   * Clear all selections
   */
  const handleClearSelection = () => {
    setSelectedItems([])
    ctx.emitEvent(componentId, 'selection-changed', {
      selectedItems: [],
      selectedCount: 0,
    })
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-purple-200 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-500">
          {selectedItems.length} of {items.length} selected
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map(item => (
            <label
              key={item}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => handleSelectItem(item)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-4">
          No items available
        </div>
      )}

      {/* Clear Button */}
      {selectedItems.length > 0 && (
        <button
          onClick={handleClearSelection}
          className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium"
        >
          Clear Selection
        </button>
      )}
    </div>
  )
}
