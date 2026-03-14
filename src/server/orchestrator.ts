/**
 * L2 Orchestrator — SM API client for autonomous operations.
 * OpenDash chat AI calls these to dispatch real work.
 */

interface SMConfig {
  baseUrl: string
  serviceKey: string
}

function getConfig(): SMConfig {
  const baseUrl = process.env.SM_API_URL
  const serviceKey = process.env.SM_SERVICE_KEY
  if (!baseUrl || !serviceKey) throw new Error('SM_API_URL and SM_SERVICE_KEY required')
  return { baseUrl, serviceKey }
}

async function smFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { baseUrl, serviceKey } = getConfig()
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Key': serviceKey,
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SM API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// --- Brand Operations ---

export async function listBrands() {
  return smFetch<{ brands: Array<{ slug: string; name: string; fqdn?: string }> }>('/v1/brands')
}

export async function getBrandStatus(slug: string) {
  return smFetch<{
    brand_slug: string
    agent: Record<string, unknown>
    content_counts: Record<string, number>
    recent_content: unknown[]
  }>(`/v1/brands/${slug}/status`)
}

// --- Research Pipeline ---

export async function triggerResearch(slug: string, keywords: string[], priority = 'normal') {
  return smFetch<{ ok: boolean; keywords: string[]; message: string }>(
    `/v1/brands/${slug}/research`,
    {
      method: 'POST',
      body: JSON.stringify({ keywords, priority }),
    },
  )
}

// --- Audit ---

export async function runAudit(slug: string) {
  return smFetch<{
    ok: boolean
    brand_slug: string
    scores: Record<string, number>
    actions: Array<{ type: string; description: string }>
    auto_actions_executed: number
  }>(`/v1/brands/${slug}/audit`, { method: 'POST' })
}

export async function runAuditAll() {
  return smFetch<{
    ok: boolean
    audited: number
    results: Array<{
      brand_slug: string
      blog_pct: number
      nl_pct: number
      dir_pct: number
      design_pct: number
      articles: number
      auto_actions: number
    }>
  }>('/v1/audit-all', { method: 'POST' })
}

export async function getAuditHistory(slug: string, limit = 10) {
  return smFetch<{
    ok: boolean
    audits: Array<{
      audited_at: string
      blog_score_pct: number
      nl_score_pct: number
      dir_score_pct: number
      design_score_pct: number
      article_count: number
    }>
  }>(`/v1/brands/${slug}/audits?limit=${limit}`)
}

// --- Content ---

export async function triggerSocial(slug: string, limit = 10) {
  return smFetch<{ ok: boolean; queued: number; message: string }>(
    `/v1/brands/${slug}/social`,
    {
      method: 'POST',
      body: JSON.stringify({ limit }),
    },
  )
}

export async function regenerateContent(slug: string, limit = 5) {
  return smFetch<{ ok: boolean; regenerating: number; keywords: string[]; message: string }>(
    `/v1/brands/${slug}/regenerate`,
    {
      method: 'POST',
      body: JSON.stringify({ limit }),
    },
  )
}

// --- Revenue ---

export async function getRevenueDashboard() {
  return smFetch<{
    brands: Array<{ brand_slug: string; monthly_total: number }>
    total_monthly: number
    per_hour_24_7: number
  }>('/v1/revenue/dashboard')
}

// --- Coordinator ---

export async function sendMessage(machine: string, agent: string, text: string) {
  return smFetch<{ ok: boolean }>('/coordinator/send', {
    method: 'POST',
    body: JSON.stringify({ machine, agent, text }),
  })
}

// --- Compound Operations (L2 autonomy) ---

/** Audit a brand and auto-research any gaps found */
export async function auditAndFill(slug: string) {
  const audit = await runAudit(slug)
  return {
    audit,
    summary: `Audited ${slug}: blog=${audit.scores?.blog_pct ?? 0}%, ${audit.auto_actions_executed} auto-actions executed`,
  }
}

/** Full pipeline: research → content → social for a brand */
export async function fullPipeline(slug: string, keywords: string[]) {
  const research = await triggerResearch(slug, keywords, 'high')
  return {
    research,
    summary: `Dispatched ${keywords.length} keywords for ${slug}. Pipeline: research → content → publish → social (async).`,
  }
}
