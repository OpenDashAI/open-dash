import { ActivityCard } from '../cards/ActivityCard'
import { StatusCard } from '../cards/StatusCard'
import { useHudState } from '../../lib/hud-store'
import { renderCard } from '../../lib/card-registry'

export function FocusPanel() {
  const { mode, events, metrics, cards } = useHudState()

  // Filter AI-spawned cards destined for center panel
  const centerCards = cards.filter((c) => c.position === 'center')

  return (
    <div className="hud-panel center">
      <div className="panel-header">
        <span>Focus</span>
        <span className="text-[var(--hud-accent)] text-[10px]">{mode.toUpperCase()}</span>
      </div>
      <div className="panel-body">
        {/* AI-spawned cards render first */}
        {centerCards.map((card, i) => renderCard(card.type, card.props, `ai-center-${i}`))}

        {/* KPI metrics grid */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {metrics.map((m) => (
              <StatusCard key={m.label} {...m} />
            ))}
          </div>
        )}

        {/* Activity feed */}
        <ActivityCard events={events} />
      </div>
    </div>
  )
}
