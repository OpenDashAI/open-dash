/**
 * AI-Generated Stage Timer
 *
 * Proves the same hooks generate completely different apps:
 * - useComposableList → TimerList (not ContactList!)
 * - useComposableTimer → StageTimerDisplay (fullscreen countdown)
 * - Same architecture, different domain, different product
 */

import { CompositionRenderer } from '../../components/CompositionRenderer'
import type { ComponentMap } from '../../components/CompositionRenderer'
import type { Composition } from '../../lib/composition-schema'
import { TimerList } from '../../components/generated/TimerList'
import { StageTimerDisplay } from '../../components/generated/StageTimerDisplay'
import compositionJson from './composition.json'

const components: ComponentMap = {
  TimerList,
  StageTimerDisplay,
}

export function GeneratedStageTimer() {
  return (
    <div className="bg-black min-h-full">
      <CompositionRenderer
        composition={compositionJson as Composition}
        components={components}
        classOverrides={{
          container: 'min-h-screen flex',
          sidebar: 'w-80 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 overflow-y-auto',
          main: 'flex-1 flex items-center justify-center',
        }}
      />
    </div>
  )
}
