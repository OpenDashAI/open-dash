import { useContext } from 'react'
import { CompositionContextReact } from './composition-context'
import type { CompositionContext } from './composition-context'

/**
 * Hook to access the CompositionContext.
 *
 * Components use this hook to:
 * - Register themselves
 * - Listen for events from other components
 * - Emit events to other components
 * - Discover other components
 *
 * Must be used within a CompositionProvider.
 *
 * @example
 * ```tsx
 * import { useCompositionContext } from '@opendash/composition'
 *
 * function MyComponent({ componentId }: { componentId: string }) {
 *   const ctx = useCompositionContext()
 *
 *   useEffect(() => {
 *     ctx.registerComponent(componentId, {
 *       id: componentId,
 *       type: 'my-component',
 *       enabled: true,
 *       state: {},
 *       props: {},
 *     })
 *   }, [ctx, componentId])
 *
 *   useEffect(() => {
 *     return ctx.onComponentEvent('any', 'data-ready', (payload) => {
 *       console.log('Received data:', payload)
 *     })
 *   }, [ctx])
 *
 *   function handleAction() {
 *     ctx.emitEvent(componentId, 'action-taken', { action: 'click' })
 *   }
 *
 *   return <button onClick={handleAction}>Act</button>
 * }
 * ```
 */
export function useCompositionContext(): CompositionContext {
  const context = useContext(CompositionContextReact)

  if (!context) {
    throw new Error(
      'useCompositionContext must be used within a CompositionProvider. ' +
      'Make sure your component tree is wrapped with <CompositionProvider>'
    )
  }

  return context
}
