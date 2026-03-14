export interface StatusCardProps {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'flat'
}

export function StatusCard({ label, value, change, trend }: StatusCardProps) {
  const trendColor = trend === 'up' ? 'text-[var(--hud-success)]' : trend === 'down' ? 'text-[var(--hud-error)]' : 'text-[var(--hud-text-muted)]'
  const trendArrow = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'

  return (
    <div className="hud-card">
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">{label}</div>
      <div className="text-xl font-semibold font-mono text-[var(--hud-text-bright)] mt-1">{value}</div>
      {change && (
        <div className={`text-[11px] mt-1 ${trendColor}`}>
          {trendArrow} {change}
        </div>
      )}
    </div>
  )
}
