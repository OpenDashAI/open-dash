import { z } from 'zod'

/**
 * Composition Format Schema
 *
 * Declarative JSON that describes a complete composed application.
 * AI generates this. The CompositionRenderer reads it and renders.
 */

export const ComponentEntrySchema = z.object({
  /** Unique instance ID for this component */
  id: z.string(),

  /** Component name (must match a key in the component map) */
  component: z.string(),

  /** Layout slot: where to render this component */
  slot: z.enum(['sidebar', 'main', 'panel', 'header', 'footer', 'fullscreen', 'modal']).default('main'),

  /** Which component to listen to (componentId or 'any') */
  listenTo: z.string().optional(),

  /** Props to pass to the component (domain-specific configuration) */
  props: z.record(z.unknown()).default({}),
})

export const LayoutSchema = z.enum([
  'single',           // One column (fullscreen content)
  'sidebar-main',     // Left sidebar + main content
  'sidebar-main-panel', // Left sidebar + main + right panel
  'header-main',      // Top header + main content
  'grid',             // CSS grid (components fill cells)
])

export const CompositionSchema = z.object({
  /** Name of this composition */
  name: z.string(),

  /** Description of what this composition does */
  description: z.string().optional(),

  /** Layout template */
  layout: LayoutSchema.default('sidebar-main'),

  /** Components in this composition */
  components: z.array(ComponentEntrySchema).min(1),

  /** Optional: CSS class overrides for layout slots */
  slotClasses: z.record(z.string()).optional(),

  /** Optional: metadata for AI / registry */
  meta: z.record(z.unknown()).optional(),
})

export type ComponentEntry = z.infer<typeof ComponentEntrySchema>
export type Layout = z.infer<typeof LayoutSchema>
export type Composition = z.infer<typeof CompositionSchema>

/**
 * Validate a composition JSON.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateComposition(json: unknown) {
  const result = CompositionSchema.safeParse(json)
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
    }
  }

  // Validate event wiring: every listenTo must reference an existing component id
  const ids = new Set(result.data.components.map(c => c.id))
  const wiringErrors: string[] = []

  for (const comp of result.data.components) {
    if (comp.listenTo && comp.listenTo !== 'any' && !ids.has(comp.listenTo)) {
      wiringErrors.push(
        `${comp.id}: listenTo "${comp.listenTo}" does not match any component id`
      )
    }
  }

  if (wiringErrors.length > 0) {
    return { success: false as const, errors: wiringErrors }
  }

  return { success: true as const, data: result.data }
}
