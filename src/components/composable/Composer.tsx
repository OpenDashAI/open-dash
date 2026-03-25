import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface ComposerProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Initial items to display */
  items?: any[]
  /** Label for the input field */
  label?: string
  /** Placeholder for the input field */
  placeholder?: string
}

/**
 * Composer Component - Allows users to add and remove items.
 *
 * This is the first composable component demonstrating:
 * - Registration with CompositionContext
 * - Emitting events ('item-added', 'item-removed')
 * - Managing local state
 * - Working with other components
 *
 * Other components (Transport, Effects, etc.) listen to these events
 * and update themselves accordingly.
 *
 * @example
 * ```tsx
 * <CompositionProvider>
 *   <Composer
 *     componentId="composer-main"
 *     items={['track1', 'track2']}
 *     label="Add Track"
 *   />
 * </CompositionProvider>
 * ```
 */
export function Composer({
  componentId,
  items: initialItems = [],
  label = 'Add Item',
  placeholder = 'Enter item...',
}: ComposerProps) {
  const ctx = useCompositionContext()
  const [items, setItems] = useState<string[]>(initialItems)
  const [inputValue, setInputValue] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Register this component with the context
  useEffect(() => {
    console.log(`[${componentId}] Registering with items:`, items)
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'composer',
      enabled: true,
      state: { items },
      props: {
        label,
        placeholder,
      },
    })
  }, [componentId, items, label, placeholder, ctx])

  // Emit events for initial items on first mount
  useEffect(() => {
    if (!initialized && initialItems.length > 0) {
      const msg = `[${componentId}] Emitting ${initialItems.length} item-added events`
      console.log(msg)
      localStorage.setItem('debug-composer', msg)
      initialItems.forEach((item, index) => {
        ctx.emitEvent(componentId, 'item-added', {
          item,
          allItems: initialItems,
          index,
        })
      })
      setInitialized(true)
    }
  }, [initialized, initialItems, componentId, ctx])

  /**
   * Handle adding a new item
   * Emits 'item-added' event so other components know about the change
   */
  const handleAddItem = () => {
    if (inputValue.trim()) {
      const newItems = [...items, inputValue.trim()]
      setItems(newItems)

      // Emit event for other components to listen to
      ctx.emitEvent(componentId, 'item-added', {
        item: inputValue.trim(),
        allItems: newItems,
        index: newItems.length - 1,
      })

      setInputValue('')
    }
  }

  /**
   * Handle removing an item
   * Emits 'item-removed' event so other components know about the change
   */
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)

    // Emit event for other components to listen to
    ctx.emitEvent(componentId, 'item-removed', {
      removedIndex: index,
      removedItem: items[index],
      allItems: newItems,
    })
  }

  /**
   * Handle key press in input (Enter to add)
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-700">
            Items ({items.length})
          </div>
          <div className="space-y-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <span className="text-sm text-gray-800">
                  {typeof item === 'object' && item !== null && 'name' in item ? item.name : item}
                </span>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && inputValue === '' && (
        <div className="text-sm text-gray-500 text-center py-4">
          No items yet. Add one to get started!
        </div>
      )}
    </div>
  )
}
