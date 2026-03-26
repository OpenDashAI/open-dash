import { type ComponentType, type ReactNode, useMemo } from 'react'
import { CompositionProvider } from '@opendash/composition'
import type { Composition, ComponentEntry, Layout } from '../lib/composition-schema'
import { validateComposition } from '../lib/composition-schema'

/**
 * Component map: name → React component.
 * Each component must accept at least: componentId, listenToComponent
 */
export type ComponentMap = Record<string, ComponentType<{
  componentId: string
  listenToComponent?: string
  [key: string]: unknown
}>>

interface CompositionRendererProps {
  /** The composition JSON (from AI, from file, from API) */
  composition: Composition
  /** Map of component names to React components */
  components: ComponentMap
  /** Optional: override layout slot class names */
  classOverrides?: Record<string, string>
  /** Optional: fallback for unknown components */
  fallback?: ComponentType<{ name: string }>
}

/** Default layout CSS classes */
const LAYOUT_CLASSES: Record<Layout, { container: string; slots: Record<string, string> }> = {
  single: {
    container: 'min-h-screen',
    slots: { main: 'w-full', fullscreen: 'w-full h-screen' },
  },
  'sidebar-main': {
    container: 'min-h-screen flex',
    slots: {
      sidebar: 'w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto',
      main: 'flex-1 overflow-y-auto',
    },
  },
  'sidebar-main-panel': {
    container: 'min-h-screen flex',
    slots: {
      sidebar: 'w-64 flex-shrink-0 border-r border-gray-200 overflow-y-auto',
      main: 'flex-1 overflow-y-auto',
      panel: 'w-80 flex-shrink-0 border-l border-gray-200 overflow-y-auto',
    },
  },
  'header-main': {
    container: 'min-h-screen flex flex-col',
    slots: {
      header: 'flex-shrink-0 border-b border-gray-200',
      main: 'flex-1 overflow-y-auto',
    },
  },
  grid: {
    container: 'min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4',
    slots: { main: '' },
  },
}

/** Unknown component fallback */
function DefaultFallback({ name }: { name: string }) {
  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded text-sm text-red-700">
      Unknown component: <code>{name}</code>
    </div>
  )
}

/**
 * CompositionRenderer — Reads composition JSON and renders a full application.
 *
 * This is the runtime that turns AI-generated compositions into working UIs.
 *
 * @example
 * ```tsx
 * const composition = {
 *   name: "Simple CRM",
 *   layout: "sidebar-main",
 *   components: [
 *     { id: "contacts", component: "ContactList", slot: "sidebar" },
 *     { id: "detail", component: "ContactDetail", slot: "main", listenTo: "contacts" },
 *   ]
 * }
 *
 * <CompositionRenderer
 *   composition={composition}
 *   components={{ ContactList, ContactDetail }}
 * />
 * ```
 */
export function CompositionRenderer({
  composition,
  components,
  classOverrides,
  fallback: Fallback = DefaultFallback,
}: CompositionRendererProps) {
  // Validate
  const validation = useMemo(() => validateComposition(composition), [composition])

  if (!validation.success) {
    return (
      <div className="p-6 border border-red-300 bg-red-50 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">Composition Error</h3>
        <ul className="text-sm text-red-700 space-y-1">
          {validation.errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </div>
    )
  }

  const comp = validation.data
  const layoutConfig = LAYOUT_CLASSES[comp.layout]

  // Group components by slot
  const slotGroups = useMemo(() => {
    const groups: Record<string, ComponentEntry[]> = {}
    for (const entry of comp.components) {
      const slot = entry.slot
      if (!groups[slot]) groups[slot] = []
      groups[slot].push(entry)
    }
    return groups
  }, [comp.components])

  // Render a single component entry
  const renderEntry = (entry: ComponentEntry) => {
    const Component = components[entry.component]

    if (!Component) {
      return <Fallback key={entry.id} name={entry.component} />
    }

    return (
      <Component
        key={entry.id}
        componentId={entry.id}
        listenToComponent={entry.listenTo}
        {...entry.props}
      />
    )
  }

  // Render a slot with its components
  const renderSlot = (slotName: string): ReactNode => {
    const entries = slotGroups[slotName]
    if (!entries || entries.length === 0) return null

    const className = classOverrides?.[slotName]
      ?? comp.slotClasses?.[slotName]
      ?? layoutConfig.slots[slotName]
      ?? ''

    return (
      <div key={slotName} className={className}>
        <div className="flex flex-col gap-4 p-4">
          {entries.map(renderEntry)}
        </div>
      </div>
    )
  }

  // Get all unique slots used
  const usedSlots = Object.keys(slotGroups)

  return (
    <CompositionProvider>
      <div className={classOverrides?.container ?? layoutConfig.container}>
        {usedSlots.map(renderSlot)}
      </div>
    </CompositionProvider>
  )
}
