/**
 * Worker context — stores Cloudflare bindings for use in server functions
 * Set once at worker startup, read by server functions
 */

import type { D1Database } from "@cloudflare/workers-types"

let workerDb: D1Database | undefined

export function initWorkerContext(db: D1Database) {
	workerDb = db
}

export function getWorkerDb(): D1Database | undefined {
	return workerDb
}
