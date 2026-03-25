/**
 * Rate Limiting Middleware for TanStack Start
 *
 * Implements per-request rate limiting checks.
 * Use in route handlers to prevent abuse.
 */

export interface RateLimitConfig {
	/** Maximum requests allowed */
	maxRequests: number;
	/** Time window in seconds */
	windowSeconds: number;
}

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

/** In-memory rate limit store */
const store = new Map<string, RateLimitEntry>();

/**
 * Endpoint-specific rate limit configs
 */
export const rateLimitConfigs = {
	auth: { maxRequests: 5, windowSeconds: 60 } as const,
	api: { maxRequests: 100, windowSeconds: 60 } as const,
	search: { maxRequests: 30, windowSeconds: 60 } as const,
	export: { maxRequests: 20, windowSeconds: 300 } as const,
};

/**
 * Extract client identifier from request
 */
function getClientId(request: Request, userId?: string): string {
	if (userId) {
		return `user:${userId}`;
	}
	const ip =
		request.headers.get("CF-Connecting-IP") ||
		request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
		"unknown";
	return `ip:${ip}`;
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
	request: Request,
	config: RateLimitConfig,
	userId?: string
): {
	allowed: boolean;
	remaining: number;
	resetAt: number;
} {
	const now = Date.now();
	const clientId = getClientId(request, userId);

	let entry = store.get(clientId);

	// Create or reset entry
	if (!entry || now >= entry.resetAt) {
		entry = {
			count: 0,
			resetAt: now + config.windowSeconds * 1000,
		};
		store.set(clientId, entry);
	}

	// Increment counter
	entry.count++;

	const allowed = entry.count <= config.maxRequests;
	const remaining = Math.max(0, config.maxRequests - entry.count);

	return {
		allowed,
		remaining,
		resetAt: entry.resetAt,
	};
}

/**
 * Require rate limit or throw 429
 */
export function requireRateLimit(
	request: Request,
	config: RateLimitConfig,
	userId?: string
): { remaining: number; resetAt: number } {
	const result = checkRateLimit(request, config, userId);

	if (!result.allowed) {
		const resetInSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
		throw new Response(
			JSON.stringify({
				error: "Rate limit exceeded",
				message: `Maximum ${config.maxRequests} requests per ${config.windowSeconds}s`,
				retryAfter: resetInSeconds,
			}),
			{
				status: 429,
				headers: {
					"Retry-After": String(resetInSeconds),
					"X-RateLimit-Limit": String(config.maxRequests),
					"X-RateLimit-Remaining": String(result.remaining),
					"X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
				},
			}
		);
	}

	return {
		remaining: result.remaining,
		resetAt: result.resetAt,
	};
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
	response: Response,
	config: RateLimitConfig,
	remaining: number,
	resetAt: number
): Response {
	const headers = new Headers(response.headers);
	headers.set("X-RateLimit-Limit", String(config.maxRequests));
	headers.set("X-RateLimit-Remaining", String(remaining));
	headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Usage example:
 *
 * ```typescript
 * import { requireRateLimit, rateLimitConfigs } from '../../server/rate-limit-middleware';
 * import { requireAuth } from '../../server/auth-middleware';
 *
 * export const Route = createAPIFileRoute("/api/search")({
 *   handlers: {
 *     GET: async ({ request }) => {
 *       const auth = requireAuth(request);
 *       const rateLimitResult = requireRateLimit(request, rateLimitConfigs.search, auth.userId);
 *
 *       // ... perform search ...
 *
 *       const response = Response.json({ results: [...] });
 *       return addRateLimitHeaders(response, rateLimitConfigs.search, rateLimitResult.remaining, rateLimitResult.resetAt);
 *     }
 *   }
 * });
 * ```
 */
