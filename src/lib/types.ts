/** Machine status from Tailscale or heartbeat */
export interface Machine {
  hostname: string
  os: string
  status: 'online' | 'offline' | 'busy'
  ip: string
  tasks: number
  cpu?: number
  lastSeen?: string
}

/** Brand status from vault/GitHub */
export interface Brand {
  name: string
  slug: string
  score: number
  revenue: number
  status: 'healthy' | 'warning' | 'blocked'
  blockedOn?: string
  archetype?: string
}

/** Activity event */
export interface ActivityEvent {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
  time: string
  source?: string
}

/** Status metric for KPI cards */
export interface StatusMetric {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'flat'
}

/** GitHub issue */
export interface Issue {
  number: number
  title: string
  labels: string[]
  state: 'open' | 'closed'
  assignee?: string
  updatedAt?: string
}

/** Card directive emitted by AI alongside chat text */
export interface CardDirective {
  type: string
  props: Record<string, unknown>
  position: 'left' | 'center' | 'inline'
}

/** AI chat response with optional panel directives */
export interface HudResponse {
  text: string
  mode?: string
  cards?: CardDirective[]
}

/** Full HUD state shared between panels */
export interface HudState {
  mode: 'operating' | 'building' | 'analyzing' | 'reviewing' | 'alert'
  machines: Machine[]
  brands: Brand[]
  events: ActivityEvent[]
  metrics: StatusMetric[]
  issues: Issue[]
  cards: CardDirective[]
}
