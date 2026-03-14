import { MachineCard } from '../cards/MachineCard'
import { BrandCard } from '../cards/BrandCard'
import type { HudMode } from '../../lib/hud-mode'

interface ContextPanelProps {
  mode: HudMode
}

// Demo data — will be replaced by live data from D1/APIs
const MACHINES = [
  { hostname: 'providence', os: 'macOS', status: 'online' as const, ip: '100.84.211.58', tasks: 1, cpu: 12 },
  { hostname: 'destiny', os: 'macOS', status: 'offline' as const, ip: '100.84.253.65', tasks: 0 },
  { hostname: 'stargate', os: 'Windows', status: 'online' as const, ip: '100.107.60.12', tasks: 0, cpu: 3 },
  { hostname: 'stargate-wsl', os: 'Linux', status: 'online' as const, ip: '100.92.249.32', tasks: 0, cpu: 8 },
]

const BRANDS = [
  { name: 'Bank Statement to Excel', slug: 'bse', score: 87, revenue: 0, status: 'healthy' as const },
  { name: 'LLC Tax', slug: 'llc-tax', score: 42, revenue: 0, status: 'blocked' as const, blockedOn: 'SES secrets' },
  { name: 'UGC Marketing', slug: 'ugc-marketing', score: 28, revenue: 0, status: 'warning' as const },
  { name: 'Vibe Marketing', slug: 'vibe-marketing', score: 15, revenue: 0, status: 'warning' as const },
]

export function ContextPanel({ mode }: ContextPanelProps) {
  return (
    <div className="hud-panel left">
      <div className="panel-header">
        <span>Context</span>
        <span className="text-[var(--hud-accent)] text-[10px]">{mode.toUpperCase()}</span>
      </div>
      <div className="panel-body">
        {(mode === 'operating' || mode === 'alert') && (
          <>
            <div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 px-1">
              Machines
            </div>
            {MACHINES.map((m) => (
              <MachineCard key={m.hostname} {...m} />
            ))}
          </>
        )}

        <div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 mt-3 px-1">
          Brands
        </div>
        {BRANDS.map((b) => (
          <BrandCard key={b.slug} {...b} />
        ))}
      </div>
    </div>
  )
}
