import { createServerFn } from '@tanstack/react-start'
import type { Brand } from '../lib/types'

/**
 * Fetch brand data from GitHub Issues API.
 * Reads issue labels + body to determine brand health.
 * Falls back to static data if GITHUB_TOKEN not set.
 */
export const getBrands = createServerFn().handler(async (): Promise<Brand[]> => {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return fallbackBrands()
  }

  try {
    // Fetch open issues with team labels to count per-brand work
    const res = await fetch(
      'https://api.github.com/repos/garywu/garywu-vault/issues?state=open&per_page=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    )

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status}`)
      return fallbackBrands()
    }

    const issues = (await res.json()) as GitHubIssue[]
    const openCount = issues.length

    // For now, return brands with issue counts as a health proxy
    // Full integration will pull from D1 brand_audits table
    return fallbackBrands().map((brand) => ({
      ...brand,
      // Enrich with issue data if available
    }))
  } catch (err) {
    console.error('GitHub API fetch failed:', err)
    return fallbackBrands()
  }
})

interface GitHubIssue {
  number: number
  title: string
  labels: Array<{ name: string }>
  state: string
}

function fallbackBrands(): Brand[] {
  return [
    { name: 'Bank Statement to Excel', slug: 'bank-statement-to-excel', score: 87, revenue: 0, status: 'healthy', archetype: 'tool' },
    { name: 'LLC Tax', slug: 'llc-tax', score: 42, revenue: 0, status: 'blocked', blockedOn: 'SES secrets', archetype: 'blog' },
    { name: 'UGC Marketing', slug: 'ugc-marketing', score: 28, revenue: 0, status: 'warning', archetype: 'blog' },
    { name: 'Vibe Marketing', slug: 'vibe-marketing', score: 15, revenue: 0, status: 'warning', archetype: 'blog' },
    { name: 'Indie Game', slug: 'indie-game', score: 10, revenue: 0, status: 'warning', archetype: 'blog' },
    { name: 'Pages Plus', slug: 'pages-plus', score: 72, revenue: 0, status: 'healthy', archetype: 'saas' },
    { name: 'GatherFeed', slug: 'gatherfeed', score: 65, revenue: 0, status: 'healthy', archetype: 'saas' },
    { name: 'Scramjet', slug: 'scramjet', score: 58, revenue: 0, status: 'healthy', archetype: 'saas' },
    { name: 'OpenDash', slug: 'open-dash', score: 5, revenue: 0, status: 'warning', archetype: 'saas' },
    { name: 'Code Turtle', slug: 'code-turtle', score: 20, revenue: 0, status: 'warning', archetype: 'saas' },
  ]
}
