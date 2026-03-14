export interface ActivityCardProps {
  events: Array<{
    id: string
    type: 'success' | 'info' | 'warning' | 'error'
    message: string
    time: string
  }>
}

const TYPE_COLORS = {
  success: 'text-[var(--hud-success)]',
  info: 'text-[var(--hud-accent)]',
  warning: 'text-[var(--hud-warning)]',
  error: 'text-[var(--hud-error)]',
}

const TYPE_ICONS = {
  success: '\u2713',
  info: '\u2022',
  warning: '\u26A0',
  error: '\u2717',
}

export function ActivityCard({ events }: ActivityCardProps) {
  return (
    <div className="hud-card">
      <div className="text-[11px] font-semibold text-[var(--hud-text-muted)] mb-2 uppercase tracking-wider">
        Activity
      </div>
      <div className="space-y-1.5">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-2 text-[12px]">
            <span className={TYPE_COLORS[event.type]}>{TYPE_ICONS[event.type]}</span>
            <span className="text-[var(--hud-text)] flex-1">{event.message}</span>
            <span className="text-[var(--hud-text-muted)] text-[10px] shrink-0">{event.time}</span>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-[12px] text-[var(--hud-text-muted)]">No recent activity</div>
        )}
      </div>
    </div>
  )
}
