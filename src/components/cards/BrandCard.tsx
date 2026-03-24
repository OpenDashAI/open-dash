export interface BrandCardProps {
  name: string
  slug: string
  score?: number
  revenue?: number
  status?: 'healthy' | 'warning' | 'blocked'
  blockedOn?: string
  itemCount?: number  // Issue #27.3: Show pending briefing items
  urgentCount?: number  // Show urgent items count
}

export function BrandCard({
  name,
  slug,
  score,
  revenue = 0,
  status = 'healthy',
  blockedOn,
  itemCount = 0,  // Issue #27.3: Display briefing item count
  urgentCount = 0
}: BrandCardProps) {
  const statusClass = status === 'healthy' ? 'online' : status === 'warning' ? 'warning' : 'error'

  return (
    <div className="hud-card">
      <div className="flex items-center gap-2 mb-1">
        <span className={`status-dot ${statusClass}`} />
        <span className="font-semibold text-[var(--hud-text-bright)]">{name}</span>
        {score !== undefined && (
          <span className="ml-auto text-[11px] font-mono text-[var(--hud-accent)]">{score}%</span>
        )}
        {/* Show urgent item indicator */}
        {urgentCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-[var(--hud-error)] text-white text-[10px] font-semibold rounded">
            {urgentCount}!
          </span>
        )}
      </div>
      <div className="flex gap-4 text-[11px] text-[var(--hud-text-muted)]">
        <span>{slug}</span>
        <span>${revenue}/mo</span>
        {/* Show total pending items count */}
        {itemCount > 0 && (
          <span className="ml-auto text-[11px] text-[var(--hud-accent)]">
            {itemCount} items
          </span>
        )}
      </div>
      {blockedOn && (
        <div className="mt-1 text-[11px] text-[var(--hud-warning)]">Blocked: {blockedOn}</div>
      )}
    </div>
  )
}
