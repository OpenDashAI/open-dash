import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CompositionProvider } from '../lib/composition-provider'
import { useCompositionContext } from '../hooks/useCompositionContext'
import type { ComponentInstance } from '../lib/composition-context'

describe('CompositionProvider', () => {
  describe('registerComponent', () => {
    it('should register a component', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const component: ComponentInstance = {
        id: 'test-1',
        type: 'composer',
        enabled: true,
        state: { items: [] },
        props: {},
      }

      act(() => {
        result.current.registerComponent('test-1', component)
      })

      const state = result.current.getComponentState('test-1')
      expect(state).toEqual({ items: [] })
    })

    it('should update component state on re-registration', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      act(() => {
        result.current.registerComponent('test-1', {
          id: 'test-1',
          type: 'composer',
          enabled: true,
          state: { items: ['track1'] },
          props: {},
        })
      })

      expect(result.current.getComponentState('test-1')).toEqual({ items: ['track1'] })

      act(() => {
        result.current.registerComponent('test-1', {
          id: 'test-1',
          type: 'composer',
          enabled: true,
          state: { items: ['track1', 'track2'] },
          props: {},
        })
      })

      expect(result.current.getComponentState('test-1')).toEqual({
        items: ['track1', 'track2'],
      })
    })
  })

  describe('getComponentState', () => {
    it('should return undefined for unregistered component', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      expect(result.current.getComponentState('nonexistent')).toBeUndefined()
    })

    it('should return component state after registration', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const testState = { count: 42, data: 'test' }

      act(() => {
        result.current.registerComponent('test-1', {
          id: 'test-1',
          type: 'counter',
          enabled: true,
          state: testState,
          props: {},
        })
      })

      expect(result.current.getComponentState('test-1')).toEqual(testState)
    })
  })

  describe('event emission and listening', () => {
    it('should call listener when event is emitted', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const handler = vi.fn()

      act(() => {
        result.current.onComponentEvent('component-1', 'test-event', handler)
        result.current.emitEvent('component-1', 'test-event', { data: 'test' })
      })

      expect(handler).toHaveBeenCalledWith({ data: 'test' })
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not call listener for different event', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const handler = vi.fn()

      act(() => {
        result.current.onComponentEvent('component-1', 'event-a', handler)
        result.current.emitEvent('component-1', 'event-b', {})
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should not call listener for different component source', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const handler = vi.fn()

      act(() => {
        result.current.onComponentEvent('component-1', 'event', handler)
        result.current.emitEvent('component-2', 'event', {})
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle "any" source wildcard', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const handler = vi.fn()

      act(() => {
        result.current.onComponentEvent('any', 'item-added', handler)
        result.current.emitEvent('composer-1', 'item-added', { item: 'track1' })
        result.current.emitEvent('composer-2', 'item-added', { item: 'track2' })
      })

      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenNthCalledWith(1, { item: 'track1' })
      expect(handler).toHaveBeenNthCalledWith(2, { item: 'track2' })
    })

    it('should unsubscribe from events', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const handler = vi.fn()

      let unsubscribe: (() => void) | undefined

      act(() => {
        unsubscribe = result.current.onComponentEvent('comp-1', 'test', handler)
        result.current.emitEvent('comp-1', 'test', { data: 1 })
      })

      expect(handler).toHaveBeenCalledTimes(1)

      act(() => {
        unsubscribe!()
        result.current.emitEvent('comp-1', 'test', { data: 2 })
      })

      expect(handler).toHaveBeenCalledTimes(1) // Should not be called again
    })

    it('should handle multiple listeners on same event', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      act(() => {
        result.current.onComponentEvent('comp-1', 'event', handler1)
        result.current.onComponentEvent('comp-1', 'event', handler2)
        result.current.onComponentEvent('any', 'event', handler3)
        result.current.emitEvent('comp-1', 'event', { data: 'test' })
      })

      expect(handler1).toHaveBeenCalledWith({ data: 'test' })
      expect(handler2).toHaveBeenCalledWith({ data: 'test' })
      expect(handler3).toHaveBeenCalledWith({ data: 'test' })
    })

    it('should catch listener errors without breaking other listeners', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const errorHandler = vi.fn(() => {
        throw new Error('Handler error')
      })
      const normalHandler = vi.fn()

      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      act(() => {
        result.current.onComponentEvent('comp-1', 'event', errorHandler)
        result.current.onComponentEvent('comp-1', 'event', normalHandler)
        result.current.emitEvent('comp-1', 'event', {})
      })

      expect(errorHandler).toHaveBeenCalled()
      expect(normalHandler).toHaveBeenCalled() // Should still be called despite error
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('findComponentsByType', () => {
    it('should find components by type', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      act(() => {
        result.current.registerComponent('composer-1', {
          id: 'composer-1',
          type: 'composer',
          enabled: true,
          state: {},
          props: {},
        })

        result.current.registerComponent('transport-1', {
          id: 'transport-1',
          type: 'transport',
          enabled: true,
          state: {},
          props: {},
        })

        result.current.registerComponent('effects-1', {
          id: 'effects-1',
          type: 'effects',
          enabled: true,
          state: {},
          props: {},
        })
      })

      const composers = result.current.findComponentsByType('composer')
      expect(composers).toHaveLength(1)
      expect(composers[0].id).toBe('composer-1')

      const transports = result.current.findComponentsByType('transport')
      expect(transports).toHaveLength(1)

      const effects = result.current.findComponentsByType('effects')
      expect(effects).toHaveLength(1)
    })

    it('should only return enabled components', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      act(() => {
        result.current.registerComponent('transport-1', {
          id: 'transport-1',
          type: 'transport',
          enabled: true,
          state: {},
          props: {},
        })

        result.current.registerComponent('transport-2', {
          id: 'transport-2',
          type: 'transport',
          enabled: false,
          state: {},
          props: {},
        })
      })

      const transports = result.current.findComponentsByType('transport')
      expect(transports).toHaveLength(1)
      expect(transports[0].id).toBe('transport-1')
    })

    it('should return empty array for unknown type', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const components = result.current.findComponentsByType('unknown')
      expect(components).toEqual([])
    })
  })

  describe('getEnabledComponents', () => {
    it('should return all enabled component IDs', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      act(() => {
        result.current.registerComponent('comp-1', {
          id: 'comp-1',
          type: 'composer',
          enabled: true,
          state: {},
          props: {},
        })

        result.current.registerComponent('comp-2', {
          id: 'comp-2',
          type: 'transport',
          enabled: true,
          state: {},
          props: {},
        })

        result.current.registerComponent('comp-3', {
          id: 'comp-3',
          type: 'effects',
          enabled: false,
          state: {},
          props: {},
        })
      })

      const enabled = result.current.getEnabledComponents()
      expect(enabled).toHaveLength(2)
      expect(enabled).toContain('comp-1')
      expect(enabled).toContain('comp-2')
      expect(enabled).not.toContain('comp-3')
    })

    it('should return empty array when no components registered', () => {
      const { result } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const enabled = result.current.getEnabledComponents()
      expect(enabled).toEqual([])
    })
  })

  describe('context memoization', () => {
    it('should maintain same context reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useCompositionContext(), {
        wrapper: CompositionProvider,
      })

      const firstContext = result.current

      rerender()

      const secondContext = result.current

      expect(firstContext).toBe(secondContext)
    })
  })
})
