/**
 * AI-Generated Mini CRM
 *
 * Proves the full flow:
 * 1. useComposableList hook (headless) → ContactList component (styled)
 * 2. useComposableCard hook (headless) → ContactDetail component (styled)
 * 3. composition.json wires them together
 * 4. CompositionRenderer renders the working app
 *
 * Same hooks, different domain = different app.
 */

import { CompositionRenderer } from '../../components/CompositionRenderer'
import type { ComponentMap } from '../../components/CompositionRenderer'
import type { Composition } from '../../lib/composition-schema'
import { ContactList } from '../../components/generated/ContactList'
import { ContactDetail } from '../../components/generated/ContactDetail'
import compositionJson from './composition.json'

const components: ComponentMap = {
  ContactList,
  ContactDetail,
}

export function GeneratedCRM() {
  return (
    <div className="bg-white min-h-full">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{compositionJson.name}</h1>
        <p className="text-sm text-gray-500">{compositionJson.description}</p>
      </div>
      <CompositionRenderer
        composition={compositionJson as Composition}
        components={components}
      />
    </div>
  )
}
