import { createFileRoute } from '@tanstack/react-router'
import { streamText, convertToModelMessages, tool } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import type { UIMessage } from 'ai'
import * as orch from '../../server/orchestrator'

const SYSTEM_PROMPT = `You are the OpenDash AI — an operations control plane assistant. You help manage machines, brands, and execution across a multi-project portfolio.

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
        const { messages } = (await request.json()) as { messages: UIMessage[] }

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
          system: SYSTEM_PROMPT,
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
