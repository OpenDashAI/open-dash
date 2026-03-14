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
\`\`\`
---HUD---
{"mode": "operating", "cards": [{"type": "brand_card", "props": {"name": "LLC Tax", "slug": "llc-tax", "score": 42, "revenue": 0, "status": "blocked", "blockedOn": "SES secrets"}, "position": "left"}]}
\`\`\`

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
 * Chat with the AI. Sends messages to Claude API and parses HUD directives.
 */
export const sendChat = createServerFn()
  .inputValidator((data: ChatRequest) => data)
  .handler(async ({ data }): Promise<ChatResponse> => {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return parseResponse(
        `I'm running in demo mode — no API key configured. Set ANTHROPIC_API_KEY to enable the AI backend.\n\nYou said: "${data.messages.at(-1)?.content}"`,
      )
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20241022',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: data.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error(`Claude API error: ${res.status}`, error)
        return { text: `API error (${res.status}). Running in demo mode.` }
      }

      const body = (await res.json()) as {
        content: Array<{ type: string; text?: string }>
      }

      const text = body.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('')

      return parseResponse(text)
    } catch (err) {
      console.error('Chat error:', err)
      return { text: 'Connection error. Check API configuration.' }
    }
  })

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
    // If JSON parse fails, return text only
    return { text: raw.trim() }
  }
}
