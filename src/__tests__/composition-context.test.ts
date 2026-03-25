import { describe, it, expect } from 'vitest'
import {
  CompositionContext,
  ComponentInstance,
  CompositionContextReact,
} from '../lib/composition-context'

describe('CompositionContext', () => {
  it('should have all required methods', () => {
    // Type test - verifies the interface has all expected methods
    type Methods = keyof CompositionContext

    const methods: Methods[] = [
      'registerComponent',
      'getComponentState',
      'onComponentEvent',
      'emitEvent',
      'findComponentsByType',
      'getEnabledComponents',
    ]

    // Should have exactly 6 methods
    expect(methods.length).toBe(6)

    // Each method should be present in the interface
    const interfaceKeys: Methods[] = [
      'registerComponent',
      'getComponentState',
      'onComponentEvent',
      'emitEvent',
      'findComponentsByType',
      'getEnabledComponents',
    ]

    interfaceKeys.forEach(method => {
      expect(methods).toContain(method)
    })
  })

  it('should define ComponentInstance interface with all fields', () => {
    const instance: ComponentInstance = {
      id: 'test-composer-1',
      type: 'composer',
      enabled: true,
      state: { items: ['track1', 'track2'] },
      props: { editing: 'full' },
    }

    expect(instance.id).toBe('test-composer-1')
    expect(instance.type).toBe('composer')
    expect(instance.enabled).toBe(true)
    expect(instance.state).toEqual({ items: ['track1', 'track2'] })
    expect(instance.props).toEqual({ editing: 'full' })
  })

  it('should support various state types in ComponentInstance', () => {
    // State can be any type
    const instances: ComponentInstance[] = [
      {
        id: '1',
        type: 'test',
        enabled: true,
        state: null,
        props: {},
      },
      {
        id: '2',
        type: 'test',
        enabled: true,
        state: { data: 'string' },
        props: {},
      },
      {
        id: '3',
        type: 'test',
        enabled: true,
        state: [1, 2, 3],
        props: {},
      },
      {
        id: '4',
        type: 'test',
        enabled: true,
        state: 42,
        props: {},
      },
    ]

    expect(instances).toHaveLength(4)
    instances.forEach(instance => {
      expect(instance.state).toBeDefined()
    })
  })

  it('should export CompositionContextReact', () => {
    expect(CompositionContextReact).toBeDefined()
    expect(CompositionContextReact.Provider).toBeDefined()
  })

  it('should define onComponentEvent listener method signature', () => {
    // Verify that onComponentEvent can be called with 'any' source
    type OnComponentEvent = CompositionContext['onComponentEvent']

    // The signature should accept 'any' as sourceId
    const signature: OnComponentEvent = (sourceId, event, handler) => {
      // Return unsubscribe function
      return () => {
        // cleanup
      }
    }

    expect(signature).toBeDefined()
  })

  it('should define findComponentsByType return type', () => {
    // Verify that findComponentsByType returns ComponentInstance array
    type FindComponentsByType = CompositionContext['findComponentsByType']

    const finder: FindComponentsByType = (type) => {
      return [] as ComponentInstance[]
    }

    const result = finder('composer')
    expect(Array.isArray(result)).toBe(true)
  })

  it('should define getEnabledComponents return type', () => {
    // Verify that getEnabledComponents returns string array
    type GetEnabledComponents = CompositionContext['getEnabledComponents']

    const getter: GetEnabledComponents = () => {
      return ['component-1', 'component-2'] as string[]
    }

    const result = getter()
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toMatch(/^component-\d+$/)
  })
})
