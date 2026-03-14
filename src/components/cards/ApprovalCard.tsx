import { useState } from 'react'

export interface ApprovalCardProps {
  id: string
  title: string
  description: string
  source: string
  urgency?: 'low' | 'medium' | 'high'
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function ApprovalCard({ id, title, description, source, urgency = 'medium', onApprove, onReject }: ApprovalCardProps) {
  const [resolved, setResolved] = useState<'approved' | 'rejected' | null>(null)

  const urgencyColor = urgency === 'high' ? 'var(--hud-error)' : urgency === 'medium' ? 'var(--hud-warning)' : 'var(--hud-text-muted)'

  if (resolved) {
    return (
      <div className="hud-card opacity-60">
        <div className="text-[11px] text-[var(--hud-text-muted)]">
          {resolved === 'approved' ? '\u2713 Approved' : '\u2717 Rejected'}: {title}
        </div>
      </div>
    )
  }

  return (
    <div className="hud-card" style={{ borderLeftColor: urgencyColor, borderLeftWidth: '2px' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: urgencyColor }}>
          {urgency}
        </span>
        <span className="text-[10px] text-[var(--hud-text-muted)] ml-auto">{source}</span>
      </div>
      <div className="font-semibold text-[var(--hud-text-bright)] text-[13px] mb-1">{title}</div>
      <div className="text-[12px] text-[var(--hud-text-muted)] mb-2">{description}</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setResolved('approved'); onApprove?.(id) }}
          className="px-3 py-1 rounded text-[11px] font-semibold bg-[rgba(52,211,153,0.15)] text-[var(--hud-success)] border border-[rgba(52,211,153,0.3)] hover:bg-[rgba(52,211,153,0.25)] transition-colors"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => { setResolved('rejected'); onReject?.(id) }}
          className="px-3 py-1 rounded text-[11px] font-semibold bg-[rgba(248,113,113,0.15)] text-[var(--hud-error)] border border-[rgba(248,113,113,0.3)] hover:bg-[rgba(248,113,113,0.25)] transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
