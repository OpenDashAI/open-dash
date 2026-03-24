/**
 * Worker context — stores Cloudflare bindings and per-request auth context
 *
 * Global bindings (D1 database, environment):
 * - Set once at worker startup
 * - Read by server functions via getWorkerDb()
 *
 * Per-request auth context (RBAC permissions):
 * - Set by middleware after loading auth context
 * - Read by handlers via getRequestAuthContext(request)
 * - Automatically cleaned up after response completes
 */

import type { D1Database } from "@cloudflare/workers-types";
import type { AuthContext } from "@/server/rbac";

// Global bindings
let workerDb: D1Database | undefined;

// Per-request auth context — Map<Request, AuthContext>
// Using Map instead of WeakMap for simpler cleanup and better debugging
const requestAuthMap = new Map<Request, AuthContext>();

/**
 * Initialize global worker context (call once at startup)
 */
export function initWorkerContext(db: D1Database) {
	workerDb = db;
}

/**
 * Get global D1 database binding
 */
export function getWorkerDb(): D1Database | undefined {
	return workerDb;
}

/**
 * Store auth context for a request (call in middleware)
 */
export function setRequestAuthContext(
	request: Request,
	authContext: AuthContext
): void {
	requestAuthMap.set(request, authContext);
}

/**
 * Get auth context for a request (call in handlers)
 * Throws 401 if auth context not found (missing middleware setup)
 */
export function getRequestAuthContext(request: Request): AuthContext {
	const auth = requestAuthMap.get(request);
	if (!auth) {
		throw new Response(
			JSON.stringify({
				error: "Unauthorized",
				message: "Auth context not loaded. Check middleware setup.",
			}),
			{
				status: 401,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
	return auth;
}

/**
 * Check if auth context exists for request (for optional routes)
 */
export function hasRequestAuthContext(request: Request): boolean {
	return requestAuthMap.has(request);
}

/**
 * Clear auth context for a request (call after response completes)
 * Prevents memory leaks from accumulating old requests
 */
export function clearRequestAuthContext(request: Request): void {
	requestAuthMap.delete(request);
}
