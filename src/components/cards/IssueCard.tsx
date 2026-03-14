export interface IssueCardProps {
  number: number
  title: string
  labels: string[]
  state: 'open' | 'closed'
  assignee?: string
}

const LABEL_COLORS: Record<string, string> = {
  'team-1-pp': 'bg-blue-500/20 text-blue-300',
  'team-2-sm': 'bg-purple-500/20 text-purple-300',
  'team-3-infra': 'bg-amber-500/20 text-amber-300',
  'team-4-aso': 'bg-emerald-500/20 text-emerald-300',
  automated: 'bg-cyan-500/20 text-cyan-300',
  'needs-review': 'bg-yellow-500/20 text-yellow-300',
  'human-required': 'bg-red-500/20 text-red-300',
}

export function IssueCard({ number, title, labels, state, assignee }: IssueCardProps) {
  return (
    <div className="hud-card">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[11px] font-mono ${state === 'open' ? 'text-[var(--hud-success)]' : 'text-[var(--hud-text-muted)]'}`}>
          #{number}
        </span>
        <span className="text-[13px] text-[var(--hud-text-bright)] truncate flex-1">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {labels.map((label) => (
          <span
            key={label}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${LABEL_COLORS[label] ?? 'bg-[var(--hud-accent-dim)] text-[var(--hud-accent)]'}`}
          >
            {label}
          </span>
        ))}
        {assignee && (
          <span className="text-[10px] text-[var(--hud-text-muted)] ml-auto">@{assignee}</span>
        )}
      </div>
    </div>
  )
}
