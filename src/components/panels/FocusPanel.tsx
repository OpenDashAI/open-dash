import { ActivityCard } from '../cards/ActivityCard'
import { StatusCard } from '../cards/StatusCard'
import { IssueCard } from '../cards/IssueCard'
import { useHudState } from '../../lib/hud-store'
import { renderCard } from '../../lib/card-registry'

export function FocusPanel() {
  const { mode, events, metrics, issues, cards } = useHudState()

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

        {/* KPI metrics grid — always visible */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {metrics.map((m) => (
              <StatusCard key={m.label} {...m} />
            ))}
          </div>
        )}

        {/* Issues list — shown in building/reviewing mode */}
        {(mode === 'building' || mode === 'reviewing') && issues.length > 0 && (
          <>
            <div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 px-1">
              Open Issues ({issues.length})
            </div>
            {issues.slice(0, 15).map((issue) => (
              <IssueCard key={issue.number} {...issue} />
            ))}
          </>
        )}

        {/* Activity feed — always visible */}
        <div className="mt-2">
          <ActivityCard events={events} />
        </div>
      </div>
    </div>
  )
}
