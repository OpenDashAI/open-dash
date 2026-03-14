import { ActivityCard } from '../cards/ActivityCard'
import { StatusCard } from '../cards/StatusCard'
import type { HudMode } from '../../lib/hud-mode'

interface FocusPanelProps {
  mode: HudMode
}

// Demo data — will be replaced by live data
const DEMO_EVENTS = [
  { id: '1', type: 'success' as const, message: 'Blog archetype shipped (#94)', time: '2m ago' },
  { id: '2', type: 'info' as const, message: 'Code Turtle core engine deployed', time: '15m ago' },
  { id: '3', type: 'warning' as const, message: 'vibemarketing.pro expires in 3 days', time: '1h ago' },
  { id: '4', type: 'info' as const, message: 'Train 10 session 1/5 complete', time: '2h ago' },
  { id: '5', type: 'error' as const, message: 'API Mom auth bypass detected (#115)', time: '3h ago' },
]

export function FocusPanel({ mode }: FocusPanelProps) {
  return (
    <div className="hud-panel center">
      <div className="panel-header">
        <span>Focus</span>
        <span className="text-[var(--hud-accent)] text-[10px]">{mode.toUpperCase()}</span>
      </div>
      <div className="panel-body">
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <StatusCard label="DRR" value="$0" change="10 trains" trend="flat" />
          <StatusCard label="Issues" value="30" change="-2 net" trend="down" />
          <StatusCard label="Machines" value="3/4" change="1 offline" trend="flat" />
          <StatusCard label="L3 Queue" value="0" change="idle" trend="flat" />
        </div>

        <ActivityCard events={DEMO_EVENTS} />
      </div>
    </div>
  )
}
