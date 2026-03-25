import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface EmailSearchProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Label */
  label?: string
}

/**
 * EmailSearch Component - Search and filter emails.
 *
 * This component demonstrates:
 * - Independent text search functionality
 * - Emitting search events
 * - Acting as a filter for other components
 * - Search state management
 *
 * Other components can listen to search-updated events.
 */
export function EmailSearch({
  componentId,
  label = 'Search',
}: EmailSearchProps) {
  const ctx = useCompositionContext()
  const [searchText, setSearchText] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'emailsearch',
      enabled: true,
      state: { searchText, historyCount: searchHistory.length },
      props: { label },
    })
  }, [componentId, searchText, searchHistory.length, label, ctx])

  /**
   * Handle search
   */
  const handleSearch = (text: string) => {
    setSearchText(text)

    if (text.trim()) {
      // Add to history if not already there
      if (!searchHistory.includes(text)) {
        setSearchHistory(prev => [text, ...prev].slice(0, 5)) // Keep last 5
      }

      ctx.emitEvent(componentId, 'search-updated', {
        query: text,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Clear search
   */
  const handleClear = () => {
    setSearchText('')
    ctx.emitEvent(componentId, 'search-cleared', {
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-rose-200 rounded-lg bg-white">
      {/* Header */}
      <div className="text-sm font-medium text-gray-700">{label}</div>

      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchText}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search emails..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
        />
        {searchText && (
          <button
            onClick={handleClear}
            className="px-3 py-2 bg-rose-100 text-rose-700 rounded-md hover:bg-rose-200 transition-colors font-medium text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600 font-medium">Recent:</div>
          <div className="flex flex-wrap gap-1">
            {searchHistory.map(item => (
              <button
                key={item}
                onClick={() => handleSearch(item)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
        <p>💡 Search is case-insensitive</p>
      </div>
    </div>
  )
}
