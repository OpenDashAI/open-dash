import { createServerFn } from '@tanstack/react-start'

interface ResearchRequest {
  query: string
  depth?: 1 | 2 | 3 | 4
}

interface ResearchResponse {
  research_id: string
  cached: boolean
  depth: number
  data: {
    summary?: string
    sources?: Array<{ title: string; url: string; snippet: string }>
    key_facts?: string[]
    questions?: string[]
  }
}

/**
 * Deep research via GatherFeed.
 * L1=$0.01 (quick), L2=$0.10 (detailed), L3=$0.30 (deep), L4=$1.00 (exhaustive)
 * Routes through API Mom for caching + cost tracking.
 */
export const research = createServerFn()
  .inputValidator((data: ResearchRequest) => data)
  .handler(async ({ data }): Promise<ResearchResponse> => {
    const apiMomUrl = process.env.API_MOM_URL
    const apiMomKey = process.env.API_MOM_KEY
    const depth = data.depth ?? 1

    if (!apiMomUrl || !apiMomKey) {
      return {
        research_id: 'demo',
        cached: false,
        depth,
        data: {
          summary: `Research not available — configure API_MOM_URL. Query: "${data.query}"`,
          sources: [],
          key_facts: [],
          questions: [],
        },
      }
    }

    try {
      const res = await fetch(`${apiMomUrl}/gatherfeed/api/v1/research/deep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Project-ID': 'open-dash',
          'X-API-Key': apiMomKey,
        },
        body: JSON.stringify({
          keyword: data.query,
          depth,
          project: 'open-dash',
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error(`GatherFeed research error ${res.status}:`, error)
        return {
          research_id: 'error',
          cached: false,
          depth,
          data: { summary: `Research failed (${res.status})`, sources: [], key_facts: [], questions: [] },
        }
      }

      return (await res.json()) as ResearchResponse
    } catch (err) {
      console.error('Research fetch error:', err)
      return {
        research_id: 'error',
        cached: false,
        depth,
        data: { summary: 'Research connection error', sources: [], key_facts: [], questions: [] },
      }
    }
  })
