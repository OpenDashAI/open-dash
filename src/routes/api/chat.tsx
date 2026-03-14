import { createFileRoute } from '@tanstack/react-router'
import { streamText, convertToModelMessages } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { UIMessage } from 'ai'

const SYSTEM_PROMPT = `You are the OpenDash AI — an operations control plane assistant. You help manage machines, brands, and execution across a multi-project portfolio.

You have deep knowledge of:
- 4 machines on Tailscale: providence (macOS, primary), destiny (macOS, secondary), stargate (Windows, GPU), stargate-wsl (Linux/WSL)
- 19 brands: 5 content (bank-statement-to-excel, llc-tax, ugc-marketing, vibe-marketing, indie-game), 14 product
- DRR: $0 after 10 trains. Revenue blocked on human tasks (Stripe, SES, AdSense).
- Train 11: Growth Machine — building automated marketing growth pipeline. Target: $10K/month.
- Tech: Cloudflare Workers, D1, Queues, Astro (Pages-Plus), TanStack Start (OpenDash)
- Services: Scramjet (pipeline), Scalable Media (brand operator), API Mom (managed keys), GatherFeed (research), Pages-Plus (multi-site), Social-Good (social), Virtual-Media (API gateway)

Be concise and actionable. Use markdown formatting. When discussing brands or machines, reference specific data.`

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

        const result = streamText({
          model: openrouter.chatModel('qwen/qwen-2.5-72b-instruct'),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
          maxTokens: 2048,
        })

        return result.toUIMessageStreamResponse()
      },
    },
  },
})
