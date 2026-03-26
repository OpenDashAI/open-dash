import { useEffect, useState, useCallback } from 'react'
import { useCompositionContext } from '@opendash/composition'

export interface UseComposableListOptions<T = unknown> {
  componentId: string
  listenToComponent?: string | 'any'
  initialItems?: T[]
  filterFn?: (item: T, query: string) => boolean
}

/**
 * Headless composition hook for list behavior.
 *
 * Handles: registration, item selection, filtering, add/remove.
 * Returns data + emit functions. No JSX, no styling.
 *
 * Use with ANY styled list (shadcn Table, Magic UI, plain HTML).
 */
export function useComposableList<T = unknown>({
  componentId,
  listenToComponent = 'any',
  initialItems = [],
  filterFn,
}: UseComposableListOptions<T>) {
  const ctx = useCompositionContext()
  const [items, setItems] = useState<T[]>(initialItems)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [filterQuery, setFilterQuery] = useState('')

  // Register with CompositionProvider
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'list',
      enabled: true,
      state: {
        itemCount: items.length,
        selectedIndex,
        hasSelection: selectedItem !== null,
        filterQuery,
      },
      props: { listenToComponent },
    })
  }, [componentId, items.length, selectedIndex, selectedItem, filterQuery, listenToComponent, ctx])

  // Listen for data-ready events (new data from upstream)
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'data-ready', (payload: unknown) => {
      const p = payload as { items?: T[] }
      if (p?.items) {
        setItems(p.items)
        setSelectedItem(null)
        setSelectedIndex(-1)
      }
    })
  }, [ctx, listenToComponent])

  // Listen for filter-updated events
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'filter-updated', (payload: unknown) => {
      const p = payload as { query?: string }
      if (p?.query !== undefined) {
        setFilterQuery(p.query)
      }
    })
  }, [ctx, listenToComponent])

  // Emit selection
  const emitSelection = useCallback((item: T, index: number) => {
    setSelectedItem(item)
    setSelectedIndex(index)
    ctx.emitEvent(componentId, 'item-selected', { item, index })
  }, [ctx, componentId])

  // Emit add
  const emitAdd = useCallback((item: T) => {
    const newItems = [...items, item]
    setItems(newItems)
    ctx.emitEvent(componentId, 'item-added', { item, allItems: newItems, index: newItems.length - 1 })
  }, [ctx, componentId, items])

  // Emit remove
  const emitRemove = useCallback((index: number) => {
    const removed = items[index]
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    if (selectedIndex === index) {
      setSelectedItem(null)
      setSelectedIndex(-1)
    }
    ctx.emitEvent(componentId, 'item-removed', { item: removed, allItems: newItems, index })
  }, [ctx, componentId, items, selectedIndex])

  // Computed: filtered items
  const filteredItems = filterQuery && filterFn
    ? items.filter(item => filterFn(item, filterQuery))
    : items

  return {
    items: filteredItems,
    allItems: items,
    selectedItem,
    selectedIndex,
    filterQuery,
    itemCount: filteredItems.length,
    totalCount: items.length,
    hasSelection: selectedItem !== null,
    emitSelection,
    emitAdd,
    emitRemove,
    setItems,
  }
}
