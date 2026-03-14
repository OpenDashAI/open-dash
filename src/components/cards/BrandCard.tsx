export interface BrandCardProps {
  name: string
  slug: string
  score?: number
  revenue?: number
  status?: 'healthy' | 'warning' | 'blocked'
  blockedOn?: string
}

export function BrandCard({ name, slug, score, revenue = 0, status = 'healthy', blockedOn }: BrandCardProps) {
  const statusClass = status === 'healthy' ? 'online' : status === 'warning' ? 'warning' : 'error'

  return (
    <div className="hud-card">
      <div className="flex items-center gap-2 mb-1">
        <span className={`status-dot ${statusClass}`} />
        <span className="font-semibold text-[var(--hud-text-bright)]">{name}</span>
        {score !== undefined && (
          <span className="ml-auto text-[11px] font-mono text-[var(--hud-accent)]">{score}%</span>
        )}
      </div>
      <div className="flex gap-4 text-[11px] text-[var(--hud-text-muted)]">
        <span>{slug}</span>
        <span>${revenue}/mo</span>
      </div>
      {blockedOn && (
        <div className="mt-1 text-[11px] text-[var(--hud-warning)]">Blocked: {blockedOn}</div>
      )}
    </div>
  )
}
