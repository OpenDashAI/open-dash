import { createServerFn } from '@tanstack/react-start'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
}

interface ChatResponse {
  text: string
  mode?: string
  cards?: Array<{
    type: string
    props: Record<string, unknown>
    position: 'left' | 'center' | 'inline'
  }>
}

const SYSTEM_PROMPT = `You are the OpenDash AI — an operations control plane assistant. You help manage machines, brands, and execution across a multi-project portfolio.

You respond in two parts:
1. **Text**: Your conversational response to the user.
2. **Directives**: JSON metadata that controls the HUD display.

After your text response, if you want to change the display, output a line starting with "---HUD---" followed by a JSON object:
---HUD---
{"mode": "operating", "cards": [{"type": "brand_card", "props": {"name": "LLC Tax", "slug": "llc-tax", "score": 42, "revenue": 0, "status": "blocked", "blockedOn": "SES secrets"}, "position": "left"}]}

Available modes: operating, building, analyzing, reviewing, alert
Available card types: machine_card, brand_card, activity_card, status_card

Only include the ---HUD--- section when the conversation context warrants a display change. For simple responses, just reply with text.

Current context:
- 4 machines on Tailscale: providence (macOS, primary), destiny (macOS, secondary), stargate (Windows, GPU), stargate-wsl (Linux/WSL)
- 19 brands: 5 content (bank-statement-to-excel, llc-tax, ugc-marketing, vibe-marketing, indie-game), 14 product
- DRR: $0 after 10 trains. Revenue blocked on human tasks (Stripe, SES, AdSense).
- Train 10 complete (100%). Planning due.
- Tech: Cloudflare Workers, D1, Queues, Astro (Pages-Plus), TanStack Start (OpenDash)
`

/**
 * Model tiers — route by query complexity.
 *
 * Tier 1 (free):     Workers AI / Ollama — status lookups, data formatting
 * Tier 2 (cheap):    Tongyi/Qwen via API Mom → OpenRouter — conversational, HUD directives
 * Tier 3 (research): GatherFeed L1-L4 — investigation queries
 * Tier 4 (expensive): Claude Pro/Max subscription — reserved for interactive Claude Code sessions
 *
 * The dashboard chat should almost never need Tier 4.
 * Most queries are Tier 1 (data lookup) or Tier 2 (formatting + reasoning).
 */

const TIER2_MODEL = 'qwen/qwen-2.5-72b-instruct'  // ~$0.0003/call via OpenRouter

/**
 * Chat with the AI. Routes through API Mom → OpenRouter for cost efficiency.
 * Falls back gracefully: API Mom → direct OpenRouter → demo mode.
 */
export const sendChat = createServerFn()
  .inputValidator((data: ChatRequest) => data)
  .handler(async ({ data }): Promise<ChatResponse> => {
    const apiMomUrl = process.env.API_MOM_URL     // e.g. https://apimom.dev
    const apiMomKey = process.env.API_MOM_KEY      // X-API-Key for API Mom
    const openRouterKey = process.env.OPENROUTER_KEY // OpenRouter API key (BYOK via API Mom)

    // Try API Mom first (cached, cost-tracked, budget-enforced)
    if (apiMomUrl && apiMomKey) {
      try {
        return await chatViaApiMom(data, apiMomUrl, apiMomKey, openRouterKey)
      } catch (err) {
        console.error('API Mom chat failed, trying direct:', err)
      }
    }

    // Fallback: direct OpenRouter (no caching/cost tracking)
    if (openRouterKey) {
      try {
        return await chatViaOpenRouter(data, openRouterKey)
      } catch (err) {
        console.error('Direct OpenRouter failed:', err)
      }
    }

    // Demo mode — no API keys configured
    return parseResponse(
      `Running in demo mode — configure API_MOM_URL + API_MOM_KEY to enable AI.\n\nYou said: "${data.messages.at(-1)?.content}"`,
    )
  })

/**
 * Route chat through API Mom → OpenRouter.
 * Benefits: permanent cache, cost attribution, budget enforcement, fallback chain.
 */
async function chatViaApiMom(
  data: ChatRequest,
  apiMomUrl: string,
  apiMomKey: string,
  openRouterKey?: string,
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Project-ID': 'open-dash',
    'X-API-Key': apiMomKey,
  }
  if (openRouterKey) {
    headers['X-Provider-Key'] = openRouterKey
  }

  const res = await fetch(`${apiMomUrl}/openrouter/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: TIER2_MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...data.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API Mom error ${res.status}: ${error}`)
  }

  const body = (await res.json()) as OpenRouterResponse
  const text = body.choices?.[0]?.message?.content ?? ''

  // Log cost headers for observability
  const cacheStatus = res.headers.get('X-APIMom-Cache')
  const cost = res.headers.get('X-APIMom-Cost')
  if (cacheStatus) console.log(`[chat] cache=${cacheStatus} cost=${cost ?? 'n/a'}`)

  return parseResponse(text)
}

/**
 * Direct OpenRouter fallback (no API Mom).
 */
async function chatViaOpenRouter(data: ChatRequest, apiKey: string): Promise<ChatResponse> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://opendash.ai',
      'X-Title': 'OpenDash',
    },
    body: JSON.stringify({
      model: TIER2_MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...data.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${error}`)
  }

  const body = (await res.json()) as OpenRouterResponse
  const text = body.choices?.[0]?.message?.content ?? ''
  return parseResponse(text)
}

interface OpenRouterResponse {
  choices: Array<{
    message: { role: string; content: string }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_cost?: number
  }
}

/**
 * Parse AI response text, extracting HUD directives if present.
 */
function parseResponse(raw: string): ChatResponse {
  const hudMarker = '---HUD---'
  const markerIndex = raw.indexOf(hudMarker)

  if (markerIndex === -1) {
    return { text: raw.trim() }
  }

  const text = raw.slice(0, markerIndex).trim()
  const hudJson = raw.slice(markerIndex + hudMarker.length).trim()

  try {
    const directives = JSON.parse(hudJson) as { mode?: string; cards?: ChatResponse['cards'] }
    return {
      text,
      mode: directives.mode,
      cards: directives.cards,
    }
  } catch {
    return { text: raw.trim() }
  }
}
