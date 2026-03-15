import { createFileRoute } from '@tanstack/react-router'
import { streamText, convertToModelMessages, tool } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import type { UIMessage } from 'ai'
import * as orch from '../../server/orchestrator'

const BASE_SYSTEM_PROMPT = `You are the OpenDash AI — an operations control plane assistant. You help manage machines, brands, and execution across a multi-project portfolio.

You have deep knowledge of:
- 4 machines on Tailscale: providence (macOS, primary), destiny (macOS, secondary), stargate (Windows, GPU), stargate-wsl (Linux/WSL)
- 19 brands: 5 content (bank-statement-to-excel, llc-tax, ugc-marketing, vibe-marketing, indie-game), 14 product
- DRR: $0 after 10 trains. Revenue blocked on human tasks (Stripe, SES, AdSense).
- Train 11: Growth Machine — building automated marketing growth pipeline. Target: $10K/month.
- Tech: Cloudflare Workers, D1, Queues, Astro (Pages-Plus), TanStack Start (OpenDash)
- Services: Scramjet (pipeline), Scalable Media (brand operator), API Mom (managed keys), GatherFeed (research), Pages-Plus (multi-site), Social-Good (social), Virtual-Media (API gateway)

You can execute real operations via tools. Use them when the user asks to audit, research, generate content, or check status. Always confirm destructive operations before executing.

Be concise and actionable. Use markdown formatting. When discussing brands or machines, reference specific data.

When the conversation warrants a HUD display change (mode switch, spawning cards), append a directive block after your text response:

---HUD---
{"mode": "building", "cards": [{"type": "brand_card", "props": {"name": "LLC Tax", "slug": "llc-tax", "score": 42, "revenue": 0, "status": "blocked"}, "position": "left"}]}

Available modes: operating, building, analyzing, reviewing, alert
Available card types: machine_card, brand_card, activity_card, status_card, approval_card, issue_card
Card positions: left, center

Only include ---HUD--- when contextually appropriate. Most responses need no directives.`

/** Brand context injected when the user is in Focus mode */
const BRAND_CONTEXT: Record<string, string> = {
  'bank-statement-to-excel': `FOCUSED PROJECT: Bank Statement to Excel (bankstatementtoexcel.com)
- Content brand. 33 articles published. Only homepage indexed by Google.
- Zero DA, zero backlinks. SERP for main keyword is 100% tools, not articles.
- Archetype: Tool/Converter. Needs tool page + PDF converter to rank.
- Revenue: $0. Monetization: AdSense + affiliate links.`,

  'llc-tax': `FOCUSED PROJECT: LLC Tax Tips (llctax.co)
- Content brand. 10 affiliate articles shipped (44,881 words, 16,870 monthly search vol).
- 9 directory entries seeded. Revenue potential: $375/month at 1% conversion.
- Human task pending: sign up for ZenBusiness/Bizee/LegalZoom affiliate programs.
- Archetype: Blog + Directory. Monetization: affiliate commissions.`,

  'ugc-marketing': `FOCUSED PROJECT: UGC Playbook (ugcplaybook.com)
- Content brand focused on UGC marketing education.
- Social-Good account: UGCPlaybook. Social drafts generated.
- Archetype: Blog + Newsletter. Monetization: courses + affiliate.`,

  'vibe-marketing': `FOCUSED PROJECT: Vibe Marketing Pro (vibemarketing.pro)
- Content brand. Fast-track candidate: lead magnet + AI tool affiliate funnel.
- Social-Good account: VibeMarketPro. Social drafts generated.
- Archetype: Blog + Tool. Monetization: affiliate + sponsored content.`,

  'indie-game': `FOCUSED PROJECT: Indie Game Dev (indiegamedev.tips)
- Content brand for indie game developers.
- Social-Good account: IndieGameDev. Social drafts generated.
- Archetype: Blog + Newsletter. Monetization: affiliate + courses.`,

  'pages-plus': `FOCUSED PROJECT: Pages Plus (pages.plus)
- Product brand. Multi-site SSR platform on Cloudflare Workers.
- One Worker serves N sites. Astro-based. 36 competitors analyzed.
- LTD strategy planned. Beta waitlist live.
- Revenue: product sales. Target: $49-199 LTD.`,

  'scramjet': `FOCUSED PROJECT: Scramjet
- Pipeline engine. D1+R2+DO+Workflows+Queues. 22+ operators.
- Internal infrastructure — powers all other brands.
- Not directly monetized.`,

  'scalable-media': `FOCUSED PROJECT: Scalable Media
- Autonomous brand operator. BrandAgent DO + ContentWorkflow + Queues.
- Auth: X-Service-Key. The "brain" of the system.
- Queue topology: 8 queues + 4 DLQs.`,

  'api-mom': `FOCUSED PROJECT: API Mom (apimom.dev)
- Managed API keys, cost attribution, cache. 8 providers.
- MCP server for Claude Code integration.
- Monetization: internal cost savings.`,

  'gatherfeed': `FOCUSED PROJECT: GatherFeed
- Async research engine + iterative deep research (L1-L4).
- L3 = 16x cheaper than Perplexity. Keyword storage.
- The "eyes" of the system.`,
}

