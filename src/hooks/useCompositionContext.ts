import { useContext } from 'react'
import { CompositionContextReact } from '../lib/composition-context'
import type { CompositionContext } from '../lib/composition-context'

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
 * @returns The CompositionContext instance
 * @throws Error if used outside of CompositionProvider
 *
 * @example
 * ```tsx
 * function Composer() {
 *   const ctx = useCompositionContext()
 *
 *   useEffect(() => {
 *     // Register this component
 *     ctx.registerComponent('composer-1', {
 *       id: 'composer-1',
 *       type: 'composer',
 *       enabled: true,
 *       state: { items: [] },
 *       props: {},
 *     })
 *   }, [ctx])
 *
 *   useEffect(() => {
 *     // Listen for playback events from Transport
 *     return ctx.onComponentEvent('transport-1', 'playback-started', () => {
 *       console.log('Playback started')
 *     })
 *   }, [ctx])
 *
 *   function handleAddItem(item: string) {
 *     // Emit event so other components know about the change
 *     ctx.emitEvent('composer-1', 'item-added', { item })
 *   }
 *
 *   return <ComposerUI onAddItem={handleAddItem} />
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
