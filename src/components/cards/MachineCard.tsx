export interface MachineCardProps {
  hostname: string
  os: string
  status: 'online' | 'offline' | 'busy'
  ip?: string
  tasks?: number
  cpu?: number
}

export function MachineCard({ hostname, os, status, ip, tasks = 0, cpu }: MachineCardProps) {
  const statusClass = status === 'online' ? 'online' : status === 'busy' ? 'warning' : 'offline'

  return (
    <div className="hud-card">
      <div className="flex items-center gap-2 mb-1">
        <span className={`status-dot ${statusClass}`} />
        <span className="font-semibold text-[var(--hud-text-bright)]">{hostname}</span>
        <span className="ml-auto text-[11px] text-[var(--hud-text-muted)]">{os}</span>
      </div>
      <div className="flex gap-4 text-[11px] text-[var(--hud-text-muted)]">
        {ip && <span>{ip}</span>}
        <span>{tasks} tasks</span>
        {cpu !== undefined && <span>CPU {cpu}%</span>}
      </div>
    </div>
  )
}