function buildSystemPrompt(focusBrand: string | null): string {
  if (!focusBrand) return BASE_SYSTEM_PROMPT

  const brandContext = BRAND_CONTEXT[focusBrand]
  const contextBlock = brandContext
    ? `\n\n${brandContext}`
    : `\n\nFOCUSED PROJECT: ${focusBrand}\nThe user is currently focused on this project. When they say "this", "it", or "audit", they mean this brand. Use the brand slug "${focusBrand}" when calling tools.`

  return `${BASE_SYSTEM_PROMPT}${contextBlock}

IMPORTANT: The user is in Project Focus mode for "${focusBrand}". When they refer to "this project", "this brand", "this", or "it", they mean ${focusBrand}. Automatically use slug "${focusBrand}" for any tool calls that need a brand slug — don't ask which brand.`
}

const orchestratorTools = {
  listBrands: tool({
    description: 'List all brands with their slugs and domains',
    parameters: z.object({}),
    execute: async () => orch.listBrands(),
  }),
  brandStatus: tool({
    description: 'Get pipeline status for a brand — agent state, content counts, recent content',
    parameters: z.object({
      slug: z.string().describe('Brand slug (e.g. "llc-tax", "vibe-marketing")'),
    }),
    execute: async ({ slug }) => orch.getBrandStatus(slug),
  }),
  triggerResearch: tool({
    description: 'Start research pipeline for keywords on a brand. Dispatches to GatherFeed, then auto-generates content.',
    parameters: z.object({
      slug: z.string().describe('Brand slug'),
      keywords: z.array(z.string()).describe('Keywords to research'),
      priority: z.enum(['high', 'normal', 'low']).default('normal'),
    }),
    execute: async ({ slug, keywords, priority }) => orch.triggerResearch(slug, keywords, priority),
  }),
  runAudit: tool({
    description: 'Run a full site audit for a brand — checks blog, newsletter, directory, and design scores',
    parameters: z.object({
      slug: z.string().describe('Brand slug'),
    }),
    execute: async ({ slug }) => orch.runAudit(slug),
  }),
  auditAll: tool({
    description: 'Run audits for all brands with domains. Returns portfolio-wide scores.',
    parameters: z.object({}),
    execute: async () => orch.runAuditAll(),
  }),
  auditHistory: tool({
    description: 'Get audit score history for a brand over time',
    parameters: z.object({
      slug: z.string().describe('Brand slug'),
      limit: z.number().default(10),
    }),
    execute: async ({ slug, limit }) => orch.getAuditHistory(slug, limit),
  }),
  triggerSocial: tool({
    description: 'Generate social media drafts from existing articles for a brand',
    parameters: z.object({
      slug: z.string().describe('Brand slug'),
      limit: z.number().default(10).describe('Max articles to process'),
    }),
    execute: async ({ slug, limit }) => orch.triggerSocial(slug, limit),
  }),
  regenerateContent: tool({
    description: 'Regenerate articles for a brand through the full pipeline',
    parameters: z.object({
      slug: z.string().describe('Brand slug'),
      limit: z.number().default(5).describe('Max articles to regenerate'),
    }),
    execute: async ({ slug, limit }) => orch.regenerateContent(slug, limit),
  }),
  revenueDashboard: tool({
    description: 'Get revenue dashboard — monthly totals per brand and $/hour rate',
    parameters: z.object({}),
    execute: async () => orch.getRevenueDashboard(),
  }),
  fullPipeline: tool({
    description: 'Dispatch full pipeline: research → content → publish → social for a brand',
    parameters: z.object({
      slug: z.string().describe('Brand slug'),
      keywords: z.array(z.string()).describe('Keywords to process'),
    }),
    execute: async ({ slug, keywords }) => orch.fullPipeline(slug, keywords),
  }),
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages: UIMessage[]; focusBrand?: string | null }
        const { messages, focusBrand } = body

        if (!messages || !Array.isArray(messages)) {
          return Response.json({ error: 'messages array required' }, { status: 400 })
        }

        const openRouterKey = process.env.OPENROUTER_KEY
        if (!openRouterKey) {
          return Response.json({ error: 'OPENROUTER_KEY not configured' }, { status: 500 })
        }

        const openrouter = createOpenAICompatible({
          name: 'openrouter',
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: openRouterKey,
          headers: {
            'HTTP-Referer': 'https://opendash.ai',
            'X-Title': 'OpenDash',
          },
        })

        // Use a model that supports tool calling
        const result = streamText({
          model: openrouter.chatModel('qwen/qwen-2.5-72b-instruct'),
          system: buildSystemPrompt(focusBrand ?? null),
          messages: await convertToModelMessages(messages),
          tools: orchestratorTools,
          maxSteps: 5, // Allow multi-step tool use
          maxTokens: 2048,
        })

        return result.toUIMessageStreamResponse()
      },
    },
  },
})
