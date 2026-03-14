import { createFileRoute } from '@tanstack/react-router'
import * as orch from '../../server/orchestrator'

type Action =
  | { action: 'list-brands' }
  | { action: 'brand-status'; slug: string }
  | { action: 'research'; slug: string; keywords: string[]; priority?: string }
  | { action: 'audit'; slug: string }
  | { action: 'audit-all' }
  | { action: 'audit-history'; slug: string; limit?: number }
  | { action: 'social'; slug: string; limit?: number }
  | { action: 'regenerate'; slug: string; limit?: number }
  | { action: 'revenue' }
  | { action: 'send-message'; machine: string; agent: string; text: string }
  | { action: 'audit-and-fill'; slug: string }
  | { action: 'full-pipeline'; slug: string; keywords: string[] }

export const Route = createFileRoute('/api/orchestrate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Action

        try {
          switch (body.action) {
            case 'list-brands':
              return Response.json(await orch.listBrands())

            case 'brand-status':
              return Response.json(await orch.getBrandStatus(body.slug))

            case 'research':
              return Response.json(
                await orch.triggerResearch(body.slug, body.keywords, body.priority),
              )

            case 'audit':
              return Response.json(await orch.runAudit(body.slug))

            case 'audit-all':
              return Response.json(await orch.runAuditAll())

            case 'audit-history':
              return Response.json(await orch.getAuditHistory(body.slug, body.limit))

            case 'social':
              return Response.json(await orch.triggerSocial(body.slug, body.limit))

            case 'regenerate':
              return Response.json(await orch.regenerateContent(body.slug, body.limit))

            case 'revenue':
              return Response.json(await orch.getRevenueDashboard())

            case 'send-message':
              return Response.json(
                await orch.sendMessage(body.machine, body.agent, body.text),
              )

            case 'audit-and-fill':
              return Response.json(await orch.auditAndFill(body.slug))

            case 'full-pipeline':
              return Response.json(await orch.fullPipeline(body.slug, body.keywords))

            default:
              return Response.json({ error: 'Unknown action' }, { status: 400 })
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
