import { createFileRoute } from '@tanstack/react-router'

interface D1Database {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
    }
  }
}

function getDB(): D1Database {
  const db = (process.env as Record<string, unknown>).DB as D1Database | undefined
  if (!db) throw new Error('DB binding not available')
  return db
}

export const Route = createFileRoute('/api/threads')({
  server: {
    handlers: {
      /** GET /api/threads — list threads or load a thread's messages */
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const threadId = url.searchParams.get('threadId')
        const db = getDB()

        if (threadId) {
          const { results } = await db
            .prepare('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC')
            .bind(threadId)
            .all<{ id: string; thread_id: string; role: string; parts: string; created_at: string }>()

          return Response.json(
            results.map((r) => ({
              id: r.id,
              role: r.role,
              parts: JSON.parse(r.parts),
              createdAt: r.created_at,
            })),
          )
        }

        const { results } = await db
          .prepare('SELECT * FROM threads ORDER BY updated_at DESC LIMIT 50')
          .all<{ id: string; title: string | null; created_at: string; updated_at: string }>()

        return Response.json(results)
      },

      /** POST /api/threads — save a message */
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          threadId: string
          messageId: string
          role: string
          parts: unknown[]
          title?: string
        }

        const db = getDB()

        // Upsert thread
        await db
          .prepare(
            `INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))
             ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now'), title = COALESCE(excluded.title, threads.title)`,
          )
          .bind(body.threadId, body.title ?? null)
          .run()

        // Insert message
        await db
          .prepare(
            "INSERT OR REPLACE INTO messages (id, thread_id, role, parts, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
          )
          .bind(body.messageId, body.threadId, body.role, JSON.stringify(body.parts))
          .run()

        return Response.json({ success: true })
      },
    },
  },
})
