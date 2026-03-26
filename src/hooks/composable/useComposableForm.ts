import { useEffect, useState, useCallback } from 'react'
import { useCompositionContext } from '@opendash/composition'

export interface FieldDefinition {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date' | 'checkbox'
  required?: boolean
  options?: string[]
  defaultValue?: unknown
  validate?: (value: unknown) => string | null
}

export interface UseComposableFormOptions {
  componentId: string
  listenToComponent?: string | 'any'
  fields: FieldDefinition[]
}

/**
 * Headless composition hook for form behavior.
 *
 * Handles: registration, field state, validation, submit, pre-fill from selection.
 * Returns values + errors + handlers. No JSX, no styling.
 *
 * Use with ANY styled form (shadcn Form, plain HTML, custom).
 */
export function useComposableForm({
  componentId,
  listenToComponent = 'any',
  fields,
}: UseComposableFormOptions) {
  const ctx = useCompositionContext()

  // Initialize values from field defaults
  const initialValues = Object.fromEntries(
    fields.map(f => [f.name, f.defaultValue ?? (f.type === 'checkbox' ? false : '')])
  )

  const [values, setValues] = useState<Record<string, unknown>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Register with CompositionProvider
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'form',
      enabled: true,
      state: { values, errors, dirty, submitting, isValid: Object.keys(errors).length === 0 },
      props: { listenToComponent, fieldCount: fields.length },
    })
  }, [componentId, values, errors, dirty, submitting, fields.length, listenToComponent, ctx])

  // Listen for item-selected events (pre-fill form for editing)
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'item-selected', (payload: unknown) => {
      const p = payload as { item?: Record<string, unknown> }
      if (p?.item && typeof p.item === 'object') {
        const newValues: Record<string, unknown> = {}
        for (const field of fields) {
          newValues[field.name] = (p.item as Record<string, unknown>)[field.name] ?? field.defaultValue ?? ''
        }
        setValues(newValues)
        setErrors({})
        setDirty(false)
      }
    })
  }, [ctx, listenToComponent, fields])

  // Set a single field value
  const setValue = useCallback((name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setDirty(true)

    // Clear error for this field
    setErrors(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })

    ctx.emitEvent(componentId, 'form-changed', { field: name, value })
  }, [ctx, componentId])

  // Validate all fields
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    for (const field of fields) {
      const value = values[field.name]

      if (field.required && (value === '' || value === null || value === undefined)) {
        newErrors[field.name] = `${field.label} is required`
        continue
      }

      if (field.validate) {
        const error = field.validate(value)
        if (error) newErrors[field.name] = error
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fields, values])

  // Submit
  const emitSubmit = useCallback(() => {
    if (!validate()) return false

    setSubmitting(true)
    ctx.emitEvent(componentId, 'form-submitted', { values: { ...values } })
    setSubmitting(false)
    return true
  }, [ctx, componentId, values, validate])

  // Reset
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setDirty(false)
    setSubmitting(false)
  }, [initialValues])

  return {
    fields,
    values,
    errors,
    dirty,
    submitting,
    isValid: Object.keys(errors).length === 0,
    setValue,
    validate,
    emitSubmit,
    reset,
  }
}
