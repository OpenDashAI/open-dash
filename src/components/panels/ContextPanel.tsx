import { MachineCard } from '../cards/MachineCard'
import { BrandCard } from '../cards/BrandCard'
import { useHudState } from '../../lib/hud-store'
import { renderCard } from '../../lib/card-registry'

export function ContextPanel() {
  const { mode, machines, brands, cards } = useHudState()

  // Filter AI-spawned cards destined for left panel
  const leftCards = cards.filter((c) => c.position === 'left')

  return (
    <div className="hud-panel left">
      <div className="panel-header">
        <span>Context</span>
        <span className="text-[var(--hud-accent)] text-[10px]">{mode.toUpperCase()}</span>
      </div>
      <div className="panel-body">
        {/* AI-spawned cards render first */}
        {leftCards.map((card, i) => renderCard(card.type, card.props, `ai-left-${i}`))}

        {/* Machine cards in operating/alert mode */}
        {(mode === 'operating' || mode === 'alert') && machines.length > 0 && (
          <>
            <div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 px-1">
              Machines
            </div>
            {machines.map((m) => (
              <MachineCard key={m.hostname} {...m} />
            ))}
          </>
        )}

        {/* Brand cards always visible */}
        <div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 mt-3 px-1">
          Brands
        </div>
        {brands.map((b) => (
          <BrandCard key={b.slug} {...b} />
        ))}

        {brands.length === 0 && (
          <div className="text-[12px] text-[var(--hud-text-muted)] px-1">Loading brands...</div>
        )}
      </div>
    </div>
  )
}
