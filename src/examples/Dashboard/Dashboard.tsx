import { DataSelector } from '../../components/composable/DataSelector'
import { Filter } from '../../components/composable/Filter'
import { Display } from '../../components/composable/Display'
import { Summary } from '../../components/composable/Summary'
import { CompositionProvider } from '../../lib/composition-provider'
import { useEffect, useState } from 'react'

// Sample data for the dashboard
const SAMPLE_DATA = [
  'Google Analytics Dashboard',
  'Stripe Revenue Report',
  'GitHub Activity Feed',
  'CloudFlare Analytics',
  'Email Campaign Metrics',
  'Tailscale Network Status',
  'Meta Ads Performance',
  'Market Insights Report',
  'Competitor Domain Tracking',
  'SEO Performance Dashboard',
]

/**
 * Dashboard Example App
 *
 * Demonstrates a 5-component pipeline architecture:
 * 1. DataSelector: User selects which data sources to view
 * 2. Filter: User filters selected data by search text
 * 3. Display: Shows the filtered results in a table
 * 4. Summary: Shows aggregate statistics about displayed data
 *
 * This example shows:
 * - Multi-stage data pipeline with 4 components
 * - Data flowing through: Selection → Filtering → Display → Summary
 * - Each component is independent but coordinated
 * - Complex state management without prop drilling
 * - Event-driven architecture at scale
 *
 * The dashboard demonstrates why the component mesh is powerful:
 * - Add a new component? Just wrap in provider and listen to events
 * - Remove a component? Remove one line of code
 * - Change data flow? Modify one event listener
 */
export function Dashboard() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized && typeof window !== 'undefined') {
      const key = 'opendash-demo-dashboard-selection'
      const stored = localStorage.getItem(key)
      if (!stored) {
        // Pre-select some dashboard items
        localStorage.setItem(key, JSON.stringify(['Google Analytics Dashboard', 'GitHub Activity Feed', 'SEO Performance Dashboard']))
      }
      setInitialized(true)
    }
  }, [initialized])

  return (
    <CompositionProvider>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">
              Select data sources, filter results, and view aggregate statistics in real-time.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Selection and Filtering */}
            <div className="lg:col-span-1 space-y-6">
              {/* Data Selector */}
              <DataSelector
                componentId="selector"
                items={SAMPLE_DATA}
                label="Available Data Sources"
              />

              {/* Filter */}
              <Filter
                componentId="filter"
                listenToComponent="selector"
                label="Search Results"
              />
            </div>

            {/* Middle Column: Display */}
            <div className="lg:col-span-1">
              <Display
                componentId="display"
                listenToComponent="filter"
                label="Results"
              />
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
              <Summary
                componentId="summary"
                listenToComponent="display"
                label="Statistics"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-900">
            <p className="font-semibold mb-3">How this dashboard works:</p>
            <ol className="space-y-2 list-decimal list-inside text-blue-800">
              <li>
                <strong>Select:</strong> Check boxes to select data sources you want to view
              </li>
              <li>
                <strong>Filter:</strong> Type to search selected items (case-insensitive)
              </li>
              <li>
                <strong>Display:</strong> Results update automatically as you select and filter
              </li>
              <li>
                <strong>Summarize:</strong> Statistics show aggregate data about displayed items
              </li>
              <li>
                <strong>Coordinate:</strong> All components talk through events, no direct imports
              </li>
            </ol>
            <p className="mt-4 text-xs text-blue-700 italic">
              Try: Select items → Type in filter → Watch all components update automatically
            </p>
          </div>

          {/* Architecture Explanation */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Component Pipeline</h2>
              <div className="space-y-2 text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-600 w-2 h-2 rounded-full"></span>
                  <span>DataSelector → emits 'selection-changed'</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 w-2 h-2 rounded-full"></span>
                  <span>Filter → listens & emits 'filter-updated'</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-600 w-2 h-2 rounded-full"></span>
                  <span>Display → listens & emits 'display-ready'</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-600 w-2 h-2 rounded-full"></span>
                  <span>Summary → listens & emits 'summary-ready'</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Why This Architecture?</h2>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>
                  ✓ <strong>Loosely coupled:</strong> Components don't know about each other
                </li>
                <li>
                  ✓ <strong>Easy to extend:</strong> Add/remove components without changes
                </li>
                <li>
                  ✓ <strong>Reusable:</strong> Same components in different compositions
                </li>
                <li>
                  ✓ <strong>Testable:</strong> Each component can be tested independently
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CompositionProvider>
  )
}
