import { CompositionRenderer } from '../../components/CompositionRenderer'
import type { ComponentMap } from '../../components/CompositionRenderer'
import type { Composition } from '../../lib/composition-schema'

// Import existing composable components
import { DataSelector } from '../../components/composable/DataSelector'
import { Filter } from '../../components/composable/Filter'
import { Display } from '../../components/composable/Display'
import { Summary } from '../../components/composable/Summary'

// Import the composition JSON
import compositionJson from './composition.json'

// Component map: name → React component
const components: ComponentMap = {
  DataSelector,
  Filter,
  Display,
  Summary,
}

/**
 * ComposedDashboard — Same dashboard as the hand-written example,
 * but rendered entirely from a JSON composition.
 *
 * This proves:
 * 1. CompositionRenderer works
 * 2. JSON → working app (no hand-written JSX)
 * 3. AI could generate this JSON
 */
export function ComposedDashboard() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-full">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {compositionJson.name}
        </h1>
        <p className="text-slate-400 mb-6">
          {compositionJson.description}
        </p>
      </div>
      <CompositionRenderer
        composition={compositionJson as Composition}
        components={components}
      />
    </div>
  )
}
